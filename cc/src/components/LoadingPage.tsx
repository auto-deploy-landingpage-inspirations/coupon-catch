import { IonContent, IonHeader, IonList, IonLoading, IonTitle, IonToolbar } from '@ionic/react'
import React, { useState } from 'react'

const LoadingPage = () => {
    const [showLoading, setShowLoading] = useState(true);

  return (
    <IonContent fullscreen>
    <IonHeader>
      <IonToolbar>
        <IonTitle>
        <IonTitle>View flyer</IonTitle>
        </IonTitle>
      </IonToolbar>
    </IonHeader>
<IonLoading
            isOpen={true}
            message={"Please wait..."}
            onDidDismiss={() => setShowLoading(false)}
            />
        </IonContent>
  )
}

export default LoadingPage