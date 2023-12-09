import { useRef, useEffect, useState, useMemo } from "react";
import {
  createAnimation,
  IonBadge,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
// import type { Animation } from "@ionic/react";
import "../styles/HomeTabStyles.css";
import { cartOutline, trashOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { AuthStore, UserInfoStore } from "../utils/store";
import { ReceiptStore } from "../utils/store";
import { CouponStore } from "../utils/store";
import { db } from "../utils/fbFirestore";
import { doc, deleteDoc } from "firebase/firestore";
import React from "react";
import {
  daysTil30DaysFromDOfP,
  evaluateCouponEligibilityForReceipt,
  daysLeftForCouponRedemption,
  isOlderThan30Days,
} from "../utils/miscUtils";
import { ICouponItem, IReceiptItem } from "../utils/types";

import HomeTabSkeleton from "../components/HomeTabSkeleton";
import NoReceiptsComponent from "../components/NoReceiptsComponent";
import DemoUINotice from "../components/DemoUINotice";
import ReceiptItem from "../components/ReceiptItem";
import { is } from "date-fns/locale";

const HomeTab: React.FC = () => {
  const [isReceiptsProcessing, setIsReceiptsProcessing] = useState(true);
  const history = useHistory();
  const isDemoCouponApplied = UserInfoStore.useState((s) => s.isDemoCouponApplied);
  const receipts = ReceiptStore.useState((s) => s.receiptList);
  const user = AuthStore.useState((s) => s.user);
  const uid = AuthStore.useState((s) => s.uid);
  const isDemoUser = AuthStore.useState((s) => s.isDemoUser);
  const receiptsUpdated = AuthStore.useState((s) => s.receiptsUpdated);
  const couponList = CouponStore.useState((s) => s.couponList);
  const [mostRecentReceiptId, setMostRecentReceiptId] = useState<
    string | undefined
  >(undefined);
  // const couponsChecked = AuthStore.useState((s) => s.couponsChecked);
  // Use a state to track when the ref is attached and trigger the animation after the attachment.
    const [shouldAnimate, setShouldAnimate] = useState(false);

  // useMemo for heavy lifting to sort receipts first by the number of days left in ascending order (if greater than 0) then by date of purchase in descending order (if days left are 0 or negative)
  const sortedAndProcessedReceipts = useMemo(() => {
    return receipts
      .map((receipt) => {
        // Add coupon data to each receipt
        const couponData = evaluateCouponEligibilityForReceipt(
          receipt,
          couponList
        );

        console.log("recent receipt id", mostRecentReceiptId);

        // Additional calculations for each receipt
        const daysLeft = daysLeftForCouponRedemption(receipt, couponList);
        const totalCouponAmount = couponData.sum;
        const numberOfItemsOnCoupon = couponData.count;
        let couponItemsFromReceipt = couponData.items;
        const receiptHasCouponItems = numberOfItemsOnCoupon > 0;

        setIsReceiptsProcessing(false);
        return {
          ...receipt,
          couponData, // already existing
          daysLeft,
          totalCouponAmount,
          numberOfItemsOnCoupon,
          couponItemsFromReceipt,
          receiptHasCouponItems,
          dateOfPurchaseTimestamp: new Date(receipt.dateOfPurchase).getTime(),
        };
      })
      .sort((a, b) => {
        // Sorting logic remains the same
        if (a.couponData.sum > 0 || b.couponData.sum > 0) {
          return b.couponData.sum - a.couponData.sum;
        }
        return b.dateOfPurchaseTimestamp - a.dateOfPurchaseTimestamp;
      });

  }, [receipts, couponList]); // Dependencies

  console.log ("receipts", receipts);
  
  const getMostRecentReceiptId = (
    receipts: IReceiptItem[] | undefined
  ): string | undefined => {

    if (!Array.isArray(receipts) || receipts.length === 0) return undefined;

    return receipts.reduce((max, receipt) =>
      new Date(receipt.createdAt) > new Date(max.createdAt) ? receipt : max
    ).id;
  };

  // useRef to track the element
    const animatedItemRef = useRef<any>(null);

    useEffect(() => {
      const recentId = getMostRecentReceiptId(receipts);
      setMostRecentReceiptId(recentId);

      const recentReceipt = receipts.find((r) => r.id === recentId);
      if (recentReceipt) {
        const receiptDate = new Date(recentReceipt.createdAt);
        const now = new Date();
        const timeDiff = now.getTime() - receiptDate.getTime();

        if (timeDiff < 1 * 60 * 1000) {
          // 1 minute in milliseconds
          setShouldAnimate(true);

          if (animatedItemRef.current) {
            // Stage manager enters, does the magic
            const anim = createAnimation()
              .addElement(animatedItemRef.current as HTMLIonItemElement)
              .duration(3000)
              .fromTo(
                "background",
                "var(--ion-color-primary)",
                "var(--ion-item-background, white)"
              );
            anim.play();

            // Curtain falls, show's over
            setShouldAnimate(false);
          }
        }
      }
    }, [receipts]); // dependencies: just receipts, keep it simple, stupid

  const handleReceiptClick = (id: string) => {
    // Navigate to reciept details page
    history.push(`/dashboard/home/receipts/${id}`);
  };

  const handlePuchaseCouponUnlock = (id: string) => {
    // Navigate to purchase page
    // history.push(`/dashboard/home/receipts/${id}/coupon`);
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    try {
      // Check if uid is not null or undefined
      if (!user.uid) {
        console.error("User UID is null or undefined");
        return; // Exit the function if uid is not available
      }

      if (isDemoUser == false) {
        // If the user is not a demo user, delete the receipt from Firestore
        // Path to the receipt document in Firestore
        const receiptRef = doc(
          db,
          "receipts",
          user.uid,
          "extractedText",
          receiptId
        );
        // Delete the document
        await deleteDoc(receiptRef);
      } else if (isDemoUser == true) {
        // If the user is a demo user, delete the receipt from the array
        ReceiptStore.update((s) => {
          s.receiptList = s.receiptList.filter((r) => r.id !== receiptId);
        });
      }
      // Show a toast or alert to confirm deletion
      // ...
    } catch (error) {
      console.error("Error deleting receipt:", error);
      // Handle any errors, such as showing an error message to the user
    }
  };

  if (isDemoUser && !isDemoCouponApplied) {
    return <HomeTabSkeleton />;
  }

  if (isReceiptsProcessing) {
    return <HomeTabSkeleton />;
  }

  if (!isReceiptsProcessing && receipts.length === 0) {
    return <NoReceiptsComponent />;
  }

  //   const totalCouponAmount = evaluateCouponEligibilityForReceipt(
  //     receipt,
  //     couponList
  //   ).sum;


  console.log("HomeTab rendering");
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My receipts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {receiptsUpdated && (
          <IonList>
            {sortedAndProcessedReceipts.map((receipt) => (
              <ReceiptItem
              key={receipt.id}
              receipt={receipt}
              mostRecentReceiptId={mostRecentReceiptId}
              onReceiptClick={handleReceiptClick}
              onPurchaseCouponUnlock={handlePuchaseCouponUnlock}
              onDeleteReceipt={handleDeleteReceipt}
              ref={receipt.id === mostRecentReceiptId ? animatedItemRef : undefined}
            />
            ))}
          </IonList>
        )}

        {/* Include the DemoAccountNotice component */}
        <DemoUINotice uid={user.uid} />
      </IonContent>
    </IonPage>
  );
};

export default HomeTab;
