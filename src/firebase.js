import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDozLS30418zdLcjyZdGXacJh-GxnE6HfA",
  authDomain: "couple-tasks-a34b7.firebaseapp.com",
  projectId: "couple-tasks-a34b7",
  storageBucket: "couple-tasks-a34b7.firebasestorage.app",
  messagingSenderId: "1007588659639",
  appId: "1:1007588659639:web:c6806484dfbc651abdd832"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);