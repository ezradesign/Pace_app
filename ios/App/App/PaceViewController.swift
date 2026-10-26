import UIKit
import WebKit
import Capacitor

/// La web de PACE va entre las barras del sistema, como en Android: arriba queda
/// la hora con la isla o el notch, abajo la barra de inicio, y las dos franjas
/// llevan el papel de la paleta que se ve en PACE. Así la web no necesita
/// `viewport-fit=cover` ni saber de zonas seguras, y la home que la suite mide
/// sin scroll en Safari mide lo mismo aquí.
///
/// Capacitor hace de su `WKWebView` la vista entera de `CAPBridgeViewController`
/// (su `loadView` es `final`), así que no se puede encoger desde dentro: este
/// controlador lo lleva como hijo y lo ata a la zona segura.
class PaceViewController: UIViewController {
    private let puente = CAPBridgeViewController()
    private var vigiaPapel: NSKeyValueObservation?
    private var estiloBarra: UIStatusBarStyle = .default

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

            // La web pone en su `theme-color` el papel de la paleta que se ve, también
            // al cambiarla en Ajustes o con «Auto» (state-core.palette.jsx), y el
            // WKWebView avisa cada vez que cambia.
            vigiaPapel = webView.observe(\.themeColor, options: [.initial, .new]) { [weak self] web, _ in
                let papel = web.themeColor
                DispatchQueue.main.async { self?.pintarFranjas(papel) }
            }
        }
    }

    /// Las franjas con el papel de PACE y la hora y la batería en el tono que se
    /// lee encima, aunque el iPhone esté en el otro modo. Sin `theme-color`
    /// todavía, el papel del modo del iPhone (`PaceFondo`).
    private func pintarFranjas(_ papel: UIColor?) {
        guard let papel = papel else {
            view.backgroundColor = UIColor(named: "PaceFondo")
            estiloBarra = .default
            setNeedsStatusBarAppearanceUpdate()
            return
        }
        var rojo: CGFloat = 0, verde: CGFloat = 0, azul: CGFloat = 0, alfa: CGFloat = 0
        let oscuro = papel.getRed(&rojo, green: &verde, blue: &azul, alpha: &alfa)
            && 0.2126 * rojo + 0.7152 * verde + 0.0722 * azul < 0.5
        view.backgroundColor = papel
        estiloBarra = oscuro ? .lightContent : .darkContent
        setNeedsStatusBarAppearanceUpdate()
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return estiloBarra
    }
}
