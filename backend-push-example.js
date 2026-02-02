const admin = require('../third_party/FirebaseAdmin');

/**
 * Send push notification to a device
 * @param {string} deviceToken - FCM device token
 * @param {object} payload - Notification payload
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification body
 * @param {object} payload.data - Custom data payload
 * @param {number} [payload.badge] - Badge count (optional)
 * @returns {Promise<{success: boolean, response?: string, error?: string}>}
 */
exports.sendPushNotification = async (deviceToken, payload) => {
  try {
    console.log('Attempting to send push notification...');
    console.log('Device Token:', deviceToken);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Validate inputs
    if (!deviceToken || typeof deviceToken !== 'string') {
      throw new Error('Invalid device token');
    }
    if (!payload.title || !payload.body) {
      throw new Error('Title and body are required');
    }

    const message = {
      token: deviceToken,

      // REQUIRED for system notification banners
      notification: {
        title: payload.title,
        body: payload.body,
      },

      // Custom data (all values must be strings!)
      data: payload.data
        ? Object.fromEntries(
            Object.entries(payload.data).map(([k, v]) => [k, String(v)])
          )
        : {},

      // ✅ iOS specific configuration
      apns: {
        headers: {
          'apns-priority': '10', // High priority
        },
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: 'default',
            badge: payload.badge || 1, // Dynamic badge count
            contentAvailable: true, // Use camelCase (not 'content-available')
          },
        },
      },

      // ✅ Android specific configuration
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'fcm_default_channel',
          priority: 'high',
        },
      },
    };

    const response = await admin.messaging().send(message);

    console.log('✅ Push notification sent successfully:', response);
    return { success: true, response };
    
  } catch (error) {
    console.error('❌ Push notification error:', error.code || error.message);
    
    // Handle specific FCM errors
    if (error.code === 'messaging/registration-token-not-registered') {
      console.error('Token is no longer valid - should be removed from database');
      return { success: false, error: 'Token expired or invalid', shouldRemoveToken: true };
    }
    
    if (error.code === 'messaging/invalid-argument') {
      console.error('Invalid message format or token');
      return { success: false, error: 'Invalid message format', shouldRemoveToken: true };
    }
    
    return { success: false, error: error.message };
  }
};

// Usage Example:
/*
const result = await sendPushNotification(
  'A3A8154DC3ED5BCC85A4B90D218680910D6BBB6FDBD0139402CCD271D577BCB0',
  {
    title: 'New Booking Request',
    body: 'You have a new booking from John Doe',
    badge: 3, // Optional: number of unread notifications
    data: {
      notify_type: 'new_booking',
      booking_id: '12345',
      notification_id: 'notif_789',
      route: '/dashboard'
    }
  }
);

if (!result.success && result.shouldRemoveToken) {
  // Remove invalid token from database
  await removeTokenFromDatabase(deviceToken);
}
*/
