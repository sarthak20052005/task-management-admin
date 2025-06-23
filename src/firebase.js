// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_n6KUrza1DcU4EdGZXaULe9dPEWU2X_E",
  authDomain: "taskmanager-46530.firebaseapp.com",
  projectId: "taskmanager-46530",
  storageBucket: "taskmanager-46530.firebasestorage.app",
  messagingSenderId: "1082531073522",
  appId: "1:1082531073522:web:4acaa2d69cfb3534b76f6b",
  measurementId: "G-XB9GHG37T9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//Export FireBaseServices
export const auth = getAuth(app);
export const db = getFirestore(app);