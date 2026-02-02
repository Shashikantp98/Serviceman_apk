#!/usr/bin/env node

/**
 * Test Push Notification Script
 * 
 * This script sends a test push notification to verify your setup.
 * 
 * Usage:
 *   node test-push-notification.js
 * 
 * Requirements:
 *   - Firebase Admin SDK credentials (serviceAccountKey.json)
 *   - npm install firebase-admin
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
// Download from Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Your test FCM token
const TEST_FCM_TOKEN = 'A3A8154DC3ED5BCC85A4B90D218680910D6BBB6FDBD0139402CCD271D577BCB0';

async function sendTestNotification() {
  const message = {
    token: TEST_FCM_TOKEN,
    
    // This is REQUIRED for system notifications to appear
    notification: {
      title: '🔔 Test Push Notification',
      body: 'If you see this as a banner, push notifications are working!'
    },
    
    // Custom data for your app
    data: {
      notify_type: 'test',
      booking_id: '12345',
      notification_id: 'test_' + Date.now(),
      route: '/home'
    },
    
    // iOS-specific configuration
    apns: {
      payload: {
        aps: {
          alert: {
            title: '🔔 Test Push Notification',
            body: 'If you see this as a banner, push notifications are working!'
          },
          sound: 'default',
          badge: 1,
          contentAvailable: true
        }
      }
    },
    
    // Android-specific configuration
    android: {
      priority: 'high',
      notification: {
        channelId: 'fcm_default_channel',
        sound: 'default',
        priority: 'high'
      }
    }
  };

  try {
    console.log('🚀 Sending test notification...');
    console.log('Token:', TEST_FCM_TOKEN);
    
    const response = await admin.messaging().send(message);
    
    console.log('✅ Successfully sent notification!');
    console.log('Message ID:', response);
    console.log('\n📱 Check your device now - you should see a banner notification!');
    
  } catch (error) {
    console.error('❌ Error sending notification:');
    console.error(error);
    
    if (error.code === 'messaging/registration-token-not-registered') {
      console.error('\n⚠️  Token is not registered. This could mean:');
      console.error('   - App was uninstalled');
      console.error('   - Token has expired');
      console.error('   - Token is invalid');
    }
  }
  
  process.exit(0);
}

// Alternative: Test using HTTP API (Legacy)
async function sendTestNotificationHTTP() {
  const axios = require('axios');
  
  const SERVER_KEY = 'YOUR_FIREBASE_SERVER_KEY'; // From Firebase Console > Cloud Messaging
  
  const payload = {
    to: TEST_FCM_TOKEN,
    notification: {
      title: '🔔 Test Push Notification',
      body: 'If you see this as a banner, push notifications are working!',
      sound: 'default',
      badge: '1'
    },
    data: {
      notify_type: 'test',
      booking_id: '12345',
      notification_id: 'test_' + Date.now(),
      route: '/home'
    },
    priority: 'high',
    content_available: true
  };

  try {
    console.log('🚀 Sending test notification via HTTP...');
    
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      payload,
      {
        headers: {
          'Authorization': `key=${SERVER_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Successfully sent notification!');
    console.log('Response:', response.data);
    console.log('\n📱 Check your device now - you should see a banner notification!');
    
  } catch (error) {
    console.error('❌ Error sending notification:');
    console.error(error.response?.data || error.message);
  }
  
  process.exit(0);
}

// Run the test
console.log('========================================');
console.log('  Push Notification Test');
console.log('========================================\n');

// Choose which method to use:
sendTestNotification(); // Using Firebase Admin SDK
// sendTestNotificationHTTP(); // Using HTTP API
