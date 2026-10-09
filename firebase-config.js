const firebaseConfig = {
  apiKey: "AIzaSyAMEyDNTDtIqF7gtqnvJy9AHHbqd6OdORk",
  authDomain: "spotiware.firebaseapp.com",
  databaseURL: "https://spotiware-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "spotiware",
  storageBucket: "spotiware.firebasestorage.app",
  messagingSenderId: "645250484929",
  appId: "1:645250484929:web:6480d47df8eb56d5836240",
  measurementId: "G-RC22BL3M4H"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();