import UIKit
import Capacitor

/// La web de PACE va entre las barras del sistema, como en Android: arriba queda
/// la hora con la isla o el notch, abajo la barra de inicio, y las dos franjas
/// llevan el papel de PACE (`PaceFondo`, el crema o el oscuro según el modo del
/// iPhone). Así la web no necesita `viewport-fit=cover` ni saber de zonas
/// seguras, y la home que la suite mide sin scroll en Safari mide lo mismo aquí.
///
/// Capacitor hace de su `WKWebView` la vista entera de `CAPBridgeViewController`
/// (su `loadView` es `final`), así que no se puede encoger desde dentro: este
/// controlador lo lleva como hijo y lo ata a la zona segura.
class PaceViewController: UIViewController {
    private let puente = CAPBridgeViewController()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(named: "PaceFondo")

        addChild(puente)
        let web: UIView = puente.view
        web.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(web)
        let zona = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            web.topAnchor.constraint(equalTo: zona.topAnchor),
            web.bottomAnchor.constraint(equalTo: zona.bottomAnchor),
            web.leadingAnchor.constraint(equalTo: zona.leadingAnchor),
            web.trailingAnchor.constraint(equalTo: zona.trailingAnchor)
        ])
        puente.didMove(toParent: self)

        // Hasta que la web pinta se ve el papel, y no el blanco o el negro del sistema.
        if let webView = puente.webView {
            webView.isOpaque = false
            webView.backgroundColor = .clear
            webView.scrollView.backgroundColor = .clear
        }
    }

    // La hora y la batería siguen al modo del iPhone, como las barras de Android:
    // oscuras sobre el crema y claras sobre el oscuro, aunque en Ajustes de PACE
    // se haya fijado la otra paleta.
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .default
    }
}
