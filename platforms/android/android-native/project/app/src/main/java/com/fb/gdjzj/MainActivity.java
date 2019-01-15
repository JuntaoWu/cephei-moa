package com.fb.gdjzj;

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
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;

import org.egret.egretnativeandroid.EgretNativeAndroid;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import com.fb.gdjzj.wxapi.WXEntryActivity;
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

    public static final String EXTRA_MESSAGE = "com.fb.gdjzj.MESSAGE";

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
        try {
            if (!nativeAndroid.initialize("http://tool.egret-labs.org/Weiduan/game/index.html")) {
                Toast.makeText(this, "Initialize native failed.",
                        Toast.LENGTH_LONG).show();
                return;
            }
        }
        catch (Exception ex) {
            Log.e(TAG, ex.toString());
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
            Log.d(TAG, "sendShowToastToNative");
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
        });

        nativeAndroid.setExternalInterface("sendHideToastToNative", (String message) -> {
            Log.d(TAG, "sendHideToastToNative");
            // do nothing in android.
        });

        nativeAndroid.setExternalInterface("sendOpenExternalLinkToNative", (String message) -> {
            Log.d(TAG, "sendOpenExternalLinkToNative");
            //Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(message));
            //startActivity(intent);
            Intent intent = new Intent(this, TestActivity.class);
            intent.putExtra(EXTRA_MESSAGE, message);
            startActivityForResult(intent, 10001);
        });

        nativeAndroid.setExternalInterface("sendShowLoadingToNative", (String message) -> {
            Log.d(TAG, "sendShowLoadingToNative");
            //Intent intent = new Intent(this, TestActivity.class);
            //startActivityForResult(intent, 10001);
        });

        nativeAndroid.setExternalInterface("sendHideLoadingToNative", (String message) -> {
            Log.d(TAG, "sendHideLoadingToNative");
            //finishActivity(10001);
        });

        nativeAndroid.setExternalInterface("sendCheckIfWeChatInstalledToNative", (String message) -> {
            Log.d(TAG, "sendCheckIfWeChatInstalledToNative");
            String isWxAppInstalled = api.isWXAppInstalled() ? "1" : "0";

            nativeAndroid.callExternalInterface("sendCheckIfWeChatInstalledToNativeCallback", isWxAppInstalled);
        });

        nativeAndroid.setExternalInterface("sendSetupIMToNative", (String message) -> {
            Log.d(TAG, "sendSetupIMToNative");

            setupIM();
        });

        nativeAndroid.setExternalInterface("sendQuitIMToNative", (String message) -> {
            Log.d(TAG, "sendQuitIMToNative");

            // pop to root view controller.
        });

        nativeAndroid.setExternalInterface("sendLoginIMToNative", (String message) -> {
            Log.d(TAG, "sendLoginIMToNative");

            // todo: login IM
        });

        nativeAndroid.setExternalInterface("sendCreateGroupSessionToNative", (String message) -> {
            Log.d(TAG, "sendCreateGroupSessionToNative");

            // todo: create Group Chat

            String teamId = "";
            nativeAndroid.callExternalInterface("sendCreateGroupSessionToNativeCallback", teamId);
        });

        nativeAndroid.setExternalInterface("sendOpenGroupSessionToNative", (String message) -> {
            Log.d(TAG, "sendOpenGroupSessionToNative");

            // todo: open Group Chat

        });
    }

    private void setupIM() {

    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }
}
