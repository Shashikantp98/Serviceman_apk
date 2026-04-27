package com.instasevak.sevak;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();

        // Spoof User-Agent so Razorpay doesn't detect WebView and hide UPI
        String defaultUA = this.bridge.getWebView().getSettings().getUserAgentString();
        String chromeUA = defaultUA.replace("; wv", "").replace("Version/4.0 ", "");
        this.bridge.getWebView().getSettings().setUserAgentString(chromeUA);

        // Allow UPI intent URLs (for Razorpay UPI payments) in WebView
        this.bridge.getWebView().setWebViewClient(new BridgeWebViewClient(this.bridge) {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("intent://") || url.startsWith("upi://") || url.startsWith("tez://") || url.startsWith("phonepe://") || url.startsWith("paytmmp://")) {
                    try {
                        Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        try {
                            startActivity(intent);
                        } catch (android.content.ActivityNotFoundException e) {
                            // App not installed — try fallback URL
                            String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                            if (fallbackUrl != null) {
                                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl)));
                            }
                        }
                        return true;
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                return super.shouldOverrideUrlLoading(view, request);
            }
        });
    }

    private void createNotificationChannel() {
        // Create the NotificationChannel for Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "High Priority Notifications";
            String description = "Important notifications that pop up on screen";
            int importance = NotificationManager.IMPORTANCE_HIGH; // For heads-up notifications
            NotificationChannel channel = new NotificationChannel("fcm_default_channel", name, importance);
            channel.setDescription(description);
            channel.enableVibration(true);
            channel.enableLights(true);
            channel.setLightColor(0xFFFF0000);
            channel.setShowBadge(true);
            
            // Register the channel with the system
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
}
