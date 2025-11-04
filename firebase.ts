// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBD-g9C2com4ErNWpFou7GxxMiOKa8FQjw",
  authDomain: "loan-application-2659b.firebaseapp.com",
  projectId: "loan-application-2659b",
  storageBucket: "loan-application-2659b.firebasestorage.app",
  messagingSenderId: "1044845553873",
  appId: "1:1044845553873:web:ab736bb8fd7d35c19f3df0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);