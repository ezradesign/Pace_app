package com.ezradesign.pace;

import android.Manifest;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.CalendarContract;
import androidx.core.content.ContextCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Lo que PACE escribe en el calendario del movil, privado.
 *
 * Google, Outlook y el archivo ya lo llevan privado (visibility, sensitivity, CLASS): quien solo
 * puede ver tu calendario te ve libre y no lee que pausa es (Ez, 1A del 26 oct. 2026). El
 * complemento CapacitorCalendar crea y cambia los eventos, pero no sabe poner ACCESS_LEVEL. Esto lo
 * pone despues, sobre el evento que el complemento acaba de crear o de cambiar
 * (app/ui/android.calendario.js); la cuenta que sincroniza ese calendario lo sube como privado.
 *
 * Usa el permiso de escribir en el calendario que ya pidio el complemento; sin el, falla, y la web
 * lo cuenta como «No se pudo».
 */
@CapacitorPlugin(name = "PaceCalendario")
public class PaceCalendario extends Plugin {

    @PluginMethod
    public void privado(PluginCall call) {
        String id = call.getString("id", "");
        long evento;
        try {
            evento = Long.parseLong(id);
        } catch (NumberFormatException e) {
            call.reject("Id de evento no valido: " + id);
            return;
        }
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.WRITE_CALENDAR) != PackageManager.PERMISSION_GRANTED) {
            call.reject("Sin permiso para escribir en el calendario");
            return;
        }
        ContentValues valores = new ContentValues();
        valores.put(CalendarContract.Events.ACCESS_LEVEL, CalendarContract.Events.ACCESS_PRIVATE);
        Uri uri = ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, evento);
        try {
            int cambiados = getContext().getContentResolver().update(uri, valores, null, null);
            if (cambiados < 1) {
                call.reject("El evento no esta en el calendario: " + id);
                return;
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("No se pudo marcar privado", e);
        }
    }
}
