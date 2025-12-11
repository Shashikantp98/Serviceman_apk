// import { PushNotifications } from '@capacitor/push-notifications';

// // Register for push notifications
// PushNotifications.requestPermissions().then(result => {
//   if (result.receive === 'granted') {
//     PushNotifications.register();
//   }
// });

// // Listen for registration
// PushNotifications.addListener('registration', token => {
//   console.log('Push registration success, token: ', token.value);
// });

// // Listen for push notifications
// PushNotifications.addListener('pushNotificationReceived', notification => {
//   console.log('Push received: ', notification);
// });

// // Listen for notification action
// PushNotifications.addListener('pushNotificationActionPerformed', action => {
//   console.log('Push action performed: ', action);
// });