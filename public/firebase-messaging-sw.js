importScripts("https://www.gstatic.com/firebasejs/8.0.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.0.0/firebase-messaging.js");
// const { initializeApp } = require("firebase/app");
// const { getMessaging, getToken, onMessage } = require("firebase/messaging");
const firebaseConfig = {
  apiKey: "AIzaSyCHCmi2PyzCsh-lP1A9_tOA96Oa4j_XOTE",
  authDomain: "divechat-5d5a5.firebaseapp.com",
  databaseURL: "https://divechat-5d5a5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "divechat-5d5a5",
  storageBucket: "divechat-5d5a5.appspot.com",
  messagingSenderId: "214589581637",
  appId: "1:214589581637:web:c69cebec90ba6bb052b62c",
  measurementId: "G-MLJMP66M7K"
};

const app = firebase.initializeApp(firebaseConfig);


// Retrieve an instance of Firebase Messaging so that it can handle background
const messaging = firebase.messaging();
// export const sendNotif = (message) => {
//   messaging.send(message)
//   .then((response) => {
//     // Response is a message ID string.
//     console.log('Successfully sent message:', response);
//   })
//   .catch((error) => {
//     console.log('Error sending message:', error);
//   });
// }
messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});