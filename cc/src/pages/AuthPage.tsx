import React, { CSSProperties, useState } from "react";
import LoginComponent from "../components/LoginComponent";
import SignUpComponent from "../components/SignUpComponent";
import { IonContent, IonImg, IonText } from "@ionic/react";
// import "../styles/AuthPage.css";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const styles: { [key: string]: CSSProperties } = {
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    logoImage: {
      maxWidth: 700,
      minWidth: 300,
        width: '100%',
        height: 'auto',
        margin: '0 auto'
    },
    authContainer: {
      maxWidth: 270,
      margin: '0 auto',
marginTop: '-40px'
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
    <IonContent fullscreen class="ion-padding" style={styles.contentContainer}>
      {/* Logo */}
      {/* <div style={styles.logoImageWrapper}> */}
      <IonImg src="v3.png" class="ion-padding" style={styles.logoImage} alt="A cartoon fish facing a hook where the fin undereneatht eh fish and the hook from the two C's to Coupon Catch in this logo" />
    {/* </div> */}

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
