import React from "react";
import {
  IonActionSheet,
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar,
  ToggleCustomEvent,
} from "@ionic/react";
import "../styles/AccountTabStyles.css";
import { person, mail } from "ionicons/icons";
import { getAuth, signOut, sendEmailVerification} from "../utils/fbAuth"
import { useHistory } from "react-router-dom";
import { useState, Suspense } from "react";
import { AuthStore } from "../utils/store";
import { useEffect } from "react";
const DemoUINotice = React.lazy(() => import("../components/DemoUINotice"));
import AmountSaved from "../components/AmountSaved";
import { ButtonContent } from "../components/ButtonContent";

const auth = getAuth();

const AccountTab: React.FC = () => {
  const [activeChip, setActiveChip] = useState("month"); // Default active chip
  // const darkModeEnabled = DarkModeStore.useState((s) => s.darkMode);
  const history = useHistory();
  const user = AuthStore.useState((s) => s.user);

  const [showActionSheet, setShowActionSheet] = useState(false);
  // toastr state to display toast messages
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    color: "",
  });


  const [loadingFor, setLoadingFor] = useState("");

  // Keeps dark mode button enabled for system-level dark mode users
  // useEffect(() => {
  //   // Apply the dark theme if necessary
  //   document.body.classList.toggle("dark", darkModeEnabled);
  // }, [darkModeEnabled]); // Run the effect whenever darkModeEnabled changes

  // const toggleDarkMode = (ev: ToggleCustomEvent) => {
  //   const shouldAdd = ev.detail.checked;
  //   // Update darkModeEnabled in UserInfoStore
  //   DarkModeStore.update(s => { s.darkMode = shouldAdd; });
  //   document.body.classList.toggle("dark", shouldAdd);
  // };

  // Function to resend the email verification link
  const handleResendEmail = async () => {
    setLoadingFor("resendEmail");
    if (!auth.currentUser) {
      // Handle the case when there is no user logged in
      setToast({ isOpen: true, message: "No user logged in", color: "danger" });
      setLoadingFor("");
      return;
    }

    try {
      await sendEmailVerification(auth.currentUser)
        .then(() => {
          // Email verification link sent
          setToast({
            isOpen: true,
            message: "Verification email sent",
            color: "success",
          });
        })
        .catch((error: any) => {
          // Error occurred
          console.error("Error sending email verification:", error);
          setToast({
            isOpen: true,
            message: "Error sending verification email",
            color: "danger",
          });
        });
    } catch (error) {
      console.error("Error sending email verification:", error);
      setToast({
        isOpen: true,
        message: "Error sending verification email",
        color: "danger",
      });
    } finally {
      setLoadingFor("");
    }
  };

  const handleSignOut = () => {
    signOut(auth)
    .then(() => {
        history.push('/auth');
        console.log("Sign-out successful.");
        // // Navigate to /auth route upon successful signout
        setToast({
          isOpen: true,
          message: "Successfully logged out",
          color: "success",
        });
      })
      .catch((error) => {
        console.error("An error happened during sign out:", error);
        setToast({
          isOpen: true,
          message: "Error signing out",
          color: "danger",
        });
      });
  };

  const handleEditAccountInfo = () => {
    history.push("/dashboard/account/edit-profile");
  };
  console.log("AccountTab loaded");

  const handleChipClick = (chip: string) => {
    setActiveChip(chip);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Account Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <AmountSaved 
          monthAmount={34.10}
          yearAmount={156.34}
          allTimeAmount={210.80}
        />

        {/* // Custom divider line color matched */}
        <hr style={{ border: 'none', height: '1px', backgroundColor: '#c8c7cc', margin: '0' }} />

        <IonList>

          <IonItemGroup>
            <IonList>
              {/* User Profile basic info, avatar, etc */}
              <IonItem>
                <IonIcon
                  aria-hidden="true"
                  icon={person}
                  slot="start"
                ></IonIcon>
                <IonLabel>
                  <h1>{user?.displayName}</h1>
                </IonLabel>
                <IonLabel>
                  {user?.emailVerified === false && (
                    <IonBadge color="warning" slot="end">
                      Email unverified
                    </IonBadge>
                  )}
                </IonLabel>
              </IonItem>
            </IonList>
            {/* <IonItem>
              <IonToggle checked={darkModeEnabled} onIonChange={toggleDarkMode}>
                <IonLabel>
                  <h2>Dark mode</h2>
                </IonLabel>
              </IonToggle>
            </IonItem> */}
          </IonItemGroup>

          <IonItemGroup>
            {user?.emailVerified === false && (
              <IonItem>
                <IonLabel>
                  <h2>Email Unverified</h2>
                </IonLabel>
                <IonButton onClick={handleResendEmail}>
                  <ButtonContent
                    loadingFor={loadingFor}
                    buttonName="resendEmail"
                  >
                    Resend
                  </ButtonContent>

                  <IonIcon slot="end" icon={mail}></IonIcon>
                </IonButton>
              </IonItem>
            )}
            <IonItem button detail={true} onClick={handleEditAccountInfo}>
              <IonLabel>
                <h2>Edit account info</h2>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <h2>Payment somwrhing?</h2>
              </IonLabel>
            </IonItem>
          </IonItemGroup>

          <IonItem
            button
            detail={true}
            onClick={() => setShowActionSheet(true)}
          >
            <IonLabel>
              <IonText color="danger">
                <h2>Sign out</h2>
              </IonText>
            </IonLabel>
          </IonItem>
        </IonList>

        <IonActionSheet
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
        />
        <IonToast
          isOpen={toast.isOpen}
          onDidDismiss={() => setToast({ ...toast, isOpen: false })}
          message={toast.message}
          duration={3000}
          color={toast.color}
          position="bottom"
          positionAnchor="tab-bar"
        />

        {/* Include the DemoAccountNotice component */}
        <Suspense>
        <DemoUINotice uid={user?.uid} />
        </Suspense>

      </IonContent>
    </IonPage>
  );
};

export default AccountTab;
