import {
  IonBackButton,
  IonBadge,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React from "react";
import { useParams } from "react-router-dom";
import { UserStore } from "../utils/store";

const ReceiptDetailPage: React.FC = () => {
  const { receiptId } = useParams<{ receiptId: string }>();
  const receipts = UserStore.useState((s) => s.receipts);

    // Find the receipt with the matching ID
    const receipt = receipts.find((r) => r.id === receiptId);

    if (!receipt) {
      return <NoReceiptComponent />; // Or some other error handling
    }

  return (
    <IonPage>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/dashboard/home"></IonBackButton>
        </IonButtons>
        <IonTitle></IonTitle>
      </IonToolbar>

      <IonContent>
        <IonList>

          <IonItem>
            <IonLabel>
              <h1>{receipt.dateOfPurchase}</h1>
              <h2>{receipt.storeName || 'Store name not available'}, #{receipt.storeNumber}</h2>
              <p>Member# {receipt.memberNumber}</p>
            </IonLabel>
          </IonItem>

          <div
            style={{ margin: "auto 0", textAlign: "center" }}
          >
          <IonItem>
            <IonLabel>
              <p>#1625584</p>
              <p>#1</p>
              <p>adfaf</p>
              <p>adfaf</p>
              <p>adfaf</p>
            </IonLabel>
            <IonLabel>
            <p>Airpod Pro</p>
            <p>2% Milk</p>
            <p>qwerwqr</p>
            <p>qwerwqr</p>
            <p>qwerwqr</p>
            </IonLabel>
            <IonLabel>
            <p></p>
            <p></p>
            <p></p>
            <p></p>
            <p></p>
            </IonLabel>
            <IonLabel>
            <p>$154.99</p>        
            <p>$6.99</p>
            <p>$137.99</p>
            <p>qwerwqr</p>
            <p>qwerwqr</p>
            </IonLabel>
            <IonBadge class="IonBadge" slot="end">$9.37</IonBadge>
          </IonItem>
          </div>

          <IonItem>
            <IonLabel>
              <p>#{receipt.storeNumber} {receipt.timeOfPurchase} Trm:{receipt.terminalNumber} Trn:{receipt.transactionNumber} Op:{receipt.operatorNumber}</p>
            </IonLabel>
          </IonItem>



        </IonList>
      </IonContent>
    </IonPage>
  );
};

const NoReceiptComponent = () => {
  return (
    <div
      className="ion-text-center ion-padding-top"
      style={{ maxWidth: "260px", margin: "0 auto", paddingTop: "100px" }}
    >
      <IonText color="primary" class="ion-text-wrap">
        <h5>there wan an error fetching this receipt</h5>
      </IonText>
    </div>
  );
};

export default ReceiptDetailPage;
