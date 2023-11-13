import {
  IonActionSheet,
  IonAlert,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import "../styles/AccountTabStyles.css";
import { person } from "ionicons/icons";
import { auth, signOut } from "../utils/firebaseConfig";
import { useHistory } from 'react-router-dom';
import { useState } from "react";
import { UserStore } from "../utils/store";
import { useEffect } from "react";

const AccountTab: React.FC = () => {
  const history = useHistory();
  const [showActionSheet, setShowActionSheet] = useState(false);
  // toastr state to display toast messages
  const [toast, setToast] = useState({ 
    isOpen: false, 
    message: '', 
    color: '' 
  });
  const user = UserStore.useState(s => s.user);


  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log('Sign-out successful.');
      UserStore.update(s => { s.isAuthed = false; });
      // Navigate to /auth route upon successful signout
      history.push('/auth');
      setToast({ isOpen: true, message: 'Successfully logged out', color: 'success' });
    }).catch((error) => {
      console.error('An error happened during sign out:', error);
      setToast({ isOpen: true, message: 'Error signing out', color: 'danger' });
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Account settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Account settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          {/* User Profile basic info, avatar, etc */}
          <IonItem>
            <IonIcon aria-hidden="true" icon={person} slot="start"></IonIcon>
            <IonLabel>
              <h1>User name</h1>
              <p>{user.email}</p>
            </IonLabel>
          </IonItem>

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Device settings</IonLabel>
            </IonItemDivider>

            <IonItem>
              <IonToggle>
                <IonLabel>Dark mode</IonLabel>
              </IonToggle>
            </IonItem>
          </IonItemGroup>

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Account settings</IonLabel>
            </IonItemDivider>

            <IonItem button detail={true}>
              <IonLabel>Forgot Password</IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>Delete account</IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>Payment settings</IonLabel>
            </IonItem>
          </IonItemGroup>

          <IonItem button detail={true} onClick={() => setShowActionSheet(true)}>
          <IonLabel>
            <IonText color="danger">Sign out</IonText>
          </IonLabel>
        </IonItem>

        </IonList>


        <IonActionSheet
  isOpen={showActionSheet}
  onDidDismiss={() => setShowActionSheet(false)}
  header="Are you sure you wish to sign out?"
  buttons={[
    {
      text: 'Cancel',
      role: 'cancel',
    },
    {
      text: 'Sign Out',
      role: 'destructive',
      handler: () => {
        handleSignOut();
      }
    }
  ]}
      />
              <IonToast
        isOpen={toast.isOpen}
        onDidDismiss={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        duration={3000}
        color={toast.color}
      />

      </IonContent>
    </IonPage>
  );
};

export default AccountTab;
