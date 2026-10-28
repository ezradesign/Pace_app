package com.ezradesign.pace;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * El aviso fijo con el movil bloqueado mientras corre un Foco (Ez, N4 A del 27 oct. 2026).
 *
 * Con PACE en el fondo Android congela su JS, asi que la web no puede ir cambiando un aviso. Este
 * lleva la cuenta atras del propio Android (setUsesChronometer con setChronometerCountDown, hacia
 * `hasta`), que corre sola sin despertar a PACE, y se quita solo al acabar el bloque
 * (setTimeoutAfter): en ese momento llega el aviso de fin (LocalNotifications, id 1), que es el
 * unico que suena. Este va en su canal, sin sonido ni vibracion, y se ve con el movil bloqueado.
 *
 * Lo pone y lo quita app/ui/android.avisos.js: al irse al fondo con un Foco en marcha, y al volver,
 * al pausar o al reiniciar. Tocarlo abre PACE.
 *
 * SIN BOTONES por ahora (la A de Ez). Cuando se monten (la C: «Pausar» con el movil bloqueado), van
 * en `construir` con addAction, cada uno con un PendingIntent a un receptor de esta app que apunte
 * la accion para que la web la lea al volver: con PACE dormida, nadie mas puede pausar el bloque.
 */
@CapacitorPlugin(name = "PaceAvisoFijo")
public class PaceAvisoFijo extends Plugin {

    // Otro id que el aviso de fin (1): asi el de fin no lo pisa ni lo quita al cancelarse.
    static final int ID = 2;
    static final String CANAL = "pace_foco_en_marcha";

    @Override
    public void load() {
        crearCanal();
    }

    @PluginMethod
    public void poner(PluginCall call) {
        String titulo = call.getString("titulo", "PACE");
        String texto = call.getString("texto", "");
        Long hasta = call.getLong("hasta");
        long ahora = System.currentTimeMillis();
        if (hasta == null || hasta <= ahora) {
            call.reject("El bloque no tiene final o ya ha acabado");
            return;
        }
        NotificationManagerCompat avisos = NotificationManagerCompat.from(getContext());
        // El mismo texto que el complemento de avisos: la web lo lee como permiso apagado.
        if (!avisos.areNotificationsEnabled()) {
            call.reject("Notifications are not enabled on this device.");
            return;
        }
        try {
            avisos.notify(ID, construir(titulo, texto, hasta, ahora).build());
            call.resolve();
        } catch (SecurityException e) {
            call.reject("Notifications are not enabled on this device.", e);
        }
    }

    @PluginMethod
    public void quitar(PluginCall call) {
        NotificationManagerCompat.from(getContext()).cancel(ID);
        call.resolve();
    }

    private NotificationCompat.Builder construir(String titulo, String texto, long hasta, long ahora) {
        return new NotificationCompat.Builder(getContext(), CANAL)
            .setSmallIcon(R.drawable.pace_aviso)
            .setColor(ContextCompat.getColor(getContext(), R.color.pace_aviso))
            .setContentTitle(titulo)
            .setContentText(texto)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(texto))
            // La cuenta atras: Android pinta lo que falta hasta `hasta` y la mueve el solo.
            .setWhen(hasta)
            .setShowWhen(true)
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            .setTimeoutAfter(hasta - ahora)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(abrirPace());
    }

    private PendingIntent abrirPace() {
        Context ctx = getContext();
        Intent abrir = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
        if (abrir == null) abrir = new Intent(ctx, MainActivity.class);
        abrir.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(ctx, ID, abrir, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    // Importancia normal y sin sonido: con «baja», Android esconde el aviso con el movil bloqueado.
    private void crearCanal() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        Context ctx = getContext();
        NotificationChannel canal = new NotificationChannel(CANAL, ctx.getString(R.string.pace_canal_foco), NotificationManager.IMPORTANCE_DEFAULT);
        canal.setDescription(ctx.getString(R.string.pace_canal_foco_texto));
        canal.setSound(null, null);
        canal.enableVibration(false);
        canal.setShowBadge(false);
        canal.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        NotificationManager gestor = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (gestor != null) gestor.createNotificationChannel(canal);
    }
}
