import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyALmViwxKezq1mZgQPtnJd_D1jYvKkVjGQ",
  authDomain: "argon-club.firebaseapp.com",
  databaseURL: "https://argon-club-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "argon-club",
  storageBucket: "argon-club.firebasestorage.app",
  messagingSenderId: "588615635650",
  appId: "1:588615635650:web:9eec4ef31aa1f9f6f1215b",
  measurementId: "G-RJWZP88XQN"
};

const RTDB_APP_NAME = 'argon-club-rtdb';

export const rtdbApp =
  getApps().find((a) => a.name === RTDB_APP_NAME) ||
  initializeApp(firebaseConfig, RTDB_APP_NAME);

export const rtdb = getDatabase(rtdbApp);

export default firebaseConfig;
