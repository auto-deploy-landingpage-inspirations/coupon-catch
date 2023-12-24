import { IonContent, IonHeader, IonList, IonTitle, IonToolbar } from '@ionic/react'
import React from 'react'

const SaleTabSkeleton = () => {
  return (
    <IonContent fullscreen>
    <IonHeader>
      <IonToolbar>
        <IonTitle>
        <IonTitle>View flyer</IonTitle>
        </IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonList>
        </IonList>
        </IonContent>
  )
}

export default SaleTabSkeleton