import {
  IonButton,
  IonChip,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonLoading,
  IonPage,
  IonProgressBar,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import "../styles/AddTabStyles.css";
import { useState, useEffect } from "react";

import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { usePhotoGallery, UserPhoto } from "../hooks/usePhotoGallery";
import { camera, images } from "ionicons/icons";
// create an import firebaseStorage from the /utils/firebaseConfig.ts file
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// import { getFunctions, httpsCallable } from "firebase/functions";
import axios from "axios"; // if using Axios

import { uploadPhotoToFirebase } from "../utils/firebaseConfig";

import { UserStore } from "../utils/store";

// import { getApp } from "firebase/app";
// import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// const functions = getFunctions(getApp());
// connectFunctionsEmulator(functions, "127.0.0.1", 5001);

const AddTab: React.FC = () => {
  const uid = UserStore.useState(s => s.uid);
  const idToken = UserStore.useState(s => s.idToken);
  const { takePhoto } = usePhotoGallery();
  const [toast, setToast] = useState({ 
    isOpen: false, 
    message: '', 
    color: '',
  });
  
  const handleTakePhoto = async () => {
    try {
      // Step 1: Get photo selection from user
      console.log("Attempting to capture photo...");
      const latestPhoto = await takePhoto();

      if (!latestPhoto || !latestPhoto.webviewPath) {
        console.error("No photo taken or WebviewPath is undefined.");
        return;
      }

      // Step 2: Convert to blob, upload to Firebase Storage
      // 2a - Get the blob
      const blobResponse = await fetch(latestPhoto.webviewPath);
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
      formData.append('image', blob, 'upload.jpg'); 

      // Step 3: Upload to your server
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${idToken}`);

      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
        headers: headers,
      });

      if (response.ok) {
          const result = await response.text(); // or response.json() if your server responds with JSON
          console.log("Upload successful:", result);
          setToast({ isOpen: true, message: 'Image successfully uploaded!', color: 'success' });
      } else {
          console.error("Upload failed:", response.statusText);
          // Handle upload failure
      }
    } catch (error) {
        console.error("Error in handleTakePhoto:", error);
        // Handle the error
    }
};






        // Generate a date-time string using native JavaScript
      // const now = new Date();
      // const dateTimeString = now.toISOString().replace(/:/g, '_').replace(/\..+/, '');
      // const fileType = blob.type.split("/")[1]; // Extract file type (e.g., "jpeg", "png")

      // Define the path in Firebase Storage where the photo will be stored
      // const path = `uploadedReceipts/${uid}/${dateTimeString}.${fileType}`;

      // // Step 3: Upload the blob to Firebase Storage
      // const downloadURL = await uploadPhotoToFirebase(blob, path);
      // console.log("File available at", downloadURL);

      // Display success or handle additional tasks
      // setToast({ isOpen: true, message: 'Image successfully uploaded!', color: 'success' });


    // Step 3: Send the image to the HTTP endpoint
    // console.log("Axios post to processImage");

    
        // Define the URL of your cloud function
    //     const functionUrl = 'https://us-central1-couponcatch-e211e.cloudfunctions.net/helloWorld';

    // const processImageResponse = await axios.post(functionUrl, {
    //       headers: {
    //         // Inform the server about the type of the content
    //         // 'Content-Type': 'multipart/form-data'
    //       }
    //     })
    // .then(response => {
    //   console.log(response.data);
    // })
    // .catch(error => {
    //   console.error('Error:', error);
    // });

    //         // Handle the response from your HTTP function
    // if (processImageResponse.status === 200) {
    //   console.log("Image processed successfully:", processImageResponse.data);
    //   // Update the state, or perform other actions as needed
    // }


    // const processImageResponse = await axios.post(functionUrl, formData, {
    //       headers: {
    //         // Inform the server about the type of the content
    //         'Content-Type': 'multipart/form-data'
    //       }
    //     })
    // .then(response => {
    //   console.log(response.data);
    // })
    // .catch(error => {
    //   console.error('Error:', error);
    // });

    // Handle the response from your HTTP function
    // if (processImageResponse.status === 200) {
    //   console.log("Image processed successfully:", processImageResponse.data);
    //   // Update the state, or perform other actions as needed
    // }
    // console.log("Response from processImage:", processImageResponse);

//   } catch (err) {
//     console.error("Error in the process:", err);
//     setToast({ isOpen: true, message: 'Failed to upload and process the image', color: 'danger' });
//   }
// };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add receipts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Add receipts</IonTitle>
            {/* <IonProgressBar type="indeterminate" color="primary"></IonProgressBar> */}
          </IonToolbar>
        </IonHeader>

        <div
          className="ion-text-center ion-padding-top"
          style={{
            maxWidth: "260px",
            margin: "0 auto",
            paddingTop: "200px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <IonButton
            style={{ margin: "auto 0", textTransform: "none", width: "144px" }}
            onClick={handleTakePhoto}
          >
            <IonIcon aria-hidden="true" icon={images} />
          </IonButton>
          &nbsp;
          <IonButton
            style={{ margin: "auto 0", textTransform: "none", width: "144px" }}
            onClick={handleTakePhoto}
          >
            <IonIcon aria-hidden="true" icon={camera} />
          </IonButton>
        </div>
        {/* Trigger this ion toast, normally a button 
        <IonButton id="open-toast" expand="block">
          Open
        </IonButton>
        when the file is uploading, or maybe run a loading and toast will be success
        */}

      <IonToast
        isOpen={toast.isOpen}
        onDidDismiss={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        duration={3000}
        color={toast.color}
        position="bottom"
        positionAnchor="tab-bar"
      ></ IonToast>
      </IonContent>
    </IonPage>
  );
};

export default AddTab;
