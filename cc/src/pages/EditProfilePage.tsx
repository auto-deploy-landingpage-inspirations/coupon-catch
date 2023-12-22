import {
  IonActionSheet,
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonText,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import React from "react";
import { person, mail } from "ionicons/icons";
import { AuthStore } from "../utils/store";
import { UserInfoStore } from "../utils/store";
import DemoUINotice from "../components/DemoUINotice";
import "../styles/EditProfilePageStyles.css";

const EditProfilePage = () => {
  const user = AuthStore.useState((s) => s.user);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard/account"></IonBackButton>
          </IonButtons>
          <IonTitle>Edit Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen color="light">
        {/* {user.emailVerified === false && (
                <IonBadge color="warning" slot="end">
                  Email unverified
                </IonBadge>
              )} */}

        <IonList inset={true}>
          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>
                <h1>Account settings</h1>
              </IonLabel>
            </IonItemDivider>

            {/* {user.emailVerified === false && (
              <IonItem>
                <IonLabel>
                  <h2>Email Unverified</h2>
                </IonLabel>
                <IonButton>
                  <IonIcon slot="end" icon={mail}></IonIcon>
                </IonButton>
              </IonItem>
            )} */}

            {user.emailVerified === false ? (
              <IonItem>
                <IonInput labelPlacement="floating" value={user.email}>
                  <div slot="label">
                    Email <IonText color="danger">(Unverified)</IonText>
                  </div>
                </IonInput>
              </IonItem>
            ) : (
              <IonItem>
                <IonInput
                  label="Email"
                  labelPlacement="stacked"
                  clearInput={true}
                  value={user.email}
                ></IonInput>
              </IonItem>
            )}

        <IonNote 
        color="medium" 
        class="ion-margin-horizontal"
        >
          Invalid email
        </IonNote>

            <IonItem>
              <IonInput
                label="Display name"
                labelPlacement="stacked"
                placeholder={user.displayName}
                clearInput={true}
                value={user.displayName}
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonInput
                label="Display name"
                labelPlacement="stacked"
                placeholder={user.displayName}
                clearInput={true}
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonLabel>
                <h2>Payment settings</h2>
              </IonLabel>
            </IonItem>
          </IonItemGroup>

          <IonItem
            button
            detail={true}
            // onClick={() => setShowActionSheet(true)}
          >
            <IonLabel>
              <IonText color="danger">
                <h2>Delete account</h2>
              </IonText>
            </IonLabel>
          </IonItem>
        </IonList>

        <br />
        <IonButton>
          <IonLabel>
            <h2>Save</h2>
          </IonLabel>
        </IonButton>
        {/* <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header="Are you sure you wish to sign out?"
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Sign Out",
              role: "destructive",
              handler: () => {
                handleSignOut();
              },
            },
          ]}
        /> */}
        {/* <IonToast
          isOpen={toast.isOpen}
          onDidDismiss={() => setToast({ ...toast, isOpen: false })}
          message={toast.message}
          duration={3000}
          color={toast.color}
          position="bottom"
          positionAnchor="tab-bar"
        /> */}

        {/* Include the DemoAccountNotice component */}
        <DemoUINotice uid={user.uid} />
      </IonContent>
    </IonPage>
  );
};

export default EditProfilePage;
