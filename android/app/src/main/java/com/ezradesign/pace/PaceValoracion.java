package com.ezradesign.pace;

import android.app.Activity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;

/**
 * La ventana de Google Play para valorar PACE (In-App Review), una sola vez en la vida de la app.
 *
 * La web decide cuando (app/ui/valoracion.js: al cerrar la pantalla final de la quinta pausa entera,
 * nunca en la bienvenida) y apunta que ya la pidio antes de llamar aqui, porque Google no dice si la
 * persona valoro, la cerro o si la ventana llego a salir: tiene su propio tope y a veces no la ensena.
 * Por eso esto contesta siempre que ha terminado y nunca que «salio».
 *
 * Todo va en el hilo principal: launchReviewFlow pinta encima de la actividad.
 */
@CapacitorPlugin(name = "PaceValoracion")
public class PaceValoracion extends Plugin {

    @PluginMethod
    public void pedir(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            Activity actividad = getActivity();
            if (actividad == null) {
                call.reject("Sin actividad a la que pegar la ventana");
                return;
            }
            ReviewManager gestor = ReviewManagerFactory.create(getContext());
            gestor.requestReviewFlow().addOnCompleteListener(peticion -> {
                if (!peticion.isSuccessful()) {
                    call.reject("Google Play no dio la ventana", peticion.getException());
                    return;
                }
                ReviewInfo info = peticion.getResult();
                gestor.launchReviewFlow(actividad, info).addOnCompleteListener(flujo -> call.resolve());
            });
        });
    }
}
