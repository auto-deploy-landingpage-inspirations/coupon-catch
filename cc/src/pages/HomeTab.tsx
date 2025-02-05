import { useRef, useEffect, useState, useMemo, useCallback, Suspense } from "react";
import {
  createAnimation,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
// import type { Animation } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { AuthStore, UserInfoStore } from "../utils/store";
import { ReceiptStore } from "../utils/store";
import { CouponStore } from "../utils/store";
import { db } from "../utils/fbFirestore";
import { doc, deleteDoc, collection, query, where, getDocs, getDoc } from "firebase/firestore";
import React from "react";

import { ICouponItem, IReceiptItem } from "../utils/types";

import HomeTabSkeleton from "../components/HomeTabSkeleton";
import NoReceiptsComponent from "../components/NoReceiptsComponent";
const DemoUINotice = React.lazy(() => import("../components/DemoUINotice"));
import ReceiptList from "../components/ReceiptsList";

const HomeTab: React.FC = () => {
  const history = useHistory();
  const receipts = ReceiptStore.useState((s) => s.receiptList);
  const user = AuthStore.useState((s) => s.user);
  const isDemoUser = AuthStore.useState((s) => s.isDemoUser);
  // const isDemoCouponsApplied = ReceiptStore.useState((s) => s.isDemoCouponsApplied);
  const receiptsIsCalculated = ReceiptStore.useState((s) => s.isCalculated);
  const receiptsIsSorted = ReceiptStore.useState((s) => s.isSorted);
  const [sortedReceipts, setSortedReceipts] = useState<IReceiptItem[]>([]);

  // const [mostRecentReceiptId, setMostRecentReceiptId] = useState<
  //   string | undefined
  // >(undefined);
  // Use a state to track when the ref is attached and trigger the animation after the attachment.
    // const [shouldAnimate, setShouldAnimate] = useState(false);
  
  const mostRecentReceiptId = useMemo(() => {
    if (!Array.isArray(receipts) || receipts.length === 0) return undefined;

    return receipts.reduce((max, receipt) =>
      new Date(receipt.createdAt) > new Date(max.createdAt) ? receipt : max
    ).id;
  }, [receipts]);

  useEffect(() => {
    // Sort receipts into two groups and then by daysLeft or dateOfPurchase
  // Sort receipts into two groups and then by daysLeft or dateOfPurchase
  const sorted = [...receipts].sort((a, b) => {
    // Group by whether daysLeft > 0 and unlockCouponTotal > 0
    const aGroup = a.daysLeft > 0 && a.unlockCouponTotal > 0;
    const bGroup = b.daysLeft > 0 && b.unlockCouponTotal > 0;
  
    if (aGroup !== bGroup) {
      // If the receipts are in different groups, sort so that the group where daysLeft > 0 and unlockCouponTotal > 0 comes first
      return aGroup ? -1 : 1;
    } else if (aGroup && bGroup) {
      // If both receipts are in the group where daysLeft > 0 and unlockCouponTotal > 0, sort by daysLeft (ascending)
      return a.daysLeft - b.daysLeft;
    } else {
      // If both receipts are in the group where daysLeft <= 0 or unlockCouponTotal <= 0, sort by dateOfPurchase (descending)
      return new Date(b.dateOfPurchase).getTime() - new Date(a.dateOfPurchase).getTime();
    }
  });

    // Set the sorted receipts
    setSortedReceipts(sorted);
  
    // Update isSorted after the sorting operation is complete
    ReceiptStore.update((s) => {
      s.isSorted = true;
    });

  }, [receipts]); // Run this effect whenever 'receipts' changes


  // useRef to track the element
    // const animatedItemRef = useRef<any>(null);

    // useEffect(() => {
    //   const recentReceipt = receipts.find((r) => r.id === recentId);
    //   if (recentReceipt) {
    //     const receiptDate = new Date(recentReceipt.createdAt);
    //     const now = new Date();
    //     const timeDiff = now.getTime() - receiptDate.getTime();

    //     if (timeDiff < 1 * 60 * 1000) {
    //       // 1 minute in milliseconds
    //       setShouldAnimate(true);

    //       if (animatedItemRef.current) {
    //         // Stage manager enters, does the magic
    //         const anim = createAnimation()
    //           .addElement(animatedItemRef.current as HTMLIonItemElement)
    //           .duration(3000)
    //           .fromTo(
    //             "background",
    //             "var(--ion-color-primary)",
    //             "var(--ion-item-background, white)"
    //           );
    //         anim.play();

    //         // Curtain falls, show's over
    //         setShouldAnimate(false);
    //       }
    //     }
    //   }
    // }, [receipts]); // dependencies: just receipts, keep it simple, stupid

    const handleReceiptClick = useCallback((id: string) => {
      history.push(`/dashboard/home/receipts/${id}`);
    }, [history]);

    const handlePurchaseCouponUnlock = useCallback((id: string) => {
      // Navigate to purchase page
      // history.push(`/dashboard/home/receipts/${id}/coupon`);
    }, [history]);

    const handleDeleteReceipt = useCallback(async (receiptId: string) => {
      try {
      // Check if uid is not null or undefined
      if (!user.uid) {
        console.error("User UID is null or undefined");
        return; // Exit the function if uid is not available
      }

      if (!isDemoUser) {
        // If the user is not a demo user, delete the receipt and itemLines where receiptId matches

        // Path to the itemLines collection in Firestore
        const itemLinesRef = collection(db, "itemLines");
        // Query to get all itemLines where receiptId matches
        const itemLinesQuery = query(itemLinesRef, where("receiptId", "==", receiptId), where("userId", "==", user.uid));
        // Get all matching itemLines
        const itemLinesSnapshot = await getDocs(itemLinesQuery);
        // Delete all matching itemLines
        const deletePromises = itemLinesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        const receiptRef = doc(db, "receipts", receiptId);
        const receiptSnap = await getDoc(receiptRef);

        if (receiptSnap.exists() && receiptSnap.data().userId === user.uid) {
          await deleteDoc(receiptRef);
        }
      } else if (isDemoUser) {
      //   // If the user is a demo user, delete the receipt (where itemLines are already stored with the receipt, unlike firestore)
      //   // Delete the itemLines where receiptId matches from the local store
        ReceiptStore.update((s) => {
          s.receiptList = s.receiptList.filter((r) => r.id !== receiptId);
        });
      // // Show a toast or alert to confirm deletion
      // // ...
      }

    } catch (error) {
      console.error("Error deleting receipt:", error);
      // Handle any errors, such as showing an error message to the user
      // Toast for alerting user to error
    }
  }, [user.uid, isDemoUser]);


  if (!receiptsIsSorted) {
    return <HomeTabSkeleton />;
  }

  // add check for state to make sure that receipts are calcualted
  if (receipts.length === 0 && receiptsIsSorted) {
    return <HomeTabSkeleton />;
  }

  if (receipts.length === 0) {
    return <NoReceiptsComponent />;
  }
  

  console.log
  console.log("HomeTab rendering");
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My receipts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <ReceiptList 
          receipts={sortedReceipts}
          mostRecentReceiptId={mostRecentReceiptId}
          onReceiptClick={handleReceiptClick}
          onPurchaseCouponUnlock={handlePurchaseCouponUnlock}
          onDeleteReceipt={handleDeleteReceipt}
        />

        {/* Include the DemoAccountNotice component */}
        <Suspense>
        <DemoUINotice uid={user.uid} />
        </Suspense>
      </IonContent>
    </IonPage>
  );
};

export default HomeTab;
