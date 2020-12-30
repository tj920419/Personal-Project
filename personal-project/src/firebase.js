import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBwWOLt0ioY91SqVnr1mPh1meUBBanjIYk',
  authDomain: 'newsplatform-9a5f4.firebaseapp.com',
  databaseURL: 'https://newsplatform-9a5f4.firebaseio.com',
  projectId: 'newsplatform-9a5f4',
  storageBucket: 'newsplatform-9a5f4.appspot.com',
  messagingSenderId: '895486789179',
  appId: '1:895486789179:web:40d7c5d3cbc840848c7e1e',
  measurementId: 'G-MB158LDM29',
};

// Initialize Firebase
const firebaseSet = firebase.initializeApp(firebaseConfig);
export const auth = firebaseSet.auth();
export const firestore = firebaseSet.firestore();
export const timestamp = firebase.firestore.FieldValue.serverTimestamp();
