import {
  IonButton,
  IonSpinner,
  IonImg,
  IonInput,
  IonText,
  IonToast,
  IonLabel,
} from "@ionic/react";
import React, { CSSProperties, useState, ReactNode } from "react";
import "../styles/LoginComponentStyles.css";
import { LoginOrSignupStore } from "../utils/store";
import { useHistory } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "../utils/fbAuth";
import { IButtonContentProps } from "../utils/types";
import EmailInput from "./EmailInput";
import Divider from './Divider';
import { ButtonContent } from '../components/ButtonContent';

const auth = getAuth();

interface LoginComponentProps {
  toggleLogin: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ toggleLogin }) => {
  const history = useHistory();

  // loadingFor state to track which button is loading
  const [loadingFor, setLoadingFor] = useState("");
  // toast state to display toast messages
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    color: "",
  });

  // EMAIL FIELD
  // State to track if the email input value is valid or not
  const [isEmailValid, setIsEmailValid] = useState<boolean | undefined>();
  // State to track emailField as entered by user
  const [emailField, setEmailField] = useState<string>("");

  // PASSWORD FIELD
  // State to track if the password input has been touched/interacted with by the user
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  // State to track if the password input value is valid or not
  const [isPasswordValid, setIsPasswordValid] = useState<boolean | undefined>();
  // State to track passwordField as entered by user
  const [passwordField, setPasswordField] = useState<string>("");
  // State to track whether the repeatpassword should be shown or not
  const [showRepeatPasswordField, setShowRepeatPasswordField] =
    useState<boolean>(false);



  const handleEmailChange = (email: string, isValid: boolean) => {
    setEmailField(email);
    setIsEmailValid(isValid);
  };

  // onIonInput provides an Event object, from which the value is used to set the state of the password field useState value
  const handlePasswordInput = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    setPasswordField(value);
    // Resetting isPasswordValid state to undefined (initial state)
    setIsPasswordValid(undefined);
    // If the user hasn't entered anything, exit the function. If the user has enetered anything, set the state using setShowRepeatPasswordField to true to display the repeat password field
    value === ""
      ? setShowRepeatPasswordField(false)
      : setShowRepeatPasswordField(true);
    if (value === "") return;

    // Password regex validation:
    // - At least 8 characters in length
    // - At least one uppercase letter
    // - At least one number
    // - At least one special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    passwordRegex.test(value)
      ? setIsPasswordValid(true)
      : setIsPasswordValid(false);
  };


  // Handles the forgot password link click
  const handleForgotPasswordClick = async () => {
    setLoadingFor("forgotPassword");
    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, emailField);
      setToast({
        isOpen: true,
        message: "Check your email for recovery steps",
        color: "success",
      });
    } catch (error) {
      console.error(error);
      setToast({
        isOpen: true,
        message: "Unable to send email to that address",
        color: "danger",
      });
    } finally {
      setLoadingFor("");
    }
  };

  // Function to handle email and password sign-in
  const handleEmailPasswordSignIn = async () => {
    // Set state for showing spinner/loading indicator
    setLoadingFor("signIn");
    try {
      // ... any pre-signIn logic if needed
      // Try to sign in with the provided email and password
      await signInWithEmailAndPassword(auth, emailField, passwordField);
      // send user to dashboard route after login
      history.push("/dashboard");
      // ... any post-signIn logic if needed
      // ionic toast for successful login
      setToast({
        isOpen: true,
        message: "Logging you in...",
        color: "success",
      });
    } catch (error) {
      // Handle error accordingly
      setToast({
        isOpen: true,
        message: "Error signing in with email and password, try again later",
        color: "danger",
      });
    } finally {
      setLoadingFor("");
    }
  };

  // Function to handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      // ... any pre-signIn logic if needed

      // Try to sign in with Google
      await signInWithPopup(auth, new GoogleAuthProvider());

      // ... any post-signIn logic if needed
    } catch (error) {
      // Handle error accordingly
      console.error("Error signing in with Google", error);
    }
  };

  // Add this function to handle form submission
const handleFormSubmit = (event: React.FormEvent) => {
  event.preventDefault(); // Prevent the page from refreshing
  handleEmailPasswordSignIn();
};

const whatsThisStyle: CSSProperties = {
  padding: '20px 10px 0 10px',
  textDecoration: 'none',
  color: '#4285F4'
};


const googleLoginBtnStyle: CSSProperties = {
  borderRadius: '4px',
  boxShadow: 'none',
  paddingTop: '0',
  paddingBottom: '0',
  paddingLeft: '0',
  paddingRight: '0',
  fontFamily: "'Roboto', arial, sans-serif",
  fontSize: '16px',
  fontWeight: '600',
  letterSpacing: '0.25px',
  height: '40px',
  width: '90%', /* adjust as needed, but keep it consistent */
  maxWidth: '400px',
  minWidth: '240px',
  margin: '0 auto', /* center the button */
  transition: 'background-color .218s, border-color .218s, box-shadow .218s',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
  backgroundImage: 'url("../../public/googleSignIn.png")',
  backgroundSize: 'cover', /* this will make the image cover the entire button */
  backgroundPosition: 'center', /* centers the background image */
  backgroundRepeat: 'no-repeat',
};

const loginButtonStyle: CSSProperties = {
    borderRadius: '4px',
    boxShadow: 'none',
    paddingTop: '0',
    paddingBottom: '0',
    paddingLeft: '0',
    paddingRight: '0',
    fontFamily: "'Roboto', arial, sans-serif",
    fontSize: '16px',
    fontWeight: '600',
    letterSpacing: '0.25px',
    height: '40px',
    width: '90%', /* adjust as needed, but keep it consistent */
    maxWidth: '400px',
    minWidth: '240px',
    margin: '0 auto', /* center the button */
    transition: 'background-color .218s, border-color .218s, box-shadow .218s',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <div>
      <IonText color="primary" class="ion-text-center">
        <h1>Welcome back</h1>
      </IonText>
      <form onSubmit={handleFormSubmit}>

      <div style={{ padding: "0" }}>
        <EmailInput email={emailField} onEmailChange={handleEmailChange} />
      </div>

      <div
        style={{
          padding: "8px 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >

        <IonInput
          className={`${isPasswordValid === true && "ion-valid"} ${
            isPasswordValid === false && "ion-invalid"
          } ${isPasswordTouched && "ion-touched"}`}
          type="password"
          fill="outline"
          label="Password"
          clearOnEdit={false}
          labelPlacement="floating"
          helperText=""
          errorText="Req: 8+ chars, 1 uppercase, 1 number, 1 special"
          // onIonInput provides an Event object,
          onIonInput={handlePasswordInput}
          onIonBlur={() => setIsPasswordTouched(true)}
          placeholder=""
        ></IonInput>
      </div>

      <div
        style={{
          padding: "8px 0 0 0",
          margin: "-20px auto 0 auto",
          fontSize: ".8rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "240px",
        }}
        // className="ion-text-justify"
      >
        
        <IonButton
          disabled={isEmailValid !== true}
          fill="clear"
          size="small"
          className="custom-ripple-none custom-button"
          
          style={{
            textTransform: "none",
            marginLeft: "144px",
            marginTop: "8px",
          }}
          onClick={handleForgotPasswordClick}
        >
          <ButtonContent loadingFor={loadingFor} buttonName="forgotPassword">
            Forgot password?
          </ButtonContent>
        </IonButton>

        <IonToast
          isOpen={toast.isOpen}
          onDidDismiss={() => setToast({ ...toast, isOpen: false })}
          message={toast.message}
          duration={1500}
          color={toast.color}
        />
      <IonButton
        className="custom-button"
        style={loginButtonStyle}
        fill="outline"
        expand="block"
        // // Disable the button if either email or password is invalid
        // disabled={isEmailValid !== true || isPasswordValid !== true}
        onClick={handleEmailPasswordSignIn}
        >
        <ButtonContent loadingFor={loadingFor} buttonName="signIn">
          <IonText>Sign in with email</IonText>
        </ButtonContent>
      </IonButton>
      
        </div>
</form>
      <Divider>OR</Divider>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IonButton
          className="custom-button"
          style={googleLoginBtnStyle}
          expand="block"
          fill="outline"
          onClick={handleGoogleSignIn}
        >
        </IonButton>

        <IonButton
          className="custom-button"
          style={{ padding: "8px 0 0 0" }}
          onClick={toggleLogin}
          // className="loginBtn"
          expand="block"
        >
          <IonText style={{ color: "white" }}>Don't have an account?</IonText>
        </IonButton>

        <a 
  href="https://www.couponcatchapp.com/pricing#FAQ"
  target="_blank"
  rel="noopener noreferrer"
  style={whatsThisStyle}
>
  What's the catch?
</a>
      </div>
    </div>
  );
};

export default LoginComponent;
