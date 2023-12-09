import {
  IonBadge,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonNavLink,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import "../styles/SaleTabStyles.css";
import { useHistory } from "react-router";
import { useEffect, useState } from "react";
import { AuthStore } from "../utils/store";
import DemoUINotice from "../components/DemoUINotice";
import { IAuthStore } from '../utils/store';
import { useStoreState } from 'pullstate';



const SaleTab: React.FC = () => {
  const history = useHistory();
  const selectUid = (state: IAuthStore) => state.uid;
  const uid = useStoreState(AuthStore, selectUid);
  
  const handleSalesAdClick = (month: string) => {
    history.push(`/dashboard/sale/${month}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>View sales</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonItem button={true} onClick={() => handleSalesAdClick("septmeber")}>
          <IonBadge color="danger" slot="end">
            Expired
          </IonBadge>
          <IonLabel>
            <h2>Septemeber</h2>
            <p>08/29 - 9/22</p>
          </IonLabel>
        </IonItem>
        <IonItem button={true} onClick={() => handleSalesAdClick("october")}>
          <IonBadge color="success" slot="end">
            Active
          </IonBadge>
          <IonLabel>
            <h2>October</h2>
            <p>9/27 - 10/22</p>
          </IonLabel>
        </IonItem>
        <IonItem
          button={true}
          disabled={true}
          onClick={() => handleSalesAdClick("november")}
        >
          {/* <IonBadge color="success" slot="end">Active</IonBadge> */}
          <IonLabel>
            <h2>November</h2>
            <p>unreleased</p>
          </IonLabel>
        </IonItem>

        {/* Include the DemoAccountNotice component */}
        <DemoUINotice uid={uid} />

      </IonContent>
    </IonPage>
  );
};

export default SaleTab;
