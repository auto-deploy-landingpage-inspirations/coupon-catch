// firebaseInit.ts
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyADNeSUyUp1ofLycqlpHRVUJ4u5PUAA1oM",
    appId: "1:50437999849:web:68a5ea526c73645e32f478",
    authDomain: "couponcatch-e211e.firebaseapp.com",
    projectId: "couponcatch-e211e",
    measurementId: "G-CH97T6GH6B",
    storageBucket: "couponcatch-e211e.appspot.com",
    messagingSenderId: "50437999849"
  };

export const app = initializeApp(firebaseConfig);
