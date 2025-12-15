import {
  PushNotifications,
  type PushNotificationSchema,
  type Token,
} from "@capacitor/push-notifications";
import { pushNavigate } from "./PushNavigate";
import { Capacitor } from "@capacitor/core";
import ApiService from "../services/api";

  console.log("PushNotifications.ts loaded");

export const initPushNotifications = async () => {
  // Request permissions for both push and local notifications
  const pushPermissions = await PushNotifications.requestPermissions();
  if (pushPermissions.receive === "granted") {
    PushNotifications.register();
  }
  
  // Request local notification permissions
  if (Capacitor.getPlatform() !== "web") {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.requestPermissions();
      
      // Listen for local notification taps (when user taps the heads-up notification)
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Local notification tapped:', notification);
        
        const notificationData = notification.notification.extra;
        if (notificationData) {
          const { notify_type, booking_id, support_id, notification_id, route } = notificationData;

          // Mark notification as seen if notification_id is provided
          if (notification_id) {
            console.log(`Marking local notification ${notification_id} as seen`);
            ApiService.post("/user/markNotificationsAsSeen", { notification_id })
              .then(() => console.log(`Local notification ${notification_id} marked as seen`))
              .catch(err => console.error("Error marking notification as seen:", err));
          }

          // Dispatch custom event for Dashboard refresh
          if (notify_type === "booking" || notify_type === "new_booking") {
            window.dispatchEvent(new CustomEvent('newBookingReceived', { detail: notificationData }));
          }

          // Navigate based on notification type
          if (notify_type === "new_booking") {
            // New booking for serviceman - go to dashboard
            pushNavigate(`/dashboard`);
          } else if (notify_type === "booking" && booking_id) {
            // Customer booking notification - go to booking details
            pushNavigate(`/CustomerProjectinfo/${booking_id}`);
          } else if (notify_type === "support" && support_id) {
            pushNavigate(`/supportlist`);
          } else if (route) {
            pushNavigate(route);
          } else {
            pushNavigate('/notifications');
          }
        }
      });
    } catch (error) {
      console.error("Error requesting local notification permissions:", error);
    }
  }
  
  console.log("Requesting push permission…");

  PushNotifications.addListener("registration", (token: Token) => {
    console.log("Push registration success, token: " + token.value);
    console.log("Calling PushNotifications.register()");
    // Store token globally
    (window as any).fcmToken = token.value;

    // ❌ Removed backend call (it fails before login)
  });

  PushNotifications.addListener("registrationError", (err) => {
    console.error("Push registration error: ", err);
  });

  PushNotifications.addListener(
    "pushNotificationReceived",
    async (notification: PushNotificationSchema) => {
      console.log("🔔 Push received in FOREGROUND");
      console.log("Notification object:", JSON.stringify(notification, null, 2));
      
      // Dispatch custom event for app to react (e.g., refresh Dashboard)
      const notifyType = notification.data?.notify_type;
      if (notifyType === "booking" || notifyType === "new_booking") {
        window.dispatchEvent(new CustomEvent('newBookingReceived', { detail: notification.data }));
      }
      
      // Show notification even when app is in foreground as heads-up notification
      if (Capacitor.getPlatform() !== "web") {
        try {
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          
          // Extract title and body - they might be in different places depending on payload format
          const title = notification.title || notification.data?.title || 'New Notification';
          const body = notification.body || notification.data?.body || notification.data?.message || '';
          
          console.log("📱 Creating local notification with title:", title, "body:", body);

          // Schedule immediate local notification with all heads-up properties
          const notificationId = Date.now();
          await LocalNotifications.schedule({
            notifications: [
              {
                title: title,
                body: body,
                id: notificationId,
                schedule: { at: new Date(Date.now() + 100) }, // Small delay for reliability
                sound: 'default.wav',
                channelId: 'fcm_default_channel',
                extra: notification.data || {},
                smallIcon: 'ic_stat_icon_config_sample',
                iconColor: '#488AFF',
                ongoing: false,
                autoCancel: true
              }
            ]
          });
          
          console.log("✅ Local notification scheduled successfully with ID:", notificationId);
        } catch (error) {
          console.error("❌ Error showing foreground notification:", error);
        }
      }
    }
  );

  PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (notification) => {
      console.log("Push action performed", JSON.stringify(notification));

      if (Capacitor.getPlatform() === "web") return;

      // Extract notification data based on platform
      let notificationData: any;
      
      if (Capacitor.getPlatform() === "ios") {
        notificationData = notification.notification.data.aps?.alert?.body || notification.notification.data;
      } else {
        notificationData = notification.notification.data;
      }

      console.log("Notification data extracted:", notificationData);

      // Handle navigation based on notification type
      const { notify_type, booking_id, support_id, notification_id, route } = notificationData;

      // Mark notification as seen if notification_id is provided
      if (notification_id) {
        console.log(`Marking push notification ${notification_id} as seen`);
        ApiService.post("/user/markNotificationsAsSeen", { notification_id })
          .then(() => console.log(`Push notification ${notification_id} marked as seen`))
          .catch(err => console.error("Error marking push notification as seen:", err));
      }

      // Dispatch custom event for Dashboard refresh
      if (notify_type === "booking" || notify_type === "new_booking") {
        window.dispatchEvent(new CustomEvent('newBookingReceived', { detail: notificationData }));
      }

      if (notify_type === "new_booking") {
        // New booking for serviceman - go to dashboard
        pushNavigate(`/dashboard`);
      } else if (notify_type === "booking" && booking_id) {
        // Customer booking notification - go to booking details page
        pushNavigate(`/CustomerProjectinfo/${booking_id}`);
      } else if (notify_type === "support" && support_id) {
        // Navigate to support list page
        pushNavigate(`/supportlist`);
      } else if (route) {
        // Fallback to route if provided
        pushNavigate(route);
      } else {
        // Default: Navigate to notifications page
        pushNavigate('/notifications');
      }
    }
  );
};
