// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAutsCfCNBJxJXz92Avohb1PUIHsfMJ_xs",
  authDomain: "edugrove.firebaseapp.com",
  projectId: "edugrove",
  storageBucket: "edugrove.appspot.com",
  messagingSenderId: "992704487053",
  appId: "1:992704487053:web:dc881b1cb21df5d00b4cc4",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

export default app;
