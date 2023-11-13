// Firebase imports
// connect to live stuff
import { initializeApp } from "firebase/app";
// Connect to emulator
import { collection, onSnapshot } from "firebase/firestore"; 

  //Firebase Functions
  import { getFunctions } from 'firebase/functions';
  // Firebase Analytics
  import { getAnalytics } from "firebase/analytics";
  import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
  // import { connectStorageEmulator } from "firebase/storage";

  
  // Firebase Auth
  import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyADNeSUyUp1ofLycqlpHRVUJ4u5PUAA1oM",
    appId: "1:50437999849:web:68a5ea526c73645e32f478",
    authDomain: "couponcatch-e211e.firebaseapp.com",
    projectId: "couponcatch-e211e",
    measurementId: "G-CH97T6GH6B",
    storageBucket: "couponcatch-e211e.appspot.com",
    messagingSenderId: "50437999849"
  };

// Commneted to use emulator
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const provider = new GoogleAuthProvider();
const firebaseGetStorage = getStorage(app);
const functions = getFunctions(app);
const db = getFirestore();
const analytics = getAnalytics(app);


export const uploadPhotoToFirebase = async (file: any, path: string) => {
  const storageRef = ref(firebaseGetStorage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

export const fetchReceiptsData = (userId: string, onReceiptsUpdated: (receipts: any[]) => void) => {
  const collectionPath = `receipts/${userId}/extractedText`;

  const unsubscribe = onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      const receiptsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      onReceiptsUpdated(receiptsData);
    },
    (error) => {
      console.error("Error fetching receipts data:", error);
    }
  );

  return unsubscribe;
};

export {firebaseGetStorage, firebaseConfig, functions, db, analytics, auth, provider, signInWithPopup, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signOut };
