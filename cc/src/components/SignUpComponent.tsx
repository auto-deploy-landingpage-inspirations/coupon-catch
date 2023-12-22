import {
  IonButton,

  IonInput,

  IonRouterLink,

  IonText,

  IonToast,

} from "@ionic/react";
import Divider from "./Divider"
import { OverlayEventDetail } from "@ionic/core/components";
import React, { CSSProperties, ReactNode, Suspense, useRef, useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "@firebase/auth";
import { createUserWithEmailAndPassword, updateProfile } from "../utils/fbAuth";
const TermsModal = React.lazy(() => import('./TermsModal'));
import { ButtonContent } from "./ButtonContent";
import { getAuth } from "../utils/fbAuth";

const auth = getAuth();
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

  // const switchToLogin = () => {
  //   LoginOrSignupStore.update(s => {
  //     s.isLogin = true;
  //   });
  // };

  
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
        // route to home page?
      } catch (error) {
        // Handle error accordingly
        console.error("Error signing in with Google", error);
      }
    };

    const whatsThisStyle: CSSProperties = {
      padding: '20px 10px 0 10px',
      textDecoration: 'none',
      color: '#4285F4'
    };

    const googleSignupButtonStyle: CSSProperties = {
        borderRadius: '4px',
        boxShadow: 'none',
        color: 'var(--ion-color-dark)',
        paddingTop: '0',
        paddingBottom: '0',
        paddingLeft: '0',
        paddingRight: '0',
        fontFamily: 'Roboto, arial, sans-serif',
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
        backgroundImage: 'url("../../public/googleSignUp.png")',
        backgroundSize: 'cover', /* this will make the image cover the entire button */
        backgroundPosition: 'center', /* centers the background image */
        backgroundRepeat: 'no-repeat'
      };

      const signupButtonStyle: CSSProperties = {
        borderRadius: '4px',
        boxShadow: 'none',
        color: 'var(--ion-color-dark)',
        paddingTop: '0',
        paddingBottom: '0',
        paddingLeft: '0',
        paddingRight: '0',
        fontFamily: 'Roboto, arial, sans-serif',
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
        backgroundImage: 'url("../../public/signUp.png")',
        backgroundSize: 'cover', /* this will make the image cover the entire button */
        backgroundPosition: 'center', /* centers the background image */
        backgroundRepeat: 'no-repeat'
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
                style={{ textDecoration: 'none', cursor: 'pointer' }}
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
        style={signupButtonStyle}
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
style={googleSignupButtonStyle}
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
  style={whatsThisStyle}
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
<Suspense fallback={<div>Loading...</div>}>
      <TermsModal
        isOpen={showTermsModal}
        onDidDismiss={() => setShowTermsModal(false)}
      />
</Suspense>

    </div>

  );
};

export default SignUpPage;
