import UIKit
import StoreKit
import Capacitor

/// La ventana de Apple para valorar PACE, con las mismas reglas que la de Google Play
/// (PaceValoracion.java): la web decide cuándo (app/ui/valoracion.js: al cerrar la pantalla
/// final de la quinta pausa entera, nunca en la bienvenida) y apunta que ya la pidió antes de
/// llamar aquí. Apple decide si la enseña (como mucho tres veces al año a cada persona) y no
/// dice si salió ni qué pasó, así que esto contesta siempre que ha terminado.
///
/// `AppStore.requestReview(in:)` es la de SKStoreReviewController desde iOS 16, que es el
/// mínimo de la app; la vieja está en desuso desde iOS 18. Va en el hilo principal porque
/// pinta encima de la escena. Lo registra `PacePuente` (PaceViewController.swift).
@objc(PaceValoracion)
public class PaceValoracion: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PaceValoracion"
    public let jsName = "PaceValoracion"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "pedir", returnType: CAPPluginReturnPromise)
    ]

    @objc func pedir(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let escena = self?.bridge?.viewController?.view.window?.windowScene else {
                call.reject("Sin escena a la que pegar la ventana")
                return
            }
            AppStore.requestReview(in: escena)
            call.resolve()
        }
    }
}
