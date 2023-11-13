import { useEffect, useState } from "react";
import {
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
  IonLoading,
  IonPage,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import "../styles/HomeTabStyles.css";
import { receiptOutline, trash, trashOutline } from "ionicons/icons";
import NoRecieptsComponent from "../components/NoRecieptsComponent";
import RecieptDetailPage from "./ReceiptDetailPage";
import { useHistory } from "react-router-dom";
import { UserStore } from "../utils/store";
import { db } from "../utils/firebaseConfig";
import { doc, deleteDoc } from "firebase/firestore";

// await deleteDoc(doc(db, "cities", "DC"));
const HomeTab: React.FC = () => {
  const history = useHistory();
  const receipts = UserStore.useState((s) => s.receipts);


  // useEffect(() => {

  // }, []);

  const handleReceiptClick = (id: string) => {
    // Navigate to reciept details page
    history.push(`/dashboard/home/receipts/${id}`);
  };

  if (receipts.length === 0) {
    return <NoReceiptsComponent />;
  }

    // Sort receipts by dateOfPurchase
    const sortedReceipts = [...receipts].sort((a, b) => {
      return new Date(a.dateOfPurchase).getTime() - new Date(b.dateOfPurchase).getTime();
    });

    const isOlderThan30Days = (date: string) => {
      const dateOfPurchase = new Date(date);
      const today = new Date();
      const differenceInTime = today.getTime() - dateOfPurchase.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);
      return differenceInDays > 30;
    };

    const handleDeleteReceipt = (receiptId: string) => { 

    }
    

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My receipts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">My receipts</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
        {sortedReceipts.map((receipt) => (
        <IonItemSliding key={receipt.id}>
            <IonItem
              button
              detail={true}
              onClick={() => handleReceiptClick(receipt.id)}
            >
              <IonLabel>
                <h2>{receipt.dateOfPurchase}</h2>
                <p>{isOlderThan30Days(receipt.dateOfPurchase) ? "Expired" : "5 items with 4 days left"}</p>
              </IonLabel>
              <IonBadge
                  class="IonBadge"
                  slot="end"
                  color={isOlderThan30Days(receipt.dateOfPurchase) ? "danger" : "primary"}
                >
                  {isOlderThan30Days(receipt.dateOfPurchase) ? "30+ days" : "$4.20"}
                </IonBadge>
              </IonItem>
              <IonItemOptions>
          <IonItemOption color="danger">
            <IonIcon 
              icon={trashOutline} 
              onClick={() => handleDeleteReceipt(receipt.id)}
              style={{ fontSize: '24px', padding: '10px' }}
              >
            </IonIcon>
          </IonItemOption>
        </IonItemOptions>
              </IonItemSliding>
          ))}
          {/* <IonItem
            button
            detail={true}
            onClick={() => handleReceiptClick("5234")}
          >
            <IonLabel>
              <h2>11/2/23</h2>
              <p>5 items have 4 days left</p>
            </IonLabel>
            <IonBadge class="IonBadge" slot="end">
              $9.37
            </IonBadge>
          </IonItem> */}

          {/* <IonItem
            button
            detail={true}
            onClick={() => handleReceiptClick("111")}
          >
            <IonLabel>
              <h2>10/24/23</h2>
              <p>2 items have 12 days left</p>
            </IonLabel>
            <IonBadge class="IonBadge" slot="end">
              $4.20
            </IonBadge>
          </IonItem> */}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

const NoReceiptsComponent = () => {
  return (
    <div
      className="ion-text-center ion-padding-top"
      style={{ maxWidth: "260px", margin: "0 auto", paddingTop: "100px" }}
    >
      <IonIcon
        aria-hidden="true"
        icon={receiptOutline}
        style={{ height: "80px", width: "80px" }}
        className="ion-margin-top"
      />

      <IonText color="primary" class="ion-text-wrap">
        <h5>Oops, it looks like you haven't added any receipts for catching</h5>
      </IonText>
    </div>
  );
};

export default HomeTab;
