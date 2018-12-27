package com.toolbar.childar;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.util.JsonReader;
import android.util.Log;
import android.view.KeyEvent;
import android.widget.Toast;

import org.egret.egretnativeandroid.EgretNativeAndroid;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import com.toolbar.childar.wxapi.WXEntryActivity;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

import java.util.logging.Logger;

public class MainActivity extends Activity {
    private final String TAG = "MainActivity";
    public static EgretNativeAndroid nativeAndroid;
    public static IWXAPI api;
    private static final String APP_ID = "wxa5357874f32269ac";
    private static final String SECURITY_PREFENCE = "security_preference";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        registerToWeChat();

        nativeAndroid = new EgretNativeAndroid(this);
        if (!nativeAndroid.checkGlEsVersion()) {
            Toast.makeText(this, "This device does not support OpenGL ES 2.0.",
                    Toast.LENGTH_LONG).show();
            return;
        }

        nativeAndroid.config.showFPS = false;
        nativeAndroid.config.fpsLogTime = 30;
        nativeAndroid.config.disableNativeRender = false;
        nativeAndroid.config.clearCache = false;
        nativeAndroid.config.loadingTimeout = 0;

        setExternalInterfaces();
        
        if (!nativeAndroid.initialize("http://tool.egret-labs.org/Weiduan/game/index.html")) {
            Toast.makeText(this, "Initialize native failed.",
                    Toast.LENGTH_LONG).show();
            return;
        }

        setContentView(nativeAndroid.getRootFrameLayout());
    }

    private void registerToWeChat() {
        api = WXAPIFactory.createWXAPI(this, APP_ID, true);
        api.registerApp(APP_ID);
    }

    @Override
    protected void onPause() {
        super.onPause();
        nativeAndroid.pause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        nativeAndroid.resume();
        Log.d(TAG, "onResume");
        nativeAndroid.callExternalInterface("sendOnResumeToJS", "已恢复");
    }

    @Override
    public boolean onKeyDown(final int keyCode, final KeyEvent keyEvent) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            nativeAndroid.exitGame();
        }

        return super.onKeyDown(keyCode, keyEvent);
    }

    private void setExternalInterfaces() {
        nativeAndroid.setExternalInterface("sendToNative", (String message) -> {
            String str = "Native get message: ";
            str += message;
            Log.d(TAG, str);
            nativeAndroid.callExternalInterface("sendToJS", str);
        });

        nativeAndroid.setExternalInterface("sendWxLoginToNative", (String message) -> {
            Log.d(TAG, "snsapi_userinfo");

            SendAuth.Req req = new SendAuth.Req();
            req.scope = "snsapi_userinfo";
            req.state = "wechat_sdk_demo_test";
            api.sendReq(req);
        });

        nativeAndroid.setExternalInterface("getSecurityStorageAsync", (String key) -> {
            Log.d(TAG, "getSecurityStorageAsync");

            //todo: get value from shared preference.
            SharedPreferences sharedPreferences = getSharedPreferences(SECURITY_PREFENCE, MODE_PRIVATE);
            String info = sharedPreferences.getString(key, "");
            nativeAndroid.callExternalInterface("getSecurityStorageAsyncCallback", info);
        });

        nativeAndroid.setExternalInterface("setSecurityStorageAsync", (String message) -> {
            Log.d(TAG, "setSecurityStorageAsync");
            try {
                JSONObject obj = new JSONObject(message);
                String key = obj.optString("key");
                String value = obj.optString("value");
                //todo: store value in preference.
                SharedPreferences sharedPreferences = getSharedPreferences(SECURITY_PREFENCE, MODE_PRIVATE);
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.putString(key, value);
                editor.commit();

                nativeAndroid.callExternalInterface("setSecurityStorageAsyncCallback", key);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        });

        nativeAndroid.setExternalInterface("sendShowModalToNative", (String content) -> {
            Log.d(TAG, "sendShowModalToNative");

            try {
                JSONObject obj = new JSONObject(content);

                String message = obj.optString("message");
                String confirmText = obj.optString("confirmText");
                String cancelText = obj.optString("cancelText");

                AlertDialog.Builder builder = new AlertDialog.Builder(this)
                        .setTitle("提示")
                        .setIcon(android.R.drawable.ic_dialog_info)
                        .setMessage(message)
                        .setPositiveButton(Util.isNullOrBlank(confirmText) ? "确定" : confirmText, (dialog, which) ->
                        {
                            nativeAndroid.callExternalInterface("sendShowModalResultToJS", "confirm");
                        });

                if(!Util.isNullOrBlank(cancelText)) {
                    builder.setNegativeButton(cancelText, null);
                }
                builder.show();
            }
            catch (JSONException e) {
                e.printStackTrace();
            }
        });

        nativeAndroid.setExternalInterface("sendShowToastToNative", (String message) -> {
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
        });

        nativeAndroid.setExternalInterface("sendHideToastToNative", (String message) -> {
            // do nothing in android.
        });

        nativeAndroid.setExternalInterface("sendOpenExternalLinkToNative", (String message) -> {
            Intent intent= new Intent(Intent.ACTION_VIEW, Uri.parse(message));
            startActivity(intent);
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }
}
