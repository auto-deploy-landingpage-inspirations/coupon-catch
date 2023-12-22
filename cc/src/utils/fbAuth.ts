import { app } from "./fbInit";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    signOut,
  } from "firebase/auth";

const getFirebaseAuth = () => getAuth(app);

export { getFirebaseAuth as getAuth, signInWithPopup, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, GoogleAuthProvider, updateProfile, sendEmailVerification,sendPasswordResetEmail, signOut };