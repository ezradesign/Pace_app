package com.ezradesign.pace;

import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * La compra de PACE completo en Google Play, sin servidor y sin piezas de terceros (Ez, D-9 A del
 * 11 nov. 2026; código propio, 18 nov.). La web (app/state-compra.apps.js) decide cuándo preguntar
 * y qué decir; aquí solo se habla con Google.
 *
 * SEGURO SIN SERVIDOR: una compra solo vale si su firma de Google se comprueba con la clave de
 * licencia de Play Console (pública, la manda la web en `clave`); sin clave, ninguna vale. Una
 * compra pendiente (pagos en efectivo) se cuenta como pendiente y nunca abre nada. Cada compra se
 * confirma (`acknowledgePurchase`), al comprar y en cada pregunta: sin eso, Google la devuelve sola
 * a los tres días.
 *
 * LA PRUEBA DE 7 DÍAS es una oferta del plan base mensual (`oferta`): Google solo la da a quien
 * aún puede tenerla, y si no la da, se compra el plan base. Lo que pasa fuera de la app (un código
 * promocional canjeado, un pago que se confirma) llega por el evento «compras».
 *
 * Biblioteca de cobro 9 (Play pide la 8 o más desde el 1 nov. 2026).
 */
@CapacitorPlugin(name = "PaceCompras")
public class PaceCompras extends Plugin implements PurchasesUpdatedListener {

    private BillingClient cliente;
    private final Map<String, ProductDetails> detalles = new HashMap<>();
    private PluginCall compraEnCurso;
    private JSObject ultimoPedido;
    private JSObject pedidoEnCurso;
    private int diasPruebaEnCurso;

    private interface Listo { void hecho(boolean ok); }

    /* UNA SOLA CONEXIÓN A LA VEZ (Ez, 3A del 21 nov. 2026; auditoría de la 0.212.0, nº 2). La biblioteca
       de cobro rechaza al momento un `startConnection` que llega mientras otro aún conecta: si dos
       preguntas llegaban juntas en el primer arranque (lo comprado y los precios), la segunda fallaba
       y la hoja decía «No se pudieron cargar los precios». Las que llegan mientras conecta esperan a
       esa misma conexión. Si se cae antes de acabar, las que esperan oyen que no y la siguiente
       pregunta conecta de nuevo. La web, además, pregunta una cosa detrás de otra. */
    private final List<Listo> esperando = new ArrayList<>();
    private boolean conectando = false;

    private void conectar(Listo listo) {
        if (cliente == null) {
            cliente = BillingClient.newBuilder(getContext())
                .setListener(this)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                .build();
        }
        if (cliente.isReady()) { listo.hecho(true); return; }
        synchronized (esperando) {
            esperando.add(listo);
            if (conectando) return;
            conectando = true;
        }
        cliente.startConnection(new BillingClientStateListener() {
            @Override public void onBillingSetupFinished(BillingResult r) {
                avisarEsperando(r.getResponseCode() == BillingClient.BillingResponseCode.OK);
            }
            @Override public void onBillingServiceDisconnected() { avisarEsperando(false); }
        });
    }

    private void avisarEsperando(boolean ok) {
        List<Listo> lista;
        synchronized (esperando) {
            conectando = false;
            lista = new ArrayList<>(esperando);
            esperando.clear();
        }
        for (Listo l : lista) l.hecho(ok);
    }

    private static String id(PluginCall call, String plan) {
        JSObject ids = call.getObject("ids", new JSObject());
        return ids == null ? null : ids.getString(plan);
    }

    /* «P7D», «P1W», «P1M» -> días. */
    private static int dias(String periodo) {
        if (periodo == null) return 0;
        Matcher m = Pattern.compile("P(\\d+)([DWMY])").matcher(periodo);
        if (!m.find()) return 0;
        int n = Integer.parseInt(m.group(1));
        switch (m.group(2)) {
            case "D": return n;
            case "W": return n * 7;
            case "M": return n * 30;
            default: return n * 365;
        }
    }

    private ProductDetails.SubscriptionOfferDetails plan(ProductDetails pd, String planBase, String oferta) {
        List<ProductDetails.SubscriptionOfferDetails> lista = pd.getSubscriptionOfferDetails();
        if (lista == null) return null;
        for (ProductDetails.SubscriptionOfferDetails o : lista) {
            if (!planBase.equals(o.getBasePlanId())) continue;
            if (oferta == null ? o.getOfferId() == null : oferta.equals(o.getOfferId())) return o;
        }
        return null;
    }

    /* Los días gratis de la oferta, si Google se la da a esta persona y su primera fase vale 0. */
    private int diasGratis(ProductDetails pd, String planBase, String oferta) {
        if (oferta == null) return 0;
        ProductDetails.SubscriptionOfferDetails o = plan(pd, planBase, oferta);
        if (o == null) return 0;
        List<ProductDetails.PricingPhase> fases = o.getPricingPhases().getPricingPhaseList();
        if (fases.isEmpty() || fases.get(0).getPriceAmountMicros() != 0) return 0;
        return dias(fases.get(0).getBillingPeriod());
    }

    private void consultar(String tipo, List<String> productos, Runnable despues) {
        List<QueryProductDetailsParams.Product> lista = new ArrayList<>();
        for (String p : productos) lista.add(QueryProductDetailsParams.Product.newBuilder().setProductId(p).setProductType(tipo).build());
        cliente.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(lista).build(), (r, resultado) -> {
            if (r.getResponseCode() == BillingClient.BillingResponseCode.OK && resultado != null) {
                for (ProductDetails pd : resultado.getProductDetailsList()) detalles.put(pd.getProductId(), pd);
            }
            despues.run();
        });
    }

    @PluginMethod
    public void productos(PluginCall call) {
        String vida = id(call, "vida"), mes = id(call, "mes");
        String planBase = call.getString("planBase", "mensual");
        String oferta = call.getString("oferta");
        conectar(ok -> {
            if (!ok) { call.reject("Google Play no contesta"); return; }
            consultar(BillingClient.ProductType.INAPP, Collections.singletonList(vida), () ->
                consultar(BillingClient.ProductType.SUBS, Collections.singletonList(mes), () -> {
                    JSArray lista = new JSArray();
                    ProductDetails pv = detalles.get(vida);
                    if (pv != null && pv.getOneTimePurchaseOfferDetails() != null) {
                        ProductDetails.OneTimePurchaseOfferDetails o = pv.getOneTimePurchaseOfferDetails();
                        JSObject p = new JSObject();
                        p.put("plan", "vida");
                        p.put("texto", o.getFormattedPrice());
                        p.put("importe", o.getPriceAmountMicros() / 1000000.0);
                        p.put("moneda", o.getPriceCurrencyCode());
                        lista.put(p);
                    }
                    ProductDetails pm = detalles.get(mes);
                    ProductDetails.SubscriptionOfferDetails base = pm == null ? null : plan(pm, planBase, null);
                    if (base != null) {
                        List<ProductDetails.PricingPhase> fases = base.getPricingPhases().getPricingPhaseList();
                        ProductDetails.PricingPhase f = fases.get(fases.size() - 1);
                        JSObject p = new JSObject();
                        p.put("plan", "mes");
                        p.put("texto", f.getFormattedPrice());
                        p.put("importe", f.getPriceAmountMicros() / 1000000.0);
                        p.put("moneda", f.getPriceCurrencyCode());
                        int gratis = diasGratis(pm, planBase, oferta);
                        if (gratis > 0) p.put("pruebaDias", gratis);
                        lista.put(p);
                    }
                    JSObject res = new JSObject();
                    res.put("productos", lista);
                    call.resolve(res);
                }));
        });
    }

    /* Lo que vale de una compra, o null: firma comprobada y de uno de los productos de PACE. */
    private JSObject leer(Purchase p, String clave, String vida, String mes, int diasPrueba) {
        if (!firmaBuena(clave, p.getOriginalJson(), p.getSignature())) return null;
        String plan = p.getProducts().contains(vida) ? "vida" : p.getProducts().contains(mes) ? "mes" : null;
        if (plan == null) return null;
        JSObject c = new JSObject();
        c.put("plan", plan);
        c.put("desde", p.getPurchaseTime());
        if (p.getPurchaseState() == Purchase.PurchaseState.PENDING) { c.put("pendiente", true); return c; }
        if (p.getPurchaseState() != Purchase.PurchaseState.PURCHASED) return null;
        if ("mes".equals(plan)) {
            c.put("renueva", p.isAutoRenewing());
            if (diasPrueba > 0) { c.put("prueba", true); c.put("hasta", p.getPurchaseTime() + diasPrueba * 86400000L); }
        }
        if (!p.isAcknowledged()) {
            cliente.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(p.getPurchaseToken()).build(), r -> { });
        }
        return c;
    }

    private interface Juntas { void hecho(JSArray compras, boolean ok); }

    private void todas(String clave, String vida, String mes, Juntas juntas) {
        JSArray compras = new JSArray();
        cliente.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(), (r1, l1) -> {
            if (r1.getResponseCode() != BillingClient.BillingResponseCode.OK) { juntas.hecho(compras, false); return; }
            for (Purchase p : l1) { JSObject c = leer(p, clave, vida, mes, 0); if (c != null) compras.put(c); }
            cliente.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.SUBS).build(), (r2, l2) -> {
                if (r2.getResponseCode() != BillingClient.BillingResponseCode.OK) { juntas.hecho(compras, false); return; }
                for (Purchase p : l2) { JSObject c = leer(p, clave, vida, mes, 0); if (c != null) compras.put(c); }
                juntas.hecho(compras, true);
            });
        });
    }

    @PluginMethod
    public void compras(PluginCall call) {
        ultimoPedido = call.getData();
        String clave = call.getString("clave"), vida = id(call, "vida"), mes = id(call, "mes");
        conectar(ok -> {
            if (!ok) { call.reject("Google Play no contesta"); return; }
            todas(clave, vida, mes, (lista, bien) -> {
                if (!bien) { call.reject("Google Play no dio las compras"); return; }
                JSObject res = new JSObject();
                res.put("compras", lista);
                call.resolve(res);
            });
        });
    }

    /* En Android la compra vuelve sola con la cuenta de Google: restaurar es volver a preguntar. */
    @PluginMethod
    public void restaurar(PluginCall call) { compras(call); }

    @PluginMethod
    public void comprar(PluginCall call) {
        String plan = call.getString("plan");
        String producto = id(call, plan);
        String planBase = call.getString("planBase", "mensual");
        String oferta = call.getString("oferta");
        if (compraEnCurso != null) { call.reject("Ya hay una compra abierta"); return; }
        conectar(ok -> {
            if (!ok) { call.reject("Google Play no contesta"); return; }
            ProductDetails pd = detalles.get(producto);
            if (pd == null) { call.reject("Sin el producto de Google Play"); return; }
            BillingFlowParams.ProductDetailsParams.Builder params = BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(pd);
            int gratis = 0;
            if ("mes".equals(plan)) {
                gratis = diasGratis(pd, planBase, oferta);
                ProductDetails.SubscriptionOfferDetails o = gratis > 0 ? plan(pd, planBase, oferta) : plan(pd, planBase, null);
                if (o == null) { call.reject("Sin el plan mensual en Google Play"); return; }
                params.setOfferToken(o.getOfferToken());
            }
            BillingFlowParams flujo = BillingFlowParams.newBuilder().setProductDetailsParamsList(Collections.singletonList(params.build())).build();
            compraEnCurso = call;
            pedidoEnCurso = call.getData();
            diasPruebaEnCurso = gratis;
            getBridge().executeOnMainThread(() -> {
                BillingResult r = cliente.launchBillingFlow(getActivity(), flujo);
                if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) terminar(r, null);
            });
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult r, List<Purchase> compras) {
        if (compraEnCurso != null) { terminar(r, compras); return; }
        /* Fuera de una compra de la app: un código canjeado, un pago que se confirma. */
        avisarFuera();
    }

    private void terminar(BillingResult r, List<Purchase> compras) {
        PluginCall call = compraEnCurso;
        JSObject pedido = pedidoEnCurso;
        int gratis = diasPruebaEnCurso;
        compraEnCurso = null;
        pedidoEnCurso = null;
        if (call == null) return;
        JSObject res = new JSObject();
        int codigo = r.getResponseCode();
        if (codigo == BillingClient.BillingResponseCode.USER_CANCELED) { res.put("estado", "cancelado"); call.resolve(res); return; }
        if (codigo != BillingClient.BillingResponseCode.OK || compras == null) { res.put("estado", "error"); call.resolve(res); return; }
        JSObject ids = pedido.getJSObject("ids");
        if (ids == null) ids = new JSObject();
        String vida = ids.getString("vida"), mes = ids.getString("mes");
        for (Purchase p : compras) {
            JSObject c = leer(p, pedido.getString("clave"), vida, mes, gratis);
            if (c == null) continue;
            res.put("estado", c.optBoolean("pendiente") ? "pendiente" : "comprado");
            res.put("compra", c);
            call.resolve(res);
            return;
        }
        res.put("estado", "error");
        call.resolve(res);
    }

    /* Lo que cambió fuera de una compra de la app se cuenta entero, como lo daría `compras`. */
    private void avisarFuera() {
        JSObject pedido = ultimoPedido;
        if (pedido == null) return;
        JSObject ids = pedido.getJSObject("ids");
        if (ids == null) return;
        conectar(ok -> {
            if (!ok) return;
            todas(pedido.getString("clave"), ids.getString("vida"), ids.getString("mes"), (lista, bien) -> {
                if (!bien) return;
                JSObject res = new JSObject();
                res.put("compras", lista);
                notifyListeners("compras", res);
            });
        });
    }

    @PluginMethod
    public void gestionar(PluginCall call) {
        String mes = id(call, "mes");
        abrir("https://play.google.com/store/account/subscriptions?sku=" + Uri.encode(mes) + "&package=" + getContext().getPackageName());
        call.resolve();
    }

    /* Los códigos promocionales se canjean en Google Play; la compra vuelve por el evento. */
    @PluginMethod
    public void canjear(PluginCall call) {
        abrir("https://play.google.com/redeem");
        call.resolve();
    }

    private void abrir(String direccion) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(direccion));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
    }

    /* La firma que Google pone a cada compra, con la clave de licencia de Play Console (RSA, X.509). */
    static boolean firmaBuena(String clave, String datos, String firma) {
        if (clave == null || clave.isEmpty() || datos == null || firma == null || firma.isEmpty()) return false;
        try {
            PublicKey llave = KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(Base64.decode(clave, Base64.DEFAULT)));
            Signature s = Signature.getInstance("SHA1withRSA");
            s.initVerify(llave);
            s.update(datos.getBytes("UTF-8"));
            return s.verify(Base64.decode(firma, Base64.DEFAULT));
        } catch (Exception e) {
            return false;
        }
    }
}
