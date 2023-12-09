import React, { useState } from "react";
import LoginComponent from "../components/LoginComponent";
import SignUpComponent from "../components/SignUpComponent";
import { IonContent, IonImg, IonText } from "@ionic/react";
import "../styles/AuthPage.css";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <IonContent fullscreen class="ion-padding">
      {/* Logo */}
      <IonImg src="v3.png" class="ion-padding" className="logoImage" />

      <div className="authContainer">
      {isLogin ? (
          <LoginComponent toggleLogin={() => setIsLogin(false)} />
        ) : (
          <SignUpComponent toggleLogin={() => setIsLogin(true)} />
        )}
      </div>

      <IonText className="footerText">
        &copy; 2023 Coupon Catch by Skypher LLC
      </IonText>
    </IonContent>
  );
};

export default AuthPage;
