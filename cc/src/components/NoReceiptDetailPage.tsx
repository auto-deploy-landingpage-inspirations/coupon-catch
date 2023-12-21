import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react'

export const NoReceiptDetailPage = () => {
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

