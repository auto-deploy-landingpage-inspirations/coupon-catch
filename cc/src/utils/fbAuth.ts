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

const auth = getAuth();

export { auth, signInWithPopup, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, GoogleAuthProvider, updateProfile, sendEmailVerification,sendPasswordResetEmail, signOut };
