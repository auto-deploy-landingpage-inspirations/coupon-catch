import React, { CSSProperties, useState } from "react";
import LoginComponent from "../components/LoginComponent";
import SignUpComponent from "../components/SignUpComponent";
import { IonContent, IonImg, IonText } from "@ionic/react";
// import "../styles/AuthPage.css";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const styles: { [key: string]: CSSProperties } = {
    logoImageWrapper: {
      position: 'relative',
      width: '100%',
      paddingTop: '50%', // for an image with a 4:3 aspect ratio
      marginBottom: '-40px',
    },
    logoImage: {
      maxWidth: 700,
      minWidth: 300,

        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',

    },
    authContainer: {
      maxWidth: 270,
      margin: '0 auto'
    },
    footerText: {
      display: 'block',
      textAlign: 'center',
      marginTop: 20,
      fontSize: 12,
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      whiteSpace: 'nowrap'
    }
  };

  return (
    <IonContent fullscreen class="ion-padding">
      {/* Logo */}
      <div style={styles.logoImageWrapper}>
      <IonImg src="v3.png" class="ion-padding" style={styles.logoImage} alt="A cartoon fish facing a hook where the fin undereneatht eh fish and the hook from the two C's to Coupon Catch in this logo" />
    </div>

<div style={styles.authContainer}>
      {isLogin ? (
          <LoginComponent toggleLogin={() => setIsLogin(false)} />
        ) : (
          <SignUpComponent toggleLogin={() => setIsLogin(true)} />
        )}
      </div>

      <IonText style={styles.footerText}>
        &copy; 2023 Coupon Catch by Skypher LLC
      </IonText>
    </IonContent>
  );
};

export default AuthPage;
