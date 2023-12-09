import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';

const ForgotPasswordPage: React.FC = () => {
  return (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Forgot Password</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      {/* Your forgot password form or content here */}
    </IonContent>
  </IonPage>
  )
  };

export default ForgotPasswordPage;