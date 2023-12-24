import { IonContent, IonHeader, IonList, IonTitle, IonToolbar } from '@ionic/react'
import React from 'react'

const AddTabSkeleton = () => {
  return (
    <IonContent fullscreen>
    <IonHeader>
      <IonToolbar>
        <IonTitle>
        <IonTitle>My account</IonTitle>
        </IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonList>
        </IonList>
        </IonContent>
  )
}

export default AddTabSkeleton