package com.ezradesign.pace;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.os.Build;
import android.view.View;
import android.view.Window;
import androidx.core.content.ContextCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Las franjas de arriba (la hora y la bateria) y de abajo (Atras) con la paleta que se ve en PACE.
 *
 * Sin esto las pinta el SystemBars de Capacitor con el fondo del tema, que sale de values/ o de
 * values-night/ segun el modo del movil: con PACE en oscuro y el movil en claro salian claras. La web
 * dice aqui que paleta se ve (app/ui/android.js) cada vez que cambia, y esto pinta su papel y pone los
 * iconos del sistema en el tono que se lee encima.
 *
 * SystemBars vuelve a pintar con el tema al girar el movil o cambiar su modo, porque la actividad atiende
 * esos cambios sin rehacerse: por eso se repinta despues, en el hilo principal, cuando ya ha pasado.
 *
 * La paleta elegida a mano se guarda para el arranque siguiente, que pinta antes de que la web hable. Con
 * «Auto» no se guarda nada: entonces manda el modo del movil, que es lo que Auto va a elegir.
 */
@CapacitorPlugin(name = "PaceBarras")
public class PaceBarras extends Plugin {

    private static final String PREFERENCIAS = "pace.barras";
    private static final String CLAVE = "paleta";

    // "crema", "oscuro" o null: con null mandan el tema y el modo del movil.
    private String paleta = null;

    @Override
    public void load() {
        paleta = preferencias().getString(CLAVE, null);
        // Despues de SystemBars, que se carga antes y pinta con el tema en su propia vuelta.
        if (paleta != null) getBridge().executeOnMainThread(this::aplicar);
    }

    @PluginMethod
    public void pintar(PluginCall call) {
        String pedida = call.getString("paleta", "");
        if (!"crema".equals(pedida) && !"oscuro".equals(pedida)) {
            call.reject("Paleta desconocida: " + pedida);
            return;
        }
        boolean auto = Boolean.TRUE.equals(call.getBoolean("auto", false));
        paleta = pedida;
        SharedPreferences.Editor editor = preferencias().edit();
        if (auto) editor.remove(CLAVE);
        else editor.putString(CLAVE, pedida);
        editor.apply();
        getBridge().executeOnMainThread(() -> {
            aplicar();
            call.resolve();
        });
    }

    @Override
    protected void handleOnConfigurationChanged(Configuration newConfig) {
        super.handleOnConfigurationChanged(newConfig);
        if (paleta != null) getBridge().executeOnMainThread(this::aplicar);
    }

    private void aplicar() {
        if (paleta == null || getActivity() == null) return;
        boolean oscuro = "oscuro".equals(paleta);
        int papel = ContextCompat.getColor(getContext(), oscuro ? R.color.pace_papel_oscuro : R.color.pace_papel_crema);
        Window ventana = getActivity().getWindow();
        View decor = ventana.getDecorView();
        // La franja es el fondo de la ventana que asoma por el margen que SystemBars deja a las barras.
        decor.setBackgroundColor(papel);
        // Hasta Android 14 las barras tienen ademas su propio color; desde el 15 no existe.
        if (Build.VERSION.SDK_INT < 35) {
            ventana.setStatusBarColor(papel);
            ventana.setNavigationBarColor(papel);
        }
        WindowInsetsControllerCompat barras = WindowCompat.getInsetsController(ventana, decor);
        barras.setAppearanceLightStatusBars(!oscuro);
        barras.setAppearanceLightNavigationBars(!oscuro);
    }

    private SharedPreferences preferencias() {
        return getContext().getSharedPreferences(PREFERENCIAS, Context.MODE_PRIVATE);
    }
}
