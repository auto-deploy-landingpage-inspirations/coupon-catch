import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import "../styles/AddTabStyles.css";
import React, { useState, useEffect, Suspense } from "react";

import { UserPhoto, usePhotoGallery } from "../hooks/usePhotoGallery";
import { camera, images } from "ionicons/icons";
// create an import firebaseStorage from the /utils/firebaseConfig.ts file
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { getFunctions, httpsCallable } from "firebase/functions";

const DemoUINotice = React.lazy(() => import("../components/DemoUINotice"));
import { AuthStore } from "../utils/store";
import { ReceiptStore } from "../utils/store";
// import { getApp } from "firebase/app";
// import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

import { IAuthStore } from "../utils/store";
import { useStoreState } from "pullstate";
import CameraButton from "../components/CameraButton";
import GalleryButton from "../components/GalleryButton";
import { set } from "date-fns";
import ConfirmButton from "../components/ConfirmButton";

const AddTab: React.FC = () => {
  const selectUid = (state: IAuthStore) => state.uid;
  const uid = useStoreState(AuthStore, selectUid);
  const idToken = AuthStore.useState((s) => s.idToken);
  const { takePhoto } = usePhotoGallery();
  const [photo, setPhoto] = useState<UserPhoto | null>(null); // State to hold the taken photo
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    color: "",
  });

  const handleTakePhoto = async () => {
    try {
      console.log("Attempting to capture photo...");
      const latestPhoto = await takePhoto();

      setPhoto(latestPhoto);
      if (!latestPhoto || !latestPhoto.webviewPath) {
        console.error("No photo taken or WebviewPath is undefined.");
        return;
      }
    } catch (error) {
      console.error("Error in handleTakePhoto:", error);
    }
  };

  const handleConfirmUpload = async () => {
    if (!photo || !photo.webviewPath) {
      console.error("No photo to upload.");
      return;
    }

    try {
      // Step 1: Convert to blob, upload to Firebase Storage
      const blobResponse = await fetch(photo.webviewPath);
      const blob = await blobResponse.blob();

      // Add check if blob is empty
      if (!blob) {
        console.log("Blob is empty");
        return;
      } else {
        console.log("Blob:", blob);
      }

      // Step 2: Prepare FormData for upload
      const formData = new FormData();
      formData.append("image", blob, "upload.jpg");
      formData.append("uid", uid);

      // Step 3: Upload image to your server
      const headers = new Headers();
      headers.set("Authorization", `Bearer ${idToken}`);

      const response = await fetch("http://couponcatch-dev.eba-vp93mvht.us-east-1.elasticbeanstalk.com/upload", {
        method: "POST",
        body: formData,
        headers: headers,
      });

      if (response.ok) {
        const resultText = await response.text(); // Get the text response

        try {
          const result = JSON.parse(resultText); // Try to parse it as JSON

          if (result && result.receipt) {
            // Generate a random 4-digit number and assign it as the id of the receipt
            const randomId = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
            result.receipt.id = `useradded${randomId}`;

            // Attach item lines to the receipt
            result.receipt.itemLines = result.itemLines;

            // Add the receipt to the user's receipts
            ReceiptStore.update((s) => {
              s.receiptList.push(result.receipt);
            });
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
          // Handle JSON parsing error
        }

        setToast({
          isOpen: true,
          message: "Image successfully uploaded!",
          color: "success",
        });
      } else {
        console.error("Upload failed:", response.statusText);
        // If error 403, then show a toast to tell user "Error, try realoding the page"
        setToast({
          isOpen: true,
          message: "Error uploading; Refresh the page and try again",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error in handleTakePhoto:", error);
      // Handle the error
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add receipts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow className="ion-justify-content-center ion-align-items-start">
            <IonCol size="10" sizeMd="6" sizeLg="4">
              <div className="ion-text-center">
                <IonText>
                  <h2>Take a photo of your receipt</h2>
                </IonText>
              </div>
            </IonCol>
            <IonCol size="12">
              {/* Display the thumbnail if a photo has been taken */}
              {photo?.webviewPath && (
                <div className="photo-preview">
                  <img src={photo.webviewPath} alt="Preview" />
                </div>
              )}
            </IonCol>
            <IonCol size="12" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {photo && (
    <ConfirmButton handleConfirmUpload={handleConfirmUpload} />

              )}
            </IonCol>

            <IonCol size="12">
              <div className="ion-text-center ion-padding-top">
                <IonRow>
                  <IonCol>
                    <GalleryButton handleTakePhoto={handleTakePhoto} />
                  </IonCol>
                  <IonCol>
                    <CameraButton handleTakePhoto={handleTakePhoto} />
                  </IonCol>
                </IonRow>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={toast.isOpen}
          onDidDismiss={() => setToast({ ...toast, isOpen: false })}
          message={toast.message}
          duration={3000}
          color={toast.color}
          position="bottom"
          positionAnchor="tab-bar"
        ></IonToast>

        {/* Include the DemoAccountNotice component */}
        <Suspense>
          <DemoUINotice uid={uid} />
        </Suspense>
      </IonContent>
    </IonPage>
  );
};

export default AddTab;
