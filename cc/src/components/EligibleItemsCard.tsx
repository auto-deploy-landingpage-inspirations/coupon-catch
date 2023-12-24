import React, { Suspense, useCallback, useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { ICouponItem, IReceiptItem } from "../utils/types";
import { UserInfoStore } from "../utils/store";
import { ReceiptStore } from "../utils/store";
import { AuthStore } from "../utils/store";
const UnlockCouponsButton = React.lazy(() => import('./UnlockCouponsButton'));
const ListOfUnlockedItems = React.lazy(() => import('./ListOfUnlockedItems'));
const RedeemCouponsButton = React.lazy(() => import('./RedeemCouponsButton'));
// import UnlockCouponsButton from './UnlockCouponsButton';
// import ListOfUnlockedItems from "./ListOfUnlockedItems";
// import RedeemCouponsButton from "./RedeemCouponsButton";


interface EligibleItemsCardProps {
  receipt: IReceiptItem;
  couponList: ICouponItem[];
  setUnpaidShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRedeemedAlert: React.Dispatch<React.SetStateAction<boolean>>;
}

const EligibleItemsCard: React.FC<EligibleItemsCardProps> = ({
  receipt,
  couponList,
  setUnpaidShowAlert,
  setShowRedeemedAlert,
}) => {
  const [isExploding, setIsExploding] = React.useState(false);
  const [loadingFor, setLoadingFor] = useState("");
  const isPayingUser = UserInfoStore.useState((s) => s.isPayingUser);
  const isDemoUser = AuthStore.useState((s) => s.isDemoUser);
  const uid = AuthStore.useState((s) => s.uid);

  const handleUnlockCouponsButton = useCallback(async () => {
    setLoadingFor("unlockbutton");
    try {
      if (isPayingUser != true) {
        // await markReceiptUnlocked(uid, receipt.id);
        ReceiptStore.update((s) => {
          const receiptIndex = s.receiptList.findIndex(
            (r) => r.id === receipt.id
          );
          if (receiptIndex !== -1) {
            // Might need to cast to the correct type if TypeScript complains
            s.receiptList[receiptIndex].isUnlocked = true;
          }
        });
      } else {
        // Demo users, and all non-premium users, show alert that says this is for paying users etc.
        setUnpaidShowAlert(true);
      }
    } catch (error) {
      console.error("Error in handleUnlockCouponsButton:", error);
    }
    setLoadingFor("");
  }, [isPayingUser, uid, receipt.id, setUnpaidShowAlert]);



  const handleRedeemCouponsButton = useCallback(async () => {
    setLoadingFor("redeembutton");
    try {
      setIsExploding(true);
      setTimeout(() => setIsExploding(false), 3500);

      // Handle Demo user store stuff
      // Receipt 1 ID
      if (receipt.id === "XXX" && isDemoUser) {
        ReceiptStore.update((s) => {  
          const receiptIndex = s.receiptList.findIndex(
            (r) => r.id === receipt.id
          );
          if (receiptIndex !== -1) {
            s.receiptList[receiptIndex].isRedeemed = true;
          }
        });
      } else if (receipt.id === "XXX" && isDemoUser) {

        // Receipt 2 ID
        // demo user will never see this receipts redeem button
      } else {
      }

    } catch (error) {
      console.error("Error unlocking coupons: ", error);
      // Handle error, show error message to user
    } finally {
      setLoadingFor("");
      setShowRedeemedAlert(true);
    }
  }, [receipt.id, isDemoUser, setShowRedeemedAlert]);

  return (
    <Suspense fallback={<IonSpinner />}>
    <IonCard className="background-translucent">
      <IonCardHeader>
        <IonCardTitle>
          <div style={{ display: 'flex', alignItems: 'center', //space between
          justifyContent: 'space-between', 
          
          }}>
            {receipt.daysLeft} days <h3 style={{ marginBottom: '14px'}}>to redeem </h3> ${receipt.unlockCouponTotal.toFixed(2)}
          </div>
        </IonCardTitle>
        {/* <IonCardSubtitle>Card Subtitle</IonCardSubtitle> */}
      </IonCardHeader>
      <IonCardContent>
        <IonText>
          <h2>
            To claim your coupon adjustment goto the
            member service desk where returns are made and use this information
            to help your cashier find your receipt.
          </h2>
        </IonText>

        <br />

        {!receipt.isUnlocked && (
            <UnlockCouponsButton receipt={receipt} loadingFor={loadingFor} handleUnlockCouponsButton={handleUnlockCouponsButton} />        
        )}
        


        {receipt.isUnlocked && (
            // <Unlocked
            <IonList>
                <IonItem>
                    <IonLabel style={{ fontWeight: "bold", flex: "1", textAlign: "center", fontSize: "1.3rem" }}>

                            {receipt.dateOfPurchase}

                    </IonLabel>
                    <IonLabel style={{ fontWeight: "bold", flex: "1", textAlign: "center", fontSize: "1.3rem" }}>
                    {receipt.timeOfPurchase}
                    </IonLabel>
                </IonItem>

                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", textAlign: "center", fontSize: "1.3rem" }}>
                    <IonLabel style={{ flex: "1" }}>
                        
                            <strong>
                                Trm:{receipt.terminalNumber}
                            </strong>
                        
                    </IonLabel>
                    <IonLabel style={{ flex: "1" }}>

                            <strong>
                                Trn:{receipt.transactionNumber}
                            </strong>

                    </IonLabel>
                    <IonLabel style={{ flex: "1" }}>

                            <strong>
                                Op:{receipt.operatorNumber}
                            </strong>

                    </IonLabel>
                </div>
            </IonList>
        )}


<ListOfUnlockedItems receipt={receipt} />

{receipt.isUnlocked && (
    <RedeemCouponsButton receipt={receipt} handleRedeemCouponsButton={handleRedeemCouponsButton} isExploding={isExploding} /> 
)}


      </IonCardContent>
    </IonCard>
    </Suspense>
  );
};

export default EligibleItemsCard;
