import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWjz-IsF2uLWciYMhcMrBNdD4RRAnVcgo",
  authDomain: "mynotes-c42c2.firebaseapp.com",
  projectId: "mynotes-c42c2",
  storageBucket: "mynotes-c42c2.firebasestorage.app",
  messagingSenderId: "621469466127",
  appId: "1:621469466127:web:8d7ca7d0b437ec1fdd6d7a",
  measurementId: "G-5EZ5FPCVCC"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);