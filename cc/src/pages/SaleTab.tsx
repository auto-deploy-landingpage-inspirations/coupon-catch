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
import React, { Suspense, useEffect, useState } from "react";
import { AuthStore } from "../utils/store";
const DemoUINotice = React.lazy(() => import("../components/DemoUINotice"));
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
    <IonItem>
      <IonLabel>
            <h1>February</h1>
            <h2>unreleased</h2>
          </IonLabel>
        </IonItem>

        <IonItem button={true} onClick={() => handleSalesAdClick("january")}>
        <IonBadge color="success" slot="end">
            Active
          </IonBadge>
          <IonLabel>
            <h1>January</h1>
            <h2>12/27 - 1/21</h2>
          </IonLabel>
        </IonItem>

        <IonItem 
        button={true}
        disabled={true} 
        onClick={() => handleSalesAdClick("december")}
        >
        <IonBadge color="danger" slot="end">
            Expired
          </IonBadge>

          <IonLabel>
            <h1>December</h1>
            <h2>11/20 - 12/24</h2>
          </IonLabel>
        </IonItem>


        {/* Include the DemoAccountNotice component */}
        <Suspense>
        <DemoUINotice uid={uid} />
        </Suspense>
      </IonContent>
    </IonPage>
  );
};

export default SaleTab;
