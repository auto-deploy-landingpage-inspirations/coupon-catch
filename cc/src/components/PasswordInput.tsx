import React, { useState } from 'react';
import { IonInput, IonText, InputCustomEvent, InputChangeEventDetail } from "@ionic/react";
import '../styles/PasswordInput.css'
interface PasswordInputProps {
  password: string;
  onPasswordChange: (password: string, isValid: boolean) => void;
  loading: boolean;
  placeholder: string;
  label: string;
  errorText: string;
  disabled: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  password,
  onPasswordChange,
  loading,
  placeholder,
  label,
  errorText,
  disabled
}) => {
  const [isPasswordValid, setIsPasswordValid] = useState<boolean | undefined>();
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);

  const handlePasswordInput = (event: InputCustomEvent<InputChangeEventDetail>) => {
    const value = event.detail.value ?? '';
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    const isValid = passwordRegex.test(value);
    setIsPasswordValid(isValid);
    setIsPasswordTouched(true);
    onPasswordChange(value, isValid);
  };


  if (isPasswordTouched && !isPasswordValid && password.length > 0) {
    errorText = "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character";
  }
          {/* The IonInput component to collect the email.
            - `ion-valid` class is added if the email is valid.
            - `ion-invalid` class is added if the email is invalid.
            - `ion-touched` class is added if the input has been touched/interacted with by the user. */}
            
  return (
    <div className="button-container">
      <IonInput
        value={password}
        className={`${isPasswordValid === true && "ion-valid"} ${
          isPasswordValid === false && "ion-invalid"
        } ${isPasswordTouched && "ion-touched"}`}
        type="password"
        fill="outline"
        label={label}
        clearOnEdit={false}
        labelPlacement="floating"
        helperText=""
        errorText={errorText}
        onIonChange={handlePasswordInput}
        onIonBlur={() => setIsPasswordTouched(true)}
        placeholder={placeholder}
        disabled={disabled || loading}
      ></IonInput>
      
    </div>
  );
};

export default PasswordInput;
