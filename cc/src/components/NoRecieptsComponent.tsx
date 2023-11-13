import React from 'react'
import { IonBadge, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import '../styles/HomeTabStyles.css';
import { receiptOutline } from 'ionicons/icons';

const NoRecieptsComponent: React.FC = () => {

    return (
<div
  className ="ion-text-center ion-padding-top"
  style={{maxWidth: "260px", margin: "0 auto", paddingTop: "100px"}}
>
  <IonIcon 
  aria-hidden="true" 
  icon={receiptOutline} 
  style={{height: "80px", width: "80px"}}
  className="ion-margin-top"
  />

  <IonText
    color="primary"
    class="ion-text-wrap"
  >
    <h5>Oops, it looks like you haven't added any reciepts for catching</h5>
  </IonText>
</div>
  )
}

export default NoRecieptsComponent