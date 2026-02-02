#!/usr/bin/env node

/**
 * FCM Token Diagnostic Script
 * 
 * Usage: node fcm-token-diagnostic.js [token]
 * 
 * This script analyzes a push notification token and tells you:
 * - Token type (FCM vs APNs)
 * - Token validity
 * - What needs to be fixed
 */

const tokenArg = process.argv[2];

if (!tokenArg) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           FCM Token Diagnostic Tool                            ║
╚════════════════════════════════════════════════════════════════╝

Usage: node fcm-token-diagnostic.js <token>

Example:
  node fcm-token-diagnostic.js "558FF375E6CDBCB898D26BAB4EA9136AE82AE9A041759FAA4160A4B7EAC15FBE"
  node fcm-token-diagnostic.js "fGx8Zz8zQkqK2Y8zKf...:APA91bG..."

Copy your token from the console logs and paste it above.
  `);
  process.exit(1);
}

// Analysis functions
function analyzeToken(token) {
  const analysis = {
    token: token,
    length: token.length,
    isFCM: token.includes(":"),
    isAPNs: /^[0-9A-F]{64,}$/.test(token),
    isBase64: /^[A-Za-z0-9+/\-_:]*={0,2}$/.test(token),
  };

  return analysis;
}

function getTokenType(analysis) {
  if (analysis.isFCM) {
    return "FCM Token ✅";
  } else if (analysis.isAPNs) {
    return "APNs Token ❌";
  } else {
    return "Unknown Format ⚠️";
  }
}

function getRecommendation(analysis) {
  if (analysis.isFCM) {
    return "✅ CORRECT - This token is FCM format and can be used with Firebase Cloud Messaging API";
  } else if (analysis.isAPNs) {
    return `❌ WRONG - This is an APNs token from Apple Push Notification service.
       It CANNOT be used with Firebase Cloud Messaging API.
       
       To fix:
       1. Update ios/App/App/AppDelegate.swift with Firebase configuration
       2. Add FirebaseApp.configure() and Messaging.messaging().delegate setup
       3. Rebuild app: npx cap run ios
       4. You should then receive a different token with ":" in it`;
  } else {
    return "⚠️ UNKNOWN - This doesn't match FCM or APNs format. Check if token was copied correctly.";
  }
}

// Main execution
const analysis = analyzeToken(tokenArg);

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ANALYSIS RESULTS                            ║
╚════════════════════════════════════════════════════════════════╝
`);

console.log(`Token: ${analysis.token.substring(0, 50)}${analysis.token.length > 50 ? '...' : ''}`);
console.log(`Length: ${analysis.length} characters`);
console.log(`Type: ${getTokenType(analysis)}`);

console.log(`
Detailed Analysis:
  - Contains colon (:)        ${analysis.isFCM ? "✅ Yes" : "❌ No"}`);
console.log(`  - APNs hex format          ${analysis.isAPNs ? "⚠️  Yes" : "✅ No"}`);
console.log(`  - Valid base64/URL-safe    ${analysis.isBase64 ? "✅ Yes" : "❌ No"}`);

console.log(`
${getRecommendation(analysis)}
`);

// Additional debugging info
console.log(`
╔════════════════════════════════════════════════════════════════╗
║              HOW TO GET THE CORRECT TOKEN                      ║
╚════════════════════════════════════════════════════════════════╝

1. Open your app in Xcode and run on a real device
2. Open Safari Developer Tools → Console
3. Look for these logs when app starts:
   
   ✅ Push registration SUCCESS!
   Token received: [your_token_here]
   Platform: ios
   
   Token format analysis:
   - Is FCM token: ??? ← THIS tells you if it's correct
   - Is APNs token: ???

4. Copy the "Token received:" value and paste it here again

If you see:
  - Is FCM token: ✅ → Great! Use this token
  - Is APNs token: ⚠️  → Problem! Update AppDelegate as per guide

╔════════════════════════════════════════════════════════════════╗
║                    QUICK FIX                                   ║
╚════════════════════════════════════════════════════════════════╝

If you're getting APNs tokens instead of FCM:

1. Open ios/App/App/AppDelegate.swift in Xcode
2. Add at top:
   import FirebaseCore
   import FirebaseMessaging

3. In application(...didFinishLaunchingWithOptions...) add:
   FirebaseApp.configure()
   Messaging.messaging().delegate = self

4. Add extension at end:
   extension AppDelegate: MessagingDelegate {
     func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
       print("FCM Token: \\(fcmToken ?? "nil")")
     }
   }

5. Run: pod install in ios/App/
6. Run: npx cap run ios
7. Check console again for the new token

See QUICK_FIX_CHECKLIST.md for complete instructions.
`);
