import { collection, writeBatch, setDoc, doc, getFirestore, onSnapshot, where, getDocs, updateDoc, getDoc, query } from "firebase/firestore"; 

import { AuthStore, IUserInfoStore } from "./store";
import { initializeApp } from "firebase/app";
import { ILineItem, IReceiptItem } from "./types";


const firebaseConfig = {
  apiKey: "AIzaSyADNeSUyUp1ofLycqlpHRVUJ4u5PUAA1oM",
  appId: "1:50437999849:web:68a5ea526c73645e32f478",
  authDomain: "couponcatch-e211e.firebaseapp.com",
  projectId: "couponcatch-e211e",
  measurementId: "G-CH97T6GH6B",
  storageBucket: "couponcatch-e211e.appspot.com",
  messagingSenderId: "50437999849"
};

const app = initializeApp(firebaseConfig);


const db = getFirestore();


// Controllers
// READS------------------------------------------------------------------------
// SubData subscribes to data changes in a collection and calls the callback function
export const subToCollection = (path: string, onDataUpdated: (data: any[]) => void) => {
  console.log(`Fetching data from ${path}`);
  const unsubscribe = onSnapshot(
    collection(db, path),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      onDataUpdated(data);
    },
    (error) => {
      console.error(`Error fetching data from ${path}:`, error);
    }
  );
  return unsubscribe;
};


export const subToReceipts = (userId: string, onReceiptsUpdated: (receipts: IReceiptItem[]) => void) => {
  const receiptsRef = collection(db, 'receipts');
  const q = query(receiptsRef, where('userId', '==', userId), where('isDeleted', '==', false));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const receipts = snapshot.docs.map(doc => ({
      id: doc.id,
      terminalNumber: doc.data().terminalNumber,
      transactionNumber: doc.data().transactionNumber,
      operatorNumber: doc.data().operatorNumber,
      dateOfPurchase: doc.data().dateOfPurchase,
      timeOfPurchase: doc.data().timeOfPurchase,
      createdAt: doc.data().createdAt,
      daysLeft: doc.data().daysLeft,
      isUnlocked: doc.data().isUnlocked,
      isRedeemed: doc.data().isRedeemed,
      isDeleted: doc.data().isDeleted,
      itemLines: doc.data().itemLines,
      unlockCouponTotal: doc.data().unlockCouponTotal,
    }));
    onReceiptsUpdated(receipts);
  });

  // Return the unsubscribe function to allow caller to stop listening
  return unsubscribe;
};

export const subToItemLines = (userId: string, receiptIds: string[], onItemLinesUpdated: (itemLines: any[]) => void) => {
  const itemLines: any[] = [];
  for (const receiptId of receiptIds) {
    const itemLinesRef = collection(db, 'itemLines');
    const q = query(itemLinesRef, where('userId', '==', userId), where('receiptId', '==', receiptId), where('isRedeemed', '==', false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const receiptItemLines = snapshot.docs.map(doc => ({ 
        userId: doc.data().userId,
        receiptId: doc.data().receiptId,
        id: doc.id, 
        itemNumber: doc.data().itemNumber,
        itemPrice: doc.data().itemPrice,
        quantity: doc.data().quantity,
        couponNum: doc.data().couponNum,
        isRedeemed: doc.data().isRedeemed,
        itemDesc: doc.data().itemDesc,
        availCouponAmount: doc.data().availCouponAmount,
        origPurchasedCouponAmt: doc.data().origPurchasedCouponAmt,
      }));
      itemLines.push(...receiptItemLines);
      onItemLinesUpdated(itemLines);
    });
    return unsubscribe;
  }
}

// Subscribe to a single document
export const subToDoc = (path: string, onDocUpdated: (docData: any) => void) => {
  console.log(`Fetching document from ${path}`);
  const docRef = doc(db, path);
  const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const docData = { id: docSnapshot.id, ...docSnapshot.data() };
      onDocUpdated(docData);
    } else {
      console.error("No such document!");
    }
  }, 
  (error) => {
    console.error(`Error fetching document from ${path}:`, error);
  });
  return unsubscribe;
};

// Fetch collection data once
export const fetchCollectionOnce = async (path: string) => {
  console.log(`Fetching data from ${path}`);
  const querySnapshot = await getDocs(collection(db, path));
  console.log(`Data fetched from ${path}`);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Fetch receipts once, for demo user
export const fetchReceiptsOnce = async (userId: string): Promise<IReceiptItem[]> => {
  const receiptsRef = collection(db, 'receipts');
  const q = query(receiptsRef, where('userId', '==', userId), where('isDeleted', '==', false));

  const snapshot = await getDocs(q);
  const receipts = snapshot.docs.map(doc => ({
    id: doc.id,
    terminalNumber: doc.data().terminalNumber,
    transactionNumber: doc.data().transactionNumber,
    operatorNumber: doc.data().operatorNumber,
    dateOfPurchase: doc.data().dateOfPurchase,
    timeOfPurchase: doc.data().timeOfPurchase,
    createdAt: doc.data().createdAt,
    daysLeft: doc.data().daysLeft,
    isUnlocked: doc.data().isUnlocked,
    isRedeemed: doc.data().isRedeemed,
    isDeleted: doc.data().isDeleted,
    itemLines: doc.data().itemLines,
    unlockCouponTotal: doc.data().unlockCouponTotal,
  }));

  return receipts;
};

// Fetch item lines once, for demo user
export const fetchItemLinesOnce = async (userId: string, receiptIds: string[]) => {
  console.log(`Fetching item lines for ${userId}`);
  const itemLines = [];
  for (const receiptId of receiptIds) {
    const itemLinesRef = collection(db, 'itemLines');
    const q = query(itemLinesRef, where('userId', '==', userId), where('receiptId', '==', receiptId), where('isRedeemed', '==', false));
    const querySnapshot = await getDocs(q);
    const receiptItemLines = querySnapshot.docs.map(doc => ({ 
      userId: doc.data().userId,
      receiptId: doc.data().receiptId,
      id: doc.id, 
      itemNumber: doc.data().itemNumber,
      itemPrice: doc.data().itemPrice,
      quantity: doc.data().quantity,
      couponNum: doc.data().couponNum,
      isRedeemed: doc.data().isRedeemed,
      itemDesc: doc.data().itemDesc,
      availCouponAmount: doc.data().availCouponAmount,
      origPurchasedCouponAmt: doc.data().origPurchasedCouponAmt,
    }));
    itemLines.push(...receiptItemLines);
  }
  console.log(`Item lines fetched for ${userId}`);
  return itemLines;
};

// Fetch document data once, for demo user
export const fetchDocOnce = async (path: string) => {
  console.log(`Fetching document from ${path}`);
  const docRef = doc(db, path);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log(`Document fetched from ${path}`);
    return docSnap.data();
  } else {
    // Handle the case where the document does not exist
    console.log("No such document!");
    return null;
  }
};

// export const fetchReceiptsOnce = async (userId: string) => {
//   console.log(`Fetching receipts for ${userId}`);
//   const collectionPath = `users/${userId}/receipts`;
//   const querySnapshot = await getDocs(collection(db, collectionPath));
//   console.log(`Receipts fetched for ${userId}`);
//   return querySnapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data(),
//   }));
// };

// export const fetchUserDataOnce = async (userId: string) => {
//   console.log(`Fetching user data ONCE for ${userId}`);
//   const docRef = doc(db, `users/${userId}/info/settings`);
//   const docSnap = await getDoc(docRef);

//   if (docSnap.exists()) {
//     console.log(`User data fetched ONCE for ${userId}`);
//     return docSnap.data();
//   } else {
//     // Handle the case where the document does not exist
//     console.log("No such document!");
//     return null;
//   }
// };

export const fetchUserData = (userId: string, onUserDataUpdated: (userData: any) => void) => {
  console.log(`Fetching user data for ${userId}`);
  const docRef = doc(db, `users/${userId}/info/settings`);
  const unsubscribe = onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      onUserDataUpdated(doc.data());
    } else {
      // Handle the case where the document does not exist
      console.log("No such document!");
    }
  });
  console.log(`User data fetched for ${userId}`);
  return unsubscribe;
};




// WRITES-----------------------------------------------------------------------
// need to chnage this to find the receipt in the receipts/ collection where the receiptId matches the receiptId passed in, and the same for userId
export const markReceiptUnlocked = async (userId: string, receiptId: string) => {
  try {
    const receiptPath = `receipts/${receiptId}`;
    const receiptRef = doc(db, receiptPath);

    await updateDoc(receiptRef, {
      isUnlocked: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Error unlocking receipt: ", error);
    return { success: false, error: error };
  }
};

export const markItemsRedeemed = async (itemLineIds: string[]) => {
  try {
    const batchUpdate = writeBatch(db);

    itemLineIds.forEach(itemLineId => {
      const itemPath = `itemLines/${itemLineId}`;
      const itemRef = doc(db, itemPath);
      batchUpdate.update(itemRef, { isRedeemed: true });
    });

    await batchUpdate.commit();

    console.log("Items", itemLineIds, "marked as redeemed");
    return { success: true };
  } catch (error) {
    console.error("Error marking items as redeemed: ", error);
    return { success: false, error: error };
  }
};

// export const mergeUserSettingsInFirestore = async (userInfo: Partial<IUserInfoStore>, userId: string) => {
//   const userSettingsDocRef = doc(db, `users/${userId}/info/settings`);

//   try {
//       await setDoc(userSettingsDocRef, userInfo, { merge: true });
//       console.log(`User settings successfully updated for user ${userId}`);
//   } catch (error) {
//       console.error(`Failed to update user settings for user ${userId}:`, error);
//   }
// };

// DELETES----------------------------------------------------------------------
export const deleteReceiptInFb = async (receiptId: string) => {
  try {
    const receiptPath = `receipts/${receiptId}`;
    const receiptRef = doc(db, receiptPath);

    await updateDoc(receiptRef, {
      isDeleted: true,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting receipt: ", error);
    return { success: false, error: error };
  }
}



export {collection, db};
