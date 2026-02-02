// Copy this code into ios/App/App/AppDelegate.swift
// This enables proper FCM token retrieval on iOS

// ============================================
// IMPORTS (add at top of file)
// ============================================
import FirebaseCore
import FirebaseMessaging


// ============================================
// IN application(_:didFinishLaunchingWithOptions:)
// ============================================
// Add these lines in the method (after existing super.init() call):

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
  // ... existing code ...
  
  // 🔥 Add Firebase configuration
  FirebaseApp.configure()
  
  // Set Messaging delegate to receive FCM token
  Messaging.messaging().delegate = self
  
  // Request notification permissions (important for iOS 10+)
  UNUserNotificationCenter.current().delegate = self
  
  // Request user permissions for notifications
  UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
    if granted {
      DispatchQueue.main.async {
        UIApplication.shared.registerForRemoteNotifications()
      }
    }
  }
  
  // ... rest of existing code ...
  return true
}


// ============================================
// MESSAGING DELEGATE EXTENSION (add at end of file, after AppDelegate class)
// ============================================
// This handles FCM token registration and updates

extension AppDelegate: MessagingDelegate {
  
  // Called when FCM token is generated or refreshed
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("🔥🔥🔥 FCM TOKEN RECEIVED 🔥🔥🔥")
    print("FCM Token: \(fcmToken ?? "nil")")
    
    if let fcmToken = fcmToken {
      // Store token for use in app
      UserDefaults.standard.set(fcmToken, forKey: "FCMToken")
      
      // Post notification so your app can receive it
      let dataDict = ["token": fcmToken]
      NotificationCenter.default.post(
        name: NSNotification.Name("FCMToken"),
        object: nil,
        userInfo: dataDict
      )
      
      print("✅ FCM Token stored and posted")
    }
  }
}


// ============================================
// COMPLETE EXAMPLE OF UPDATED AppDelegate
// ============================================

/*
import UIKit
import Capacitor
import FirebaseCore        // ADD THIS
import FirebaseMessaging   // ADD THIS

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  
  var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    
    // Capacitor code
    let capacitorConfig = CapacitorConfiguration(with: [:])
    capacitorConfig.setServerAssets()
    
    let frame = window?.bounds ?? UIScreen.main.bounds
    window = UIWindow(frame: frame)
    
    let rootViewController = UIViewController()
    let webView = UIWebViewEngine(with: capacitorConfig)
    rootViewController.loadWebView(webView)
    window?.rootViewController = rootViewController
    window?.makeKeyAndVisible()
    
    // 🔥 ADD FIREBASE CONFIGURATION
    FirebaseApp.configure()
    
    // Set Messaging delegate
    Messaging.messaging().delegate = self
    
    // Request notification permissions
    UNUserNotificationCenter.current().delegate = self
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
      if granted {
        DispatchQueue.main.async {
          UIApplication.shared.registerForRemoteNotifications()
        }
      }
    }
    
    return true
  }
  
  // ... other methods ...
}

// 🔥 ADD THIS EXTENSION AT END OF FILE
extension AppDelegate: MessagingDelegate {
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("🔥 FCM TOKEN: \(fcmToken ?? "nil")")
    if let fcmToken = fcmToken {
      UserDefaults.standard.set(fcmToken, forKey: "FCMToken")
      NotificationCenter.default.post(
        name: NSNotification.Name("FCMToken"),
        object: nil,
        userInfo: ["token": fcmToken]
      )
    }
  }
}
*/
