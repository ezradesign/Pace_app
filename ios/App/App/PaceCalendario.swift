import Foundation
import Security
import Capacitor

/// Lo que el complemento del calendario (@ebarooni/capacitor-calendar, el mismo de Android) no da
/// en el iPhone, como PaceCalendario.java en Android (Ez, 4A del 16 nov. 2026):
///
/// - `instalado`: una marca de ESTE iPhone para saber si la lista de eventos que PACE puso en el
///   calendario es de aquí. Es la regla D-8 de Android: un iPhone restaurado desde una copia trae el
///   almacén de la web con los ids de los eventos de otro iPhone, y PACE borraría o cambiaría
///   reuniones de verdad. La marca vive en el llavero con «solo este dispositivo», que no viaja a
///   otro iPhone: si falta, se crea con la hora de ahora, no casa con la guardada y la web olvida la
///   lista (ritmo.calendario.destinos.js, `calendarioAndroidListo`).
/// - `privado`: contesta que no. EventKit no tiene cómo marcar un evento como privado (Google,
///   Outlook, Android y el archivo sí), y privacy.html lo dice.
///
/// Lo registra `PacePuente` (PaceViewController.swift). Para la web es Capacitor.Plugins.PaceCalendario.
@objc(PaceCalendario)
public class PaceCalendario: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PaceCalendario"
    public let jsName = "PaceCalendario"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "instalado", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "privado", returnType: CAPPluginReturnPromise)
    ]

    private let servicio = "com.ezradesign.pace.calendario"
    private let cuenta = "instalado"

    @objc func instalado(_ call: CAPPluginCall) {
        if let guardada = leer() {
            call.resolve(["instalado": guardada])
            return
        }
        let ahora = (Date().timeIntervalSince1970 * 1000).rounded()
        if guardar(ahora) {
            call.resolve(["instalado": ahora])
        } else {
            // Sin llavero no hay marca: la web lo trata como Android cuando no da la hora.
            call.resolve(["instalado": NSNull()])
        }
    }

    @objc func privado(_ call: CAPPluginCall) {
        call.resolve(["privado": false])
    }

    private func consulta() -> [String: Any] {
        return [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: servicio,
            kSecAttrAccount as String: cuenta
        ]
    }

    private func leer() -> Double? {
        var pedir = consulta()
        pedir[kSecReturnData as String] = true
        pedir[kSecMatchLimit as String] = kSecMatchLimitOne
        var dato: AnyObject?
        guard SecItemCopyMatching(pedir as CFDictionary, &dato) == errSecSuccess,
              let datos = dato as? Data,
              let texto = String(data: datos, encoding: .utf8),
              let numero = Double(texto), numero > 0 else { return nil }
        return numero
    }

    private func guardar(_ numero: Double) -> Bool {
        var nuevo = consulta()
        nuevo[kSecValueData as String] = Data(String(Int64(numero)).utf8)
        nuevo[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        return SecItemAdd(nuevo as CFDictionary, nil) == errSecSuccess
    }
}
