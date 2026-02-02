import UIKit
import Capacitor
import FirebaseCore
import FirebaseMessaging
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        print("🚀 App launching...")
        
        // Initialize Firebase
        FirebaseApp.configure()
        print("✅ Firebase configured")
        
        // Check if Firebase is configured properly
        if FirebaseApp.app() != nil {
            print("✅ Firebase app instance exists")
        } else {
            print("❌ Firebase app instance is nil!")
        }
        
        // Set Messaging delegate to receive FCM tokens
        Messaging.messaging().delegate = self
        print("✅ Firebase Messaging delegate set")
        
        // Set notification delegate to handle foreground notifications
        UNUserNotificationCenter.current().delegate = self
        
        // Request user permission for notifications
        print("📱 Requesting notification permissions...")
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if let error = error {
                print("❌ Permission request error: \(error.localizedDescription)")
            }
            
            if granted {
                print("✅ Notification permission GRANTED")
                DispatchQueue.main.async {
                    print("📱 Registering for remote notifications...")
                    UIApplication.shared.registerForRemoteNotifications()
                }
            } else {
                print("❌ Notification permission DENIED - FCM won't work without this!")
            }
        }
        
        // Manually retrieve FCM token after a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            print("🔍 Attempting to retrieve FCM token...")
            Messaging.messaging().token { token, error in
                if let error = error {
                    print("❌ Error fetching FCM token: \(error.localizedDescription)")
                    print("❌ Error details: \(error)")
                } else if let token = token {
                    print("🔥 Successfully retrieved existing FCM token!")
                    print("🔥 Token: \(token)")
                    // Manually trigger the delegate method to send to JavaScript
                    self.messaging(Messaging.messaging(), didReceiveRegistrationToken: token)
                } else {
                    print("⚠️ No FCM token available yet (token is nil)")
                }
            }
        }
        
        print("✅ App launch configuration complete")
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
        
        // Check if we need to refresh the FCM token (in case user logged out and back in)
        print("📱 App became active - checking FCM token...")
        Messaging.messaging().token { token, error in
            if let error = error {
                print("❌ Error fetching FCM token on app active: \(error.localizedDescription)")
            } else if let token = token {
                print("✅ FCM token available: \(token)")
                // Manually trigger the delegate to ensure JavaScript gets the token
                self.messaging(Messaging.messaging(), didReceiveRegistrationToken: token)
            } else {
                print("⚠️ No FCM token available yet")
            }
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    // MARK: - Push Notifications (APNs & FCM)
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        print("📱 ✅ APNs device token RECEIVED from Apple")
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()
        print("📱 APNs Token (hex): \(token)")
        
        // Pass the APNs token to Firebase Messaging - THIS IS CRITICAL
        Messaging.messaging().apnsToken = deviceToken
        print("✅ APNs token sent to Firebase Messaging")
        
        // Also notify Capacitor
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        
        // Firebase should now generate FCM token
        print("⏳ Firebase should now generate FCM token...")
        
        // IMPORTANT: After APNs token is set, retrieve FCM token immediately
        // This ensures token is available even if delegate isn't called (e.g., after logout)
        print("🔄 Retrieving FCM token now that APNs token is available...")
        Messaging.messaging().token { fcmToken, error in
            if let error = error {
                print("❌ Error fetching FCM token after APNs: \(error.localizedDescription)")
            } else if let fcmToken = fcmToken {
                print("✅ FCM token retrieved after APNs token!")
                print("🔥 Token: \(fcmToken)")
                // Inject to JavaScript
                self.messaging(Messaging.messaging(), didReceiveRegistrationToken: fcmToken)
            } else {
                print("⚠️ FCM token is nil after APNs registration")
            }
        }
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌ Failed to register for remote notifications: \(error.localizedDescription)")
        // Notify Capacitor about the failure
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
    
    // MARK: - UNUserNotificationCenterDelegate
    
    // Handle notification when app is in FOREGROUND
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                               willPresent notification: UNNotification,
                               withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        print("🔔 Notification received while app in FOREGROUND")
        
        // Show banner, sound, and badge even when app is in foreground
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }
    
    // Handle notification tap (when user taps on notification)
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                               didReceive response: UNNotificationResponse,
                               withCompletionHandler completionHandler: @escaping () -> Void) {
        print("🔔 Notification tapped by user")
        
        // Let Capacitor handle the notification tap
        completionHandler()
    }

}

// MARK: - MessagingDelegate for FCM Token
extension AppDelegate: MessagingDelegate {
    /// Called when a new FCM token is generated
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("🔥🔥🔥 FCM TOKEN RECEIVED 🔥🔥🔥")
        print("FCM Token: \(fcmToken ?? "nil")")
        
        if let fcmToken = fcmToken {
            // Store the token for backend use
            UserDefaults.standard.set(fcmToken, forKey: "FCMToken")
            
            // Post to NotificationCenter for native listeners
            let dataDict = ["token": fcmToken]
            NotificationCenter.default.post(
                name: NSNotification.Name("FCMTokenReceived"),
                object: nil,
                userInfo: dataDict
            )
            
            // CRITICAL: Send FCM token to web view/JavaScript
            // This ensures the JavaScript code receives the correct FCM token
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                if let bridge = (UIApplication.shared.delegate as? AppDelegate)?.window?.rootViewController as? CAPBridgeViewController {
                    let jsCode = """
                    (function() {
                        console.log('📱 Sending FCM token to JavaScript');
                        window.fcmToken = '\(fcmToken)';
                        window.tokenType = 'FCM';
                        
                        // Store in localStorage so it persists across logout/login
                        try {
                            localStorage.setItem('fcm_token_ios', '\(fcmToken)');
                            console.log('✅ FCM Token stored in localStorage');
                        } catch (e) {
                            console.log('⚠️ Failed to store in localStorage:', e);
                        }
                        
                        // Dispatch custom event for any listeners
                        var event = new CustomEvent('FCMTokenReceived', { 
                            detail: { token: '\(fcmToken)' } 
                        });
                        window.dispatchEvent(event);
                        
                        console.log('✅ FCM Token set in window.fcmToken');
                        console.log('FCM Token:', window.fcmToken);
                    })();
                    """
                    bridge.webView?.evaluateJavaScript(jsCode) { (result, error) in
                        if let error = error {
                            print("❌ Error sending FCM token to JS:", error)
                        } else {
                            print("✅ FCM Token successfully sent to JavaScript")
                        }
                    }
                }
            }
            
            print("✅ FCM Token stored and posted to web view")
        }
    }
}
