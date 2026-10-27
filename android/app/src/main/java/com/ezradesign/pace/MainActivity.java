package com.ezradesign.pace;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Los complementos propios de la app se registran antes de que Capacitor monte el puente.
        registerPlugin(PaceCalendario.class);
        registerPlugin(PaceBarras.class);
        super.onCreate(savedInstanceState);
    }
}
