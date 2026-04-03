// Firebase SDK imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmyD5icWdYgfrS-ggqT3T63JBVtPyCPJ8",
    authDomain: "multicolumn-todolist.firebaseapp.com",
    projectId: "multicolumn-todolist",
    storageBucket: "multicolumn-todolist.firebasestorage.app",
    messagingSenderId: "405843764706",
    appId: "1:405843764706:web:5c1b947645f854040085bb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;