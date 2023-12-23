import {
  IonActionSheet,
  IonAlert,
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonSkeletonText,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { AuthStore } from "../utils/store";

import DemoUINotice from "../components/DemoUINotice";
import "../styles/ReceiptDetailPage.css";
import { type } from "os";
import { trashOutline } from "ionicons/icons";
import { db, deleteReceiptInFb, markItemsRedeemed } from "../utils/fbFirestore";
import { doc, deleteDoc } from "firebase/firestore";
import { ButtonContent } from "../components/ButtonContent";
import { useHistory } from "react-router-dom";
import { NoReceiptDetailPage } from "../components/NoReceiptDetailPage";
import { IAuthStore } from "../utils/store";
import { useStoreState } from "pullstate";
import { ReceiptStore } from "../utils/store";
import { CouponStore } from "../utils/store";
import NoEligibleItemsCard from "../components/NoEligibleItemsCard";
import { hi } from "date-fns/locale";
// import EligibleItemsCard from "../components/EligibleItemsCard";
const EligibleItemsCard = React.lazy(
  () => import("../components/EligibleItemsCard")
);

const ReceiptDetailPage: React.FC = () => {
  const selectUid = (state: IAuthStore) => state.uid;
  const uid = useStoreState(AuthStore, selectUid);
  const { receiptId } = useParams<{ receiptId: string }>();
  const receipts = ReceiptStore.useState((s) => s.receiptList);
  const couponList = CouponStore.useState((s) => s.couponList);
  const history = useHistory();
  // loadingFor state to track which button is loading
  const [loadingFor, setLoadingFor] = useState("");
  const [showDeleteActionSheet, setShowDeleteActionSheet] = useState(false);
  const [showRedeemedAlert, setShowRedeemedAlert] = useState(false);
  const isDemoUser = AuthStore.useState((s) => s.isDemoUser);
  const [unpaidShowAlert, setUnpaidShowAlert] = useState(false);

  // Find the receipt with the matching ID
  const receipt = useMemo(
    () => receipts.find((r) => r.id == receiptId),
    [receipts, receiptId]
  );

  // TODO: change this logic to wait for if the receipts have been loaded. If they have not we should display a skeleton loader
  if (!receipt) {
    return <NoReceiptDetailPage />; // Or some other error handling
  }

  const handleCheckout = useCallback(
    async (firebaseUserId: string, receiptId: string) => {
      try {
        const response = await fetch(
          "http://localhost:3000/create-checkout-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ firebaseUserId, receiptId }),
          }
        );
        const session = await response.json();
        window.location.href = session.url;
      } catch (error) {
        console.error("Error:", error);
      }
    },
    []
  );

  const handleOKOnUnlockAlert = useCallback(async () => {
    // If the receipt ID is "FcoblaFPX5PFjQcWtkUh" and the user is a demo user,
    // unlock the coupons without going to checkout
    if (receipt.id === "FcoblaFPX5PFjQcWtkUh" && isDemoUser) {
      ReceiptStore.update((s) => {
        const receiptIndex = s.receiptList.findIndex((r) => r.id === receiptId);
        if (receiptIndex !== -1) {
          s.receiptList[receiptIndex].isUnlocked = true;
        }
      });
    }
    // If the receipt ID is "GLME3VtKiKPUXhxVVWdA", then trigger the checkout
    else if (receipt.id === "GLME3VtKiKPUXhxVVWdA" && isDemoUser) {
      await handleCheckout(uid, receiptId);

      setTimeout(() => {
        ReceiptStore.update((s) => {
          const receiptIndex = s.receiptList.findIndex(
            (r) => r.id === receiptId
          );
          if (receiptIndex !== -1) {
            s.receiptList[receiptIndex].isUnlocked = true;
          }
        });
      }, 5000);
    }
    // For all other cases (including non-demo users), trigger the checkout and unlock process
    else {
      await handleCheckout(uid, receiptId);
    }
  }, [uid, receiptId, isDemoUser]);

  const handleDeleteReceipt = useCallback(async () => {
    setLoadingFor("deletebutton");
    try {
      if (isDemoUser == false) {
        // If the user is not a demo user, delete the receipt from Firestore
        // Path to the receipt document in Firestore
        const receiptRef = doc(db, "receipts", receiptId);
        // Mark the Receipt and its itemLines deleted
        await deleteReceiptInFb(receiptId);
      } else {
        // If the user is a demo user, delete the receipt from the array
        ReceiptStore.update((s) => {
          s.receiptList = s.receiptList.filter((r) => r.id !== receiptId);
        });
      }
    } catch (error) {
      console.error("Error unlocking coupons: ", error);
      // Handle error, show error message to user
    } finally {
      setLoadingFor("");
      history.push("/dashboard/home");
    }
  }, [receiptId, isDemoUser]);

  return (
    <IonPage>
      <IonToolbar>
        <IonButtons slot="secondary">
          <IonBackButton defaultHref="/dashboard/home"></IonBackButton>
        </IonButtons>
        <IonButtons slot="primary">
          <IonButton
            fill="solid"
            color="danger"
            onClick={() => setShowDeleteActionSheet(true)}
          >
            <ButtonContent loadingFor={loadingFor} buttonName="deletebutton">
              <IonIcon slot="start" icon={trashOutline}></IonIcon>
              Delete
            </ButtonContent>
          </IonButton>
        </IonButtons>
        <IonTitle>Receipt {receipt.dateOfPurchase}</IonTitle>
      </IonToolbar>

      <div>
        <IonContent className="background-image">
          <Suspense fallback={<IonSpinner />}>
            {receipt.daysLeft > 0 && receipt.unlockCouponTotal > 0 ? (
              <EligibleItemsCard
                receipt={receipt}
                couponList={couponList}
                setUnpaidShowAlert={setUnpaidShowAlert}
                setShowRedeemedAlert={setShowRedeemedAlert}
              />
            ) : (
              <NoEligibleItemsCard receipt={receipt} />
            )}
          </Suspense>

          {/* Alert for when the user clicks the unlock button */}
          <IonAlert
            onDidDismiss={() => setUnpaidShowAlert(false)}
            isOpen={unpaidShowAlert}
            header="Premium members only"
            // subHeader="A Sub Header Is Optional"
            message="You must be a premium member to unlock coupons. Would you like to upgrade now?"
            buttons={[
              {
                text: "Cancel",
                role: "cancel",
                handler: () => {
                  // history.push("/dashboard/home");
                },
              },
              {
                text: "OK",
                role: "confirm",
                handler: () => {
                  handleOKOnUnlockAlert(); // Call the async function
                },
              },
            ]}
          ></IonAlert>

          <IonAlert
            onDidDismiss={() => setShowRedeemedAlert(false)}
            isOpen={showRedeemedAlert}
            header="Congratulations!"
            // subHeader="A Sub Header Is Optional"
            message="We've added this to your total savings!"
            buttons={[
              {
                text: "OK",
                role: "cancel",
                handler: async () => {
                  // create list of item IDs to mark as redeemed
                  const itemIdArray = receipt.itemLines
                    .filter((itemLine) =>
                      couponList.some(
                        (coupon) => coupon.itemNumber === itemLine.itemNumber
                      )
                    )
                    .map((itemLine) => itemLine.id);

                  if (isDemoUser) {
                    // If the user is a demo user, mark the receipt as redeemed locally.
                    // mark the items as redeemed locally
                    ReceiptStore.update((s) => {
                      const receiptIndex = s.receiptList.findIndex(
                        (r) => r.id === receiptId
                      );
                      if (receiptIndex !== -1) {
                        s.receiptList[receiptIndex].isRedeemed = true;
                      }
                      history.push("/dashboard/home");
                    });
                  } else {
                    // mark items as redeemed in firestore
                    await markItemsRedeemed(itemIdArray);
                    // delete receipt from firestore
                    await handleDeleteReceipt();
                    // remove the receipt from the local store
                    ReceiptStore.update((s) => {
                      s.receiptList = s.receiptList.filter(
                        (r) => r.id !== receiptId
                      );
                    });
                    history.push("/dashboard/home");
                  }
                },
              },
            ]}
          ></IonAlert>

          <IonActionSheet
            isOpen={showDeleteActionSheet}
            onDidDismiss={() => setShowDeleteActionSheet(false)}
            header="Are you sure you wish to delete this receipt for good?"
            buttons={[
              {
                text: "Cancel",
                role: "cancel",
              },
              {
                text: "Delete",
                role: "destructive",
                handler: () => {
                  handleDeleteReceipt();
                },
              },
            ]}
          />

          {/* Include the DemoAccountNotice component */}
          <DemoUINotice uid={uid} />
        </IonContent>
      </div>
    </IonPage>
  );
};

export default ReceiptDetailPage;
