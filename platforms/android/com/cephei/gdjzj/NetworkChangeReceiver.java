package com.toolbar.childar;

import android.content.BroadcastReceiver;
import  android.content.Context;
import android.content.Intent;
import android.widget.Toast;

import static com.toolbar.childar.MainActivity.*;

/**
 * Created by Juntao on 11/22/2018.
 */

public class NetworkChangeReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(final Context context, final Intent intent) {

        String status = NetworkUtil.getConnectivityStatusString(context);
        Integer statusCode = NetworkUtil.getConnectivityStatus(context);

        Toast.makeText(context, status, Toast.LENGTH_SHORT).show();

        nativeAndroid.callExternalInterface("sendNetworkStatusChangeToJS", statusCode.toString());
    }
}
