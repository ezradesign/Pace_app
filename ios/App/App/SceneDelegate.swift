import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        // PACE lleva la web dentro de la zona segura (PaceViewController.swift).
        window?.rootViewController = PaceViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)

        // Abierta en frío desde un atajo del icono: se pasa en la vuelta siguiente, cuando el
        // puente y el complemento App ya escuchan. App guarda el aviso hasta que la web lo recoge.
        if let atajo = connectionOptions.shortcutItem {
            DispatchQueue.main.async { _ = self.abrirAtajo(atajo) }
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }

    // Los atajos al mantener pulsado el icono (Ez, L7A del 25 nov. 2026; Info.plist,
    // UIApplicationShortcutItems). Con PACE ya abierta llegan aquí.
    func windowScene(_ windowScene: UIWindowScene, performActionFor shortcutItem: UIApplicationShortcutItem,
                     completionHandler: @escaping (Bool) -> Void) {
        completionHandler(abrirAtajo(shortcutItem))
    }

    // `com.ezradesign.pace.breathe` pasa a la web como `pace://go/breathe`, por el mismo camino que
    // un enlace (el aviso `appUrlOpen` del complemento App). app/ui/nativo.atajos.js lo abre como ?go=.
    private func abrirAtajo(_ item: UIApplicationShortcutItem) -> Bool {
        let prefijo = "com.ezradesign.pace."
        guard item.type.hasPrefix(prefijo) else { return false }
        let tipo = String(item.type.dropFirst(prefijo.count))
        guard let url = URL(string: "pace://go/" + tipo) else { return false }
        return ApplicationDelegateProxy.shared.application(UIApplication.shared, open: url, options: [:])
    }
}
