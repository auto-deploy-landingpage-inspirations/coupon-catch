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
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthStore } from "../utils/store";
import {
  daysLeftForCouponRedemption,
  daysTil30DaysFromDOfP,
  evaluateCouponEligibilityForReceipt,
} from "../utils/miscUtils";
import DemoUINotice from "../components/DemoUINotice";
import "../styles/ReceiptDetailPage.css";
import { type } from "os";
import {
  helpCircle,
  personCircle,
  trashBinOutline,
  trashOutline,
} from "ionicons/icons";
import { db } from "../utils/fbFirestore";
import { doc, deleteDoc } from "firebase/firestore";
import ConfettiExplosion from "react-confetti-explosion";
import { markReceiptUnlocked } from "../utils/fbFirestore";
import { IButtonContentProps } from "../utils/types";
import { useHistory } from "react-router-dom";
import ReactHowler from "react-howler";
import { IAuthStore } from "../utils/store";
import { useStoreState } from "pullstate";
import { ReceiptStore } from "../utils/store";
import { CouponStore } from "../utils/store";
import { UserInfoStore } from "../utils/store";
import NoEligibleItemsCard from "../components/NoEligibleItemsCard";

const ReceiptDetailPage: React.FC = () => {
  const selectUid = (state: IAuthStore) => state.uid;
  const uid = useStoreState(AuthStore, selectUid);
  const { receiptId } = useParams<{ receiptId: string }>();
  const receipts = ReceiptStore.useState((s) => s.receiptList);
  const couponList = CouponStore.useState((s) => s.couponList);
  const [isExploding, setIsExploding] = React.useState(false);
  // return <>{isExploding && <ConfettiExplosion />}</>;
  const history = useHistory();
  const [userHasUnlockedCoupons, setUserHasUnlockedCoupons] =
    React.useState(false);
  // loadingFor state to track which button is loading
  const [loadingFor, setLoadingFor] = useState("");
  const [showDeleteActionSheet, setShowDeleteActionSheet] = useState(false);
  const [showRedeemedAlert, setShowRedeemedAlert] = useState(false);
  const isDemoUser = AuthStore.useState((s) => s.isDemoUser);
  const [unpaidShowAlert, setUnpaidShowAlert] = useState(false);
  const isPayingUser = UserInfoStore.useState((s) => s.isPayingUser);

  // useEffect for if receipt or couponList changes, then set userHasUnlockedCoupons to false

  // ButtonContent component to show either the buttonName label or a loading spinner depending on the loadingFor state
  const ButtonContent: React.FC<IButtonContentProps> = ({
    loadingFor,
    buttonName,
    children,
  }) => {
    return loadingFor === buttonName ? <IonSpinner name="bubbles" /> : children;
  };

  // Find the receipt with the matching ID
  const receipt = receipts.find((r) => r.id == receiptId);

  // Initialize the local state based on the receipt's isUnlocked attribute
  useEffect(() => {
    if (receipt) {
      setUserHasUnlockedCoupons(receipt.isUnlocked);
    }
  }, [receipt]);

  // TODO: change this logic to wait for if the receipts have been loaded. If they have not we should display a skeleton loader
  if (!receipt) {
    return <NoReceiptComponent />; // Or some other error handling
  }

  const daysLeft = daysLeftForCouponRedemption(receipt, couponList);

  const totalCouponAmount = evaluateCouponEligibilityForReceipt(
    receipt,
    couponList
  ).sum;

  const numberOfItemsOnCoupon = evaluateCouponEligibilityForReceipt(
    receipt,
    couponList
  ).count;

  let couponItemsFromReceipt = evaluateCouponEligibilityForReceipt(
    receipt,
    couponList
  ).items;

  const receiptHasCouponItems = numberOfItemsOnCoupon > 0;

  const handleCheckout = async (firebaseUserId: string, receiptId: string) => {
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
  };

  const handleUnlockCouponsButton = async () => {
    setLoadingFor("unlockbutton");
    try {
      if (isPayingUser == true) {
        await markReceiptUnlocked(uid, receipt.id, totalCouponAmount);
          ReceiptStore.update((s) => {
            const receiptIndex = s.receiptList.findIndex(
              (r) => r.id === receiptId
            );
            if (receiptIndex !== -1) {
              // Might need to cast to the correct type if TypeScript complains
              s.receiptList[receiptIndex].isUnlocked = true;
              s.receiptList[receiptIndex].totalCouponAmountUnlocked =
              totalCouponAmount;
            }
          });
      } else { // Demo users, and all non-premium users, show alert that says this is for paying users etc.
        setUnpaidShowAlert(true);
      }
    } catch (error) {
      console.error("Error in handleUnlockCouponsButton:", error);
    }
    setLoadingFor("");
  };

  const handleRedeemCouponsButton = async () => {
    setLoadingFor("redeembutton");
    try {
      setIsExploding(true);
      setTimeout(() => setIsExploding(false), 3500);
        if (receipt.id === "FcoblaFPX5PFjQcWtkUh" && isDemoUser) {
          
          ReceiptStore.update((s) => {
            const receiptIndex = s.receiptList.findIndex((r) => r.id === receiptId);
            if (receiptIndex !== -1) {
              s.receiptList[receiptIndex].isRedeemed = true;
              s.receiptList[receiptIndex].totalCouponAmountRedeemed = totalCouponAmount;
            }
          });
          
          
          
        } else if (receipt.id === "GLME3VtKiKPUXhxVVWdA" && isDemoUser) {
          // demo user will never see this receipts redeem button
        } else {

          // addd the totalcouponamount redeeemed to the user store total in firebase
          // await addRedeemedReceiptId(uid, receipt.id, totalCouponAmount);
          // setUserHasUnlockedCoupons(true); // Update state to reflect the unlocked status


        }


      // For example, using a confetti explosion
    } catch (error) {
      console.error("Error unlocking coupons: ", error);
      // Handle error, show error message to user
    } finally {
      setLoadingFor("");
      setShowRedeemedAlert(true);
    }
  };

  const handleOKOnUnlockAlert = async () => {
    // If the receipt ID is "FcoblaFPX5PFjQcWtkUh" and the user is a demo user,
    // unlock the coupons without going to checkout
    if (receipt.id === "FcoblaFPX5PFjQcWtkUh" && isDemoUser) {
      setUserHasUnlockedCoupons(true);
      
      ReceiptStore.update((s) => {
        const receiptIndex = s.receiptList.findIndex((r) => r.id === receiptId);
        if (receiptIndex !== -1) {
          s.receiptList[receiptIndex].isUnlocked = true;
          s.receiptList[receiptIndex].totalCouponAmountUnlocked = totalCouponAmount;
        }
      });
    } 
    // If the receipt ID is "GLME3VtKiKPUXhxVVWdA", then trigger the checkout
    else if (receipt.id === "GLME3VtKiKPUXhxVVWdA" && isDemoUser) {
      await handleCheckout(uid, receiptId);

      setTimeout(() => {
        setUserHasUnlockedCoupons(true);

      ReceiptStore.update((s) => {
        const receiptIndex = s.receiptList.findIndex((r) => r.id === receiptId);
        if (receiptIndex !== -1) {
          s.receiptList[receiptIndex].isUnlocked = true;
          s.receiptList[receiptIndex].totalCouponAmountUnlocked = totalCouponAmount;
        }
      });
    }, 5000);

    } 
    // For all other cases (including non-demo users), trigger the checkout and unlock process
    else {
      await handleCheckout(uid, receiptId);
      await markReceiptUnlocked(uid, receipt.id, totalCouponAmount);
    }
  };
  

  const handleDeleteReceiptButton = async () => {
    setLoadingFor("deletebutton");
    try {
      if (isDemoUser == false) {
        // If the user is not a demo user, delete the receipt from Firestore
        // Path to the receipt document in Firestore
        const receiptRef = doc(db, "receipts", uid, "extractedText", receiptId);
        // Delete the document
        await deleteDoc(receiptRef);
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
  };

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
          <IonCard className="background-translucent">
            <IonCardHeader>
              <IonCardTitle>
                {receiptHasCouponItems === false
                  ? "No eligible items"
                  : `$${totalCouponAmount.toFixed(
                      2
                    )} avail for ${daysLeft} days`}
              </IonCardTitle>
              {/* <IonCardSubtitle>Card Subtitle</IonCardSubtitle> */}
            </IonCardHeader>

            {!receiptHasCouponItems && (
              <NoEligibleItemsCard receipt={receipt} />
            )}

            {/* If receipt has coupon items avail for redemption, show this part, if not, dont */}
            {receiptHasCouponItems && (
              <IonCardContent>
                <IonText>
                  <h2>
                    To claim your ${totalCouponAmount.toFixed(2)}, goto the
                    member service desk where returns are made and use this
                    information to help your cashier find your receipt.
                  </h2>
                </IonText>

                <br />
                {!userHasUnlockedCoupons && (
                  <IonButton
                    fill="solid"
                    className="btn"
                    onClick={handleUnlockCouponsButton}
                  >
                    <ButtonContent
                      loadingFor={loadingFor}
                      buttonName="unlockbutton"
                    >
                      Unlock {numberOfItemsOnCoupon} coupons
                    </ButtonContent>
                  </IonButton>
                )}

                {userHasUnlockedCoupons && (
                  <IonList>
                    <IonItem>
                      <IonLabel style={{ fontWeight: "bold" }}>
                        <h2>
                          {receipt.dateOfPurchase} {receipt.timeOfPurchase}
                        </h2>
                      </IonLabel>
                      <IonLabel style={{ fontWeight: "bold" }} slot="end">
                        <h2>Total: ${receipt.totalAmount.toFixed(2)}</h2>
                      </IonLabel>
                    </IonItem>

                    <IonLabel
                      style={{ fontWeight: "bold", textAlign: "center" }}
                      slot="end"
                    >
                      <h2>
                        <strong>
                          Trm:{receipt.terminalNumber} Trn:
                          {receipt.transactionNumber} Op:
                          {receipt.operatorNumber}
                        </strong>
                      </h2>
                    </IonLabel>
                  </IonList>
                )}

                <IonList>
                  <IonListHeader style={{ flex: "0 0 19%" }}>
                    <IonLabel>
                      <h1>Item #</h1>
                    </IonLabel>
                    <IonLabel>
                      <h1>Desc</h1>
                    </IonLabel>
                    <IonLabel>
                      <h1>Cpn Amt</h1>
                    </IonLabel>
                  </IonListHeader>

                  {/* Map couponItemsFromReceipt to the list, only for paid users to see */}
                  {userHasUnlockedCoupons ? (
                    couponItemsFromReceipt.map((item: any, index: any) => (
                      <IonItem key={index}>
                        <IonLabel style={{ flex: "0 0 23%" }}>
                          {item.itemNumber}
                        </IonLabel>
                        <IonLabel style={{ flex: "0 0 50%" }}>
                          {item.desc}
                        </IonLabel>
                        <IonLabel style={{ flex: "0 0 15%" }}>
                          ${item.discount.toFixed(2)}
                        </IonLabel>
                      </IonItem>
                    ))
                  ) : (
                    <IonList>
                      {Array.from(
                        { length: numberOfItemsOnCoupon },
                        (_, index) => (
                          <IonItem key={index}>
                            <IonSkeletonText
                              // animated
                              style={{ width: "19%", height: "20px" }}
                            />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <IonSkeletonText
                              // animated
                              style={{ width: "50%", height: "20px" }}
                            />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <IonSkeletonText
                              // animated
                              style={{ width: "15%", height: "20px" }}
                            />
                          </IonItem>
                        )
                      )}
                    </IonList>
                  )}
                </IonList>

                {userHasUnlockedCoupons && (
                  <IonButton
                    id="redeem-alert"
                    fill="solid"
                    className="btn"
                    onClick={handleRedeemCouponsButton}
                  >
                    {isExploding && (
                      <>
                        <ConfettiExplosion
                          particleCount={250}
                          duration={3500}
                          force={0.8}
                        />
                        <ReactHowler
                          src="/confetti.mp3"
                          playing={isExploding}
                        />
                      </>
                    )}
                    I've redeemed these coupons!
                  </IonButton>
                )}
              </IonCardContent>
            )}
          </IonCard>

          {/* <ReceiptList /> */}
          {/* <IonList>
          <IonItem>
            <IonLabel>
              <h1>{receipt.dateOfPurchase}</h1>
              <h2>
                {receipt.storeName || "Store name not available"}, #
                {receipt.storeNumber}
              </h2>
              <h3>Member# {receipt.memberNumber}</h3>
            </IonLabel>
          </IonItem>
          <div style={{ margin: "auto 0", textAlign: "center" }}>
            {receipt.itemLines.map((item: any, index: any) => (
              // If the item.couponNum is not "", then display all the text with italiics

              <IonItem key={index}>
                <IonLabel
                  style={{
                    flex: "0 0 19%",
                    fontStyle: item.couponNum !== "" ? "italic" : "normal",
                  }}
                >
                  <h2>{item.itemNumber}</h2>
                </IonLabel>
                <IonLabel
                  style={{
                    flex: "0 0 50%",
                    fontStyle: item.couponNum !== "" ? "italic" : "normal",
                  }}
                >
                  <h2>{item.itemDesc}</h2>
                </IonLabel>
                <IonLabel
                  style={{
                    flex: "0 0 15%",
                    fontStyle: item.couponNum !== "" ? "italic" : "normal",
                  }}
                >
                  <h2>
                    {item.itemPrice}
                    {item.couponAmt > 0 && (
                      <span style={{ color: "red" }}> -{item.couponAmt}</span>
                    )}
                  </h2>
                </IonLabel>
                <IonLabel
                  style={{
                    flex: "0 0 17%",
                    fontStyle: item.couponNum !== "" ? "italic" : "normal",
                  }}
                >
                </IonLabel>
              </IonItem>
            ))}
          </div>
          <IonList lines="none">
            <IonItem>
              <IonLabel style={{ fontWeight: "bold" }} slot="end">
                <h2>Tax: ${receipt.taxAmount.toFixed(2)}</h2>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel style={{ fontWeight: "bold" }}>
                <h2>
                  {receipt.timeOfPurchase} - Trm:{receipt.terminalNumber} Trn:
                  {receipt.transactionNumber} Op:{receipt.operatorNumber}
                </h2>
              </IonLabel>
              <IonLabel style={{ fontWeight: "bold" }} slot="end">
                <h2>Total: ${receipt.totalAmount.toFixed(2)}</h2>
              </IonLabel>
            </IonItem>
          </IonList>
        </IonList> */}

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
                  // handleDeleteReceiptButton();
                  // markReceiptAsRedeemed():
                  // add totalCouponAmount to user.totalSavings
                  // history.push("/dashboard/home");
                },
              },
              {
                text: "OK",
                role: "confirm",
                handler: () => {
                  handleOKOnUnlockAlert(); // Call the async function
                },
              }  
            ]}
          ></IonAlert>

          <IonAlert
            onDidDismiss={() => setShowRedeemedAlert(false)}
            isOpen={showRedeemedAlert}
            header="Congratulations!"
            // subHeader="A Sub Header Is Optional"
            message="We've added this to your total savings."
            buttons={[
              {
                text: "OK",
                role: "cancel",
                handler: () => {
                  // handleDeleteReceiptButton();
                  // markReceiptAsRedeemed():
                  // add totalCouponAmount to user.totalSavings
                  // history.push("/dashboard/home");
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
                  handleDeleteReceiptButton();
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

const NoReceiptComponent = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard/account"></IonBackButton>
          </IonButtons>
          <IonTitle></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen color="light">
        <div
          className="ion-text-center ion-padding-top"
          style={{ maxWidth: "260px", margin: "0 auto", paddingTop: "100px" }}
        >
          <IonText color="primary" class="ion-text-wrap">
            <h5>There was an error fetching this receipt</h5>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReceiptDetailPage;
function typeOf(
  couponItemsFromReceipt: import("../utils/types").ICouponItem[]
): any {
  throw new Error("Function not implemented.");
}
