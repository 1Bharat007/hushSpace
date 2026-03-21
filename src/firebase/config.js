import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB444qMEYq2GRuTxezCSWmiySOd1mVSD9Q",
  authDomain: "notebook-a8bb6.firebaseapp.com",
  projectId: "notebook-a8bb6",
  storageBucket: "notebook-a8bb6.firebasestorage.app",
  messagingSenderId: "961010007937",
  appId: "1:961010007937:web:700d4fbc691373b7ff7280",
  measurementId: "G-704SKXTW04"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
