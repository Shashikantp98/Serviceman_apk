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
      console.log("Push received in foreground: ", JSON.stringify(notification));
      
      // Show notification even when app is in foreground
      if (Capacitor.getPlatform() !== "web") {
        try {
          await PushNotifications.createChannel({
            id: 'default',
            name: 'Default',
            importance: 5,
            visibility: 1,
            sound: 'default'
          });

          // Create a local notification to display it
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          await LocalNotifications.schedule({
            notifications: [
              {
                title: notification.title || 'New Notification',
                body: notification.body || '',
                id: Math.floor(Math.random() * 100000),
                schedule: { at: new Date(Date.now() + 100) },
                sound: 'default',
                channelId: 'default',
                extra: notification.data
              }
            ]
          });
        } catch (error) {
          console.error("Error showing foreground notification:", error);
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

      if (notify_type === "booking" && booking_id) {
        // Navigate to booking details page
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
