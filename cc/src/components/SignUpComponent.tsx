import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonImg,
  IonInput,
  IonItem,
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

import { LoginOrSignupStore } from '../utils/store';
import { auth, createUserWithEmailAndPassword } from "../utils/firebaseConfig";

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

const SignUpPage: React.FC = () => {
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

    // MODAL
    // Modal for terms modal with download
    const modal = useRef<HTMLIonModalElement>(null);
    // Modal download for terms and conditions function
    function download() {
      // download link for pdf of terms and conditions
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

  const switchToLogin = () => {
    LoginOrSignupStore.update(s => {
      s.isLogin = true;
    });
  };

  
  // Function to handle email and password sign-up
  const handleEmailPasswordSignUp = async () => {
    // Set state for showing spinner/loading indicator
    setLoadingFor('signUp');
    try {
      // ... any pre-signIn logic if needed
      // Try to sign up with the provided email and password
      await createUserWithEmailAndPassword(auth, emailField, passwordField);
      console.log("Successful signup noob")
      // ... any post-signIn logic if needed
    } catch (error) {
      // Handle error accordingly
      setToast({ isOpen: true, message: 'Error signing up with email and password, try again later', color: 'danger' });
    } finally {
      setLoadingFor('');
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
          textAlign: "center",
          margin: "-20px auto -21px auto",
          fontSize: ".8rem",
        }}
        // className="ion-text-justify"
      >
        {/* <Link to="/login">
          <IonButton
            fill="clear"
            size="small"
            style={{ textTransform: "none" }}
          >
            What the hell is coupon catch?
          </IonButton>
        </Link> */}

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

        {/* <IonButton
          disabled={isEmailValid !== true }
          fill="clear"
          size="small"
          style={{
            textTransform: "none",
          }}
          onClick={async () => {
            
          }}
        >
          Forgot password?
        </IonButton> */}
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
        onClick={handleEmailPasswordSignUp}

      >
        <ButtonContent loadingFor={loadingFor} buttonName='signUp'>
          Sign up
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

        onClick={async () => {
          try {
          } catch (err: any) {}
        }}
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
          }}>Sign up with Google</h6>
        </IonText>
      </IonButton>

      <IonButton
        style={{
          height: "35px",
          padding: "8px 0",
          textTransform: "none",
        }}
        expand="block"
        onClick={switchToLogin}
      >
        Already have an account?
      </IonButton>

      <IonToast
        isOpen={toast.isOpen}
        onDidDismiss={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        duration={3000}
        color={toast.color}
      />

      {/* Terms and Conditions modal with Download button*/}
      <IonModal
          ref={modal}
          isOpen={showTermsModal}
          onDidDismiss={() => setShowTermsModal(false)}
          >
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
              <IonButton onClick={() => setShowTermsModal(false)}>
                  Back
                </IonButton>
              </IonButtons>
              <IonTitle>Terms and Conditions</IonTitle>
              <IonButtons slot="end">
                <IonButton download='/terms.pdf' strong={true} onClick={() => download()}>
                  Download
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonText>
                <p>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Omnis id illo aliquam quisquam nulla ducimus laborum fuga ipsa
                  quos, nobis dignissimos necessitatibus blanditiis atque saepe?
                  At rerum voluptates eaque qui harum magnam asperiores quia
                  tempora, sunt, cumque saepe itaque mollitia, pariatur aliquam
                  quasi tempore expedita. Harum illo fugiat similique expedita
                  sunt amet est mollitia, necessitatibus quidem at corrupti.
                  Adipisci placeat accusantium asperiores veniam obcaecati
                  suscipit rerum! Vitae ad magnam adipisci rerum. Cupiditate
                  autem maiores tempora labore eligendi quae fugit magni minus
                  voluptatibus perferendis at quidem laborum dignissimos ullam
                  dolorum quia commodi fugiat vel, maxime beatae? Quis quae eos
                  exercitationem distinctio vero enim, perspiciatis est
                  consequuntur aspernatur pariatur nobis voluptate esse unde
                  itaque minima maiores adipisci autem nihil, explicabo
                  repudiandae. Molestiae rerum accusantium similique voluptatum,
                  doloribus, expedita assumenda quis est asperiores nam eveniet
                  voluptates eaque, nihil deserunt tenetur corporis commodi
                  recusandae reprehenderit laborum odit quam natus doloremque
                  praesentium necessitatibus? Nobis recusandae illo voluptatibus
                  laborum unde nostrum iure consequuntur distinctio deserunt,
                  ducimus quas sed dolorum ex neque quae harum commodi quo
                  facilis, explicabo velit? Nostrum eius tenetur inventore
                  voluptate earum soluta voluptatem, necessitatibus illum,
                  maxime mollitia labore totam ab repellat? Placeat voluptatum
                  ducimus doloremque consequatur quaerat laborum minima totam
                  beatae perspiciatis possimus quas quam et, minus blanditiis
                  error dolorum sequi iste ratione, atque quos.
                </p>
              </IonText>
            </IonItem>
          </IonContent>
        </IonModal>
    </div>

  );
};

export default SignUpPage;
