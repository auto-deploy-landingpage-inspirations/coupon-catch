import React, { useState } from "react";
import { IonInput } from "@ionic/react";

interface EmailProps {
  email: string;
  onEmailChange: (email: string, isValid: boolean) => void;
}

const EmailComponent: React.FC<EmailProps> = ({ email, onEmailChange }) => {
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean | undefined>();
  const [emailField, setEmailField] = useState<string>("");

  const isEmail = (email: string) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

  const handleEmailInput = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    setEmailField(value);
    setIsEmailValid(undefined);
    if (value === "") {
      onEmailChange(value, false);
      return;
    }
    const valid = isEmail(value);
    setIsEmailValid(valid);
    onEmailChange(value, valid);
  };

          {/* The IonInput component to collect the email.
        - `ion-valid` class is added if the email is valid.
        - `ion-invalid` class is added if the email is invalid.
        - `ion-touched` class is added if the input has been touched/interacted with by the user. */}
        
  return (
    <IonInput
      className={`${isEmailValid === true && "ion-valid"} ${
        isEmailValid === false && "ion-invalid"
      } ${isEmailTouched && "ion-touched"}`}
      value={email}
      type="email"
      fill="outline"
      label="Email"
      labelPlacement="floating"
      helperText=""
      errorText="Invalid email address"
      onIonInput={handleEmailInput}
      onIonBlur={() => setIsEmailTouched(true)}
      placeholder=""
    ></IonInput>
  );
};

export default EmailComponent;
