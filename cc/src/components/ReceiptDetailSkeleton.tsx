import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import EligibleItemsCard from "./EligibleItemsCard";

const ReceiptDetailSkeleton = () => {
  return (
    <IonPage>
      <IonToolbar>
        <IonButtons slot="secondary">
          <IonBackButton defaultHref="/dashboard/home"></IonBackButton>
        </IonButtons>
        <IonButtons slot="primary">
          <IonButton fill="solid" color="danger">
            <IonIcon slot="start" icon={trashOutline}></IonIcon>
            Delete
          </IonButton>
        </IonButtons>
        <IonTitle>Receipt 01/01/1970</IonTitle>
      </IonToolbar>

      <div>
        <IonContent className="background-image">
          <IonCard>
            <IonCardContent>
              <IonSkeletonText
                animated
                style={{ width: "100%", height: "32px" }}
              />
              <br />
              <IonSkeletonText
                animated
                style={{ width: "100%", height: "14px" }}
              />
              <IonSkeletonText
                animated
                style={{ width: "100%", height: "14px" }}
              />
              <IonSkeletonText
                animated
                style={{ width: "100%", height: "14px" }}
              />
              <IonSkeletonText
                animated
                style={{ width: "100%", height: "14px" }}
              />
              <IonSkeletonText
                animated
                style={{ width: "100%", height: "14px" }}
              />
              <br />
              <IonButton
                fill="solid"
                className="btn"
              >
                  Unlock $6.00 in coupons

              </IonButton>
                <br />



                <IonList>
              <IonSkeletonText
                animated
                style={{ width: "100%", height: "32px" }}
              />
              <IonItem>
                            <IonSkeletonText
                animated
                style={{ width: "80%", height: "20px", margin: "0 auto" }}
              />
              </IonItem>
              <IonItem>
                            <IonSkeletonText
                animated
                style={{ width: "80%", height: "20px", margin: "0 auto" }}
              />
              </IonItem>
              <IonItem>
                            <IonSkeletonText
                animated
                style={{ width: "80%", height: "20px", margin: "0 auto" }}
              />
              </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </div>
    </IonPage>
  );
};

export default ReceiptDetailSkeleton;
