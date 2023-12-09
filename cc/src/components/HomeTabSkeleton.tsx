import { IonHeader, IonItem, IonLabel, IonList, IonPage, IonSkeletonText, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react'

const HomeTabSkeleton = () => {
  return (
  <>
    <IonHeader>
      <IonToolbar>
        <IonTitle>
        <IonTitle>My receipts</IonTitle>
        </IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonList>
      {/* <IonListHeader>
              <IonSkeletonText animated={true} style={{ width: '75%', height: '1.6rem' }}></IonSkeletonText>
            </IonListHeader> */}
      <IonItem>
        <IonLabel>
          <h1>
            <IonSkeletonText
              animated={true}
              style={{ width: "250px", height: "1.6rem" }}
            ></IonSkeletonText>
          </h1>
          <h3>
            <IonSkeletonText
              animated={true}
              style={{ width: "80px", height: "1rem" }}
            ></IonSkeletonText>
          </h3>
        </IonLabel>
      </IonItem>
      <IonItem>
        <IonLabel>
          <h1>
            <IonSkeletonText
              animated={true}
              style={{ width: "250px", height: "1.6rem" }}
            ></IonSkeletonText>
          </h1>
          <h3>
            <IonSkeletonText
              animated={true}
              style={{ width: "80px", height: "1rem" }}
            ></IonSkeletonText>
          </h3>
        </IonLabel>
      </IonItem>
      <IonItem>
        <IonLabel>
          <h1>
            <IonSkeletonText
              animated={true}
              style={{ width: "250px", height: "1.6rem" }}
            ></IonSkeletonText>
          </h1>
          <h3>
            <IonSkeletonText
              animated={true}
              style={{ width: "80px", height: "1rem" }}
            ></IonSkeletonText>
          </h3>
        </IonLabel>
      </IonItem>
      <IonItem>
        <IonLabel>
          <h1>
            <IonSkeletonText
              animated={true}
              style={{ width: "250px", height: "1.6rem" }}
            ></IonSkeletonText>
          </h1>
          <h3>
            <IonSkeletonText
              animated={true}
              style={{ width: "80px", height: "1rem" }}
            ></IonSkeletonText>
          </h3>
        </IonLabel>
      </IonItem>
    </IonList>
  </>
  );
};

export default HomeTabSkeleton