import {
  IonButton,
  IonSpinner,
  IonImg,
  IonInput,
  IonText,
  IonToast,
} from "@ionic/react";
import React, { useState, ReactNode } from "react";
import "../styles/LoginComponentStyles.css";
import { LoginOrSignupStore } from '../utils/store';
import { useHistory } from 'react-router-dom';
import { signInWithEmailAndPassword, auth, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from '../utils/firebaseConfig';


// Required interface for ButtonContent component
interface IButtonContentProps {
  loadingFor: string;
  buttonName: string;
  children: ReactNode;
}

  // ButtonContent component to show either the buttonName label or a loading spinner depending on the loadingFor state
  const ButtonContent: React.FC<IButtonContentProps> = ({ loadingFor, buttonName, children }) => {
    return loadingFor === buttonName ? <IonSpinner name="bubbles"/> : children;
  };

const LoginComponent: React.FC = () => {
  const history = useHistory();

  // loadingFor state to track which button is loading
  const [loadingFor, setLoadingFor] = useState('');
  // toast state to display toast messages
  const [toast, setToast] = useState({ 
    isOpen: false, 
    message: '', 
    color: '' 
  });

  // EMAIL FIELD
  // State to track if the email input has been touched/interacted with by the user
  const [isEmailTouched, setIsEmailTouched] = useState(false);
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

  const isEmail = (email: string) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
  // onIonInput provides an Event object, from which the value is used to set the state of the email field useState value
  const handleEmailInput = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    // Set state to value typed in by user
    setEmailField(value);
    // Resetting isEmailValid state to undefined (initial state)
    // If the user hasn't entered anything, exit the function
    setIsEmailValid(undefined);
    if (value === "") return;
    // Check if the email is valid using regex
    isEmail(value) ? setIsEmailValid(true) : setIsEmailValid(false);
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

  const Divider = ({ children }: any) => {
    return (
      <div className="divider-container">
        <div className="divider-border" />
        <span className="divider-text">{children}</span>
        <div className="divider-border" />
      </div>
    );
  };


  const switchToSignUp = () => {
    LoginOrSignupStore.update(s => {
      s.isLogin = false;
    });
  };

  // Handles the forgot password link click
  const handleForgotPasswordClick = async () => {
    setLoadingFor('forgotPassword');
    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, emailField)
      setToast({ isOpen: true, message: 'Check your email for recovery steps', color: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ isOpen: true, message: 'Unable to send email to that address', color: 'danger' });
    } finally {
      setLoadingFor('');
    }
  };


  // Function to handle email and password sign-in
  const handleEmailPasswordSignIn = async () => {
    // Set state for showing spinner/loading indicator
    setLoadingFor('signIn');
    try {
      // ... any pre-signIn logic if needed
      // Try to sign in with the provided email and password
      await signInWithEmailAndPassword(auth, emailField, passwordField);
      // send user to dashboard route after login
      history.push('/dashboard');
      // ... any post-signIn logic if needed
      // ionic toast for successful login
      setToast({
        isOpen: true,
        message: 'Login successful!',
        color: 'success'
      });
    } catch (error) {
      // Handle error accordingly
      setToast({ isOpen: true, message: 'Error signing in with email and password, try again later', color: 'danger' });
    } finally {
      setLoadingFor('');
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


  return (
    <div>

<IonText color="primary" class="ion-text-center">
        <h1>Welcome back</h1>
      </IonText>

      <div style={{ padding: "0" }}>
        {/* The IonInput component to collect the email.
        - `ion-valid` class is added if the email is valid.
        - `ion-invalid` class is added if the email is invalid.
        - `ion-touched` class is added if the input has been touched/interacted with by the user. */}
        <IonInput
          className={`${isEmailValid === true && "ion-valid"} ${
            isEmailValid === false && "ion-invalid"
          } ${isEmailTouched && "ion-touched"}`}
          type="email"
          fill="outline"
          label="Email"
          labelPlacement="floating"
          helperText=""
          errorText="Invalid email address"
          // onIonInput provides an Event object,
          onIonInput={handleEmailInput}
          onIonBlur={() => setIsEmailTouched(true)}
          placeholder=""
        ></IonInput>
      </div>

      <div style={{ padding: "8px 0" }}>
        {/* The IonInput component to collect the email.
            - `ion-valid` class is added if the email is valid.
            - `ion-invalid` class is added if the email is invalid.
            - `ion-touched` class is added if the input has been touched/interacted with by the user. */}
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
          errorText="Invalid password"
          // onIonInput provides an Event object,
          onIonInput={handlePasswordInput}
          onIonBlur={() => setIsPasswordTouched(true)}
          placeholder=""
        ></IonInput>
      </div>

      <div
        style={{
          padding: "0 0 8px 0",
          textAlign: "center",
          margin: "-20px auto 0 auto",
          fontSize: ".8rem",
        }}
        // className="ion-text-justify"
      >

        <IonButton
          disabled={isEmailValid !== true }
          fill="clear"
          size="small"
          className="custom-ripple-none"
          style={{
            textTransform: "none",
            marginLeft: "144px",
            marginTop: "8px",
          }}
          onClick={handleForgotPasswordClick}
        >
          <ButtonContent loadingFor={loadingFor} buttonName='forgotPassword'>
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
      </div>

      <IonButton
        style={{
          height: "35px",
          padding: "0",
          textTransform: "none",
        }}
        expand="block"
        // // Disable the button if either email or password is invalid
        // disabled={isEmailValid !== true || isPasswordValid !== true}
        // Check database for email, if none exists come back with toast notifciation saying "Email not found, please sign up"
        onClick={handleEmailPasswordSignIn}

      >
        <ButtonContent loadingFor={loadingFor} buttonName='signIn'>
          Sign in
        </ButtonContent>
      </IonButton>

      <Divider>OR</Divider>

      <IonButton
        fill="outline"
        style={{
          height: "35px",
          borderRadius: "10px"
        }}
        className="signin-btn"
        expand="block"
        onClick={handleGoogleSignIn}
      >

        <IonImg
          src="btn_google_light_normal_ios.png"
          style={{
            padding: "0 24px 0 0",
          }}
          >
        </IonImg>
        <IonText>
          <h6 style={{
            margin: "10px auto",
          }}>Sign in with Google</h6>
        </IonText>
      </IonButton>


      <IonButton
        style={{
          height: "35px",
          padding: "8px 0",
          textTransform: "none",
        }}
        expand="block"
  
        onClick={switchToSignUp}

      >
        Don't have an account?
      </IonButton>


    </div>
  );
};

export default LoginComponent;
