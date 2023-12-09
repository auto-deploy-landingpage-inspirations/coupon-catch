import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonRouterLink,
  IonSpinner,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import { OverlayEventDetail } from "@ionic/core/components";
import React, { ReactNode, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/SignUpComponentStyles.css";
import { GoogleAuthProvider, signInWithPopup } from "@firebase/auth";
import { LoginOrSignupStore } from '../utils/store';
import { auth, createUserWithEmailAndPassword, updateProfile } from "../utils/fbAuth";
import { download } from "ionicons/icons";
import TermsModal from "./TermsModal";

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

  interface SignUpComponentProps {
    toggleLogin: () => void;
  }

const SignUpPage: React.FC<SignUpComponentProps> = ({ toggleLogin }) => {
  // loadingFor state to track which button is loading
  const [loadingFor, setLoadingFor] = useState('');
  // toastr state to display toast messages
  const [toast, setToast] = useState({ 
    isOpen: false, 
    message: '', 
    color: '' 
  });
  const [showTermsModal, setShowTermsModal] = useState(false);

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
  // // State to track whether the repeatpassword should be shown or not
  // const [showRepeatPasswordField, setShowRepeatPasswordField] =
  //   useState<boolean>(false);
  // State to track whether the displayName should be shown or not
  const [showDisplayNameField, setShowDisplayNameField] =
  useState<boolean>(false);

  // DISPLAYNAME FIELD
  // State to track if the displayName input has been touched/interacted with by the user
  const [isDisplayNameTouched, setIsDisplayNameTouched] = useState(false);
  // State to track if the displayName input value is valid or not
  const [isDisplayNameValid, setIsDisplayNameValid] = useState<boolean | undefined>();
  // State to track displayNameField as entered by user
  const [displayNameField, setDisplayNameField] = useState<string>("");


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

    function handleDownloadTandCPDF() {
      // download link for pdf of terms and conditions stored in "../../public/CCTermsandConditions.pdf"
    };

    // Allows Modal to be closed?
    function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
      if (ev.detail.role === "confirm") {
          setShowTermsModal(false);
      }
    };

  // onIonInput provides an Event object, from which the value is used to set the state of the password field useState value
  const handlePasswordInput = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    setPasswordField(value);
    // Resetting isPasswordValid state to undefined (initial state)
    setIsPasswordValid(undefined);
    // If the user hasn't entered anything, exit the function. If the user has enetered anything, set the state using setShowDisplayNameField to true to display the repeat password field
    value === ""
      ? setShowDisplayNameField(false)
      : setShowDisplayNameField(true);
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

      // onIonInput provides an Event object, from which the value is used to set the state of the displayName field useState value
      const handleDisplayNameInput = (ev: Event) => {
        const value = (ev.target as HTMLInputElement).value;
        setDisplayNameField(value);
        // Resetting isDisplayNameValid state to undefined (initial state)
        setIsDisplayNameValid(undefined);
        // If the user hasn't entered anything, exit the function.
        if (value === "") return;
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

  const switchToLogin = () => {
    LoginOrSignupStore.update(s => {
      s.isLogin = true;
    });
  };

  
  const handleEmailPasswordSignUp = async () => {
    setLoadingFor('signUp');
    try {
      // Try to sign up with the provided email and password
      const userCredential = await createUserWithEmailAndPassword(auth, emailField, passwordField);
      const user = userCredential.user;
  
      // Check if user is not null
      if (user) {
        // Add display name
        await updateProfile(user, {
          displayName: displayNameField
        });
        // Profile updated!
        // ...
      } else {
        // Handle the case when there is no user (this should theoretically never happen here)
        setToast({ isOpen: true, message: 'No user logged in', color: 'danger' });
      }
    } catch (error) {
      // Handle error accordingly
      setToast({ isOpen: true, message: 'Error signing up with email and password, try again later', color: 'danger' });
    } finally {
      setLoadingFor('');
    }
  };

    // Function to handle Google sign-in
    const handleGoogleSignUp = async () => {
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
        <h1>Sign up for savings</h1>
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
        {/* The IonInput component to collect the password.
            - `ion-valid` class is added if the password is valid.
            - `ion-invalid` class is added if the password is invalid.
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

      {showDisplayNameField && (
      <div style={{ padding: "8px 0" }}>
        {/* The IonInput component to collect the email.
            - `ion-valid` class is added if the email is valid.
            - `ion-invalid` class is added if the email is invalid.
            - `ion-touched` class is added if the input has been touched/interacted with by the user. */}
        <IonInput
          className={`${isDisplayNameValid === true && "ion-valid"} ${
            isDisplayNameValid === false && "ion-invalid"
          } ${isDisplayNameTouched && "ion-touched"}`}
          fill="outline"
          label="Name"
          clearOnEdit={false}
          labelPlacement="floating"
          helperText=""
          errorText="Invalid name"
          // onIonInput provides an Event object,
          onIonInput={handleDisplayNameInput}
          onIonBlur={() => setIsDisplayNameTouched(true)}
          placeholder=""
        ></IonInput>
      </div>
      )}

      <div
        style={{
          textAlign: "center",
          margin: "-20px auto -21px auto",
          fontSize: ".8rem",
        }}
        // className="ion-text-justify"
      >

        <IonText className="ion-padding-top">
            <p>
              By signing up, you agree to our
              <br />
              <IonRouterLink 
                className="terms-link"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
              >
                Terms and Conditions
                </IonRouterLink>

            </p>
          </IonText>

        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </div>

      <IonButton
        className="signupBtn"
        fill="outline"
        expand="block"
        // // Disable the button if either email or password is invalid
        // disabled={isEmailValid !== true || isPasswordValid !== true}
        // Check database for email, if none exists come back with toast notifciation saying "Email not found, please sign up"
        onClick={handleEmailPasswordSignUp}

      >
        <ButtonContent loadingFor={loadingFor} buttonName='signUp'>
        <IonText>
          Sign up with email
          </IonText>
        </ButtonContent>
      </IonButton>

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
          className="googlesignupBtn"
          expand="block"
          fill="outline"
          onClick={handleGoogleSignUp}
          aria-label="Sign up with Google"
        >
        </IonButton>

        <IonButton
          style={{ padding: "8px 0 0 0" }}
          onClick={toggleLogin}
          className="loginBtn"
          expand="block"
        >
          <IonText style={{ color: "white" }}>Already have an account?</IonText>
        </IonButton>

          {/* <IonRouterLink 
          className=""
          onClick={www.couponcatchapp.com/pricing#FAQ}
        >
          What's the catch?
          </IonRouterLink> */}

          <a 
  href="https://www.couponcatchapp.com/pricing#FAQ"
  target="_blank"
  rel="noopener noreferrer"
  className="whatsthislink"
>
  What's the catch?
</a>

      </div>
      <IonToast
        isOpen={toast.isOpen}
        onDidDismiss={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        duration={3000}
        color={toast.color}
      />


{/* Terms and Conditions modal with Download button*/}
      <TermsModal
        isOpen={showTermsModal}
        onDidDismiss={() => setShowTermsModal(false)}
      />


    </div>

  );
};

export default SignUpPage;
