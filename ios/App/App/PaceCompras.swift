import UIKit
import StoreKit
import Capacitor

/// La compra de PACE completo con Apple, sin servidor y sin piezas de terceros (Ez, D-9 A del
/// 11 nov. 2026; código propio, 18 nov.), con la misma forma que PaceCompras.java: la web
/// (app/state-compra.apps.js) decide cuándo preguntar y qué decir.
///
/// SEGURO SIN SERVIDOR: Apple firma cada transacción y StoreKit 2 comprueba la firma en el
/// iPhone; aquí solo cuentan las `.verified` y sin `revocationDate` (una devolución la revoca).
/// Cada transacción se termina (`finish`) al contarla.
///
/// LA PRUEBA DE 7 DÍAS es la oferta de introducción de la mensual: solo se dice si Apple dice
/// que a esta persona le toca (`isEligibleForIntroOffer`). Restaurar es `AppStore.sync()`
/// (norma 3.1.1). Los códigos de oferta de los testers se canjean en la ventana de Apple
/// (`presentOfferCodeRedeemSheet`, desde iOS 16.3) y lo comprado fuera de la app llega por
/// `Transaction.updates`, que se cuenta a la web con el evento «compras».
/// Lo registra `PacePuente` (PaceViewController.swift).
@objc(PaceCompras)
public class PaceCompras: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PaceCompras"
    public let jsName = "PaceCompras"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "productos", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "compras", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "comprar", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restaurar", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "gestionar", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "canjear", returnType: CAPPluginReturnPromise)
    ]

    private var oyente: Task<Void, Never>?
    private var ultimosIds: [String: String] = [:]

    override public func load() {
        oyente = Task.detached { [weak self] in
            for await resultado in Transaction.updates {
                guard case .verified(let t) = resultado else { continue }
                await t.finish()
                guard let self = self, !self.ultimosIds.isEmpty else { continue }
                let lista = await self.todas(self.ultimosIds)
                self.notifyListeners("compras", data: ["compras": lista])
            }
        }
    }

    deinit { oyente?.cancel() }

    private func ids(_ call: CAPPluginCall) -> [String: String] {
        let o = call.getObject("ids") ?? [:]
        var r: [String: String] = [:]
        if let v = o["vida"] as? String { r["vida"] = v }
        if let m = o["mes"] as? String { r["mes"] = m }
        return r
    }

    private func dias(_ periodo: Product.SubscriptionPeriod) -> Int {
        switch periodo.unit {
        case .day: return periodo.value
        case .week: return periodo.value * 7
        case .month: return periodo.value * 30
        case .year: return periodo.value * 365
        @unknown default: return 0
        }
    }

    /// Los días gratis de la mensual, solo si Apple dice que a esta persona le tocan.
    private func diasGratis(_ p: Product) async -> Int {
        guard let sub = p.subscription, let intro = sub.introductoryOffer, intro.paymentMode == .freeTrial else { return 0 }
        return await sub.isEligibleForIntroOffer ? dias(intro.period) : 0
    }

    @objc func productos(_ call: CAPPluginCall) {
        let ids = self.ids(call)
        ultimosIds = ids
        Task {
            do {
                let lista = try await Product.products(for: Array(ids.values))
                var res: [[String: Any]] = []
                for p in lista {
                    let plan = p.id == ids["vida"] ? "vida" : p.id == ids["mes"] ? "mes" : nil
                    guard let plan = plan else { continue }
                    var o: [String: Any] = ["plan": plan, "texto": p.displayPrice,
                                            "importe": NSDecimalNumber(decimal: p.price).doubleValue,
                                            "moneda": p.priceFormatStyle.currencyCode]
                    if plan == "mes" {
                        let gratis = await diasGratis(p)
                        if gratis > 0 { o["pruebaDias"] = gratis }
                    }
                    res.append(o)
                }
                call.resolve(["productos": res])
            } catch {
                call.reject("Apple no dio los productos")
            }
        }
    }

    /// Lo que abre PACE completo ahora: lo verificado, sin revocar y sin caducar.
    private func todas(_ ids: [String: String]) async -> [[String: Any]] {
        var lista: [[String: Any]] = []
        for await resultado in Transaction.currentEntitlements {
            guard case .verified(let t) = resultado, t.revocationDate == nil else { continue }
            let plan = t.productID == ids["vida"] ? "vida" : t.productID == ids["mes"] ? "mes" : nil
            guard let plan = plan else { continue }
            lista.append(await leer(t, plan: plan))
        }
        return lista
    }

    private func leer(_ t: Transaction, plan: String) async -> [String: Any] {
        var c: [String: Any] = ["plan": plan, "desde": t.purchaseDate.timeIntervalSince1970 * 1000]
        guard plan == "mes" else { return c }
        if let fin = t.expirationDate { c["hasta"] = fin.timeIntervalSince1970 * 1000 }
        c["prueba"] = t.offerType == .introductory
        if let p = try? await Product.products(for: [t.productID]).first,
           let estados = try? await p.subscription?.status {
            for e in estados {
                if case .verified(let r) = e.renewalInfo, r.currentProductID == t.productID { c["renueva"] = r.willAutoRenew }
            }
        }
        return c
    }

    @objc func compras(_ call: CAPPluginCall) {
        let ids = self.ids(call)
        ultimosIds = ids
        Task { call.resolve(["compras": await todas(ids)]) }
    }

    @objc func restaurar(_ call: CAPPluginCall) {
        let ids = self.ids(call)
        ultimosIds = ids
        Task {
            do {
                try await AppStore.sync()
                call.resolve(["compras": await todas(ids)])
            } catch {
                call.reject("Apple no pudo restaurar")
            }
        }
    }

    @objc func comprar(_ call: CAPPluginCall) {
        let ids = self.ids(call)
        guard let plan = call.getString("plan"), let id = ids[plan] else { call.reject("Sin producto"); return }
        ultimosIds = ids
        Task {
            do {
                guard let p = try await Product.products(for: [id]).first else { call.resolve(["estado": "error"]); return }
                switch try await p.purchase() {
                case .success(let resultado):
                    guard case .verified(let t) = resultado, t.revocationDate == nil else { call.resolve(["estado": "error"]); return }
                    await t.finish()
                    call.resolve(["estado": "comprado", "compra": await leer(t, plan: plan)])
                case .pending:
                    call.resolve(["estado": "pendiente"])
                case .userCancelled:
                    call.resolve(["estado": "cancelado"])
                @unknown default:
                    call.resolve(["estado": "error"])
                }
            } catch {
                call.resolve(["estado": "error"])
            }
        }
    }

    @objc func gestionar(_ call: CAPPluginCall) {
        Task { @MainActor [weak self] in
            guard let escena = self?.bridge?.viewController?.view.window?.windowScene else { call.reject("Sin escena"); return }
            try? await AppStore.showManageSubscriptions(in: escena)
            call.resolve()
        }
    }

    @objc func canjear(_ call: CAPPluginCall) {
        Task { @MainActor [weak self] in
            guard let escena = self?.bridge?.viewController?.view.window?.windowScene else { call.reject("Sin escena"); return }
            try? await AppStore.presentOfferCodeRedeemSheet(in: escena)
            call.resolve()
        }
    }
}
