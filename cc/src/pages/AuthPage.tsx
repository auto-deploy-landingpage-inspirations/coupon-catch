import React, { useState, useEffect } from "react";
import LoginComponent from "../components/LoginComponent"; // Import the login component
import SignUpComponent from "../components/SignUpComponent"; // Import the signup component
import { IonContent, IonImg, IonText } from "@ionic/react";
import { UserStore, LoginOrSignupStore } from "../utils/store";
import { useHistory } from "react-router-dom";

const AuthPage: React.FC = () => {
  const { isLogin } = LoginOrSignupStore.useState((s) => ({
    isLogin: s.isLogin,
  }));
    const isAuthed = UserStore.useState(s => s.isAuthed);
  const authChecked = UserStore.useState(s => s.authChecked);
  const history = useHistory();

  useEffect(() => {
    // Redirect if authenticated, but only after the component has mounted
    if (authChecked && isAuthed) {
      history.push('/dashboard');
    }
  }, [isAuthed, authChecked, history]);


  return (
    <IonContent fullscreen class="ion-padding">
      {/* Logo */}
      <IonImg
        src="v3.png"
        class="ion-padding"
        style={{ 
            maxWidth: "700px", 
            minWidth: "300px", 
            margin: "0 auto" }}
      />

      <div
        style={{
          maxWidth: "270px",
          margin: "0 auto",
        }}
      >
        {isLogin ? <LoginComponent /> : <SignUpComponent />}
      </div>
    </IonContent>
  );
};

export default AuthPage;
