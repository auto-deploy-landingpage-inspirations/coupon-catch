import { IonContent, IonHeader, IonIcon, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { receiptOutline } from 'ionicons/icons';
import React, { Suspense } from 'react'
const DemoUINotice = React.lazy(() => import("../components/DemoUINotice"));
import { AuthStore } from '../utils/store';
import { useStoreState } from 'pullstate';
import { IAuthStore } from '../utils/store';


const NoReceiptsComponent: React.FC = () => {
  const selectUid = (state: IAuthStore) => state.uid;
  const uid = useStoreState(AuthStore, selectUid);

return (
    <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>No receipts uploaded</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      {/* Your forgot password form or content here */}

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

      <IonText color="black" class="ion-text-wrap">
        <h4>
          Oops, it looks like you haven't added any receipts for catching
        </h4>
      </IonText>
    </div>

    {/* Include the DemoAccountNotice component */}
    <Suspense>
        <DemoUINotice uid={uid} />
        </Suspense>

    </IonContent>
  </IonPage>

  );
};

  export default NoReceiptsComponent