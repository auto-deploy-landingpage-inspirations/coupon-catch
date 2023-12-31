import React, { CSSProperties } from 'react';
import { IonButton, IonIcon } from "@ionic/react";
import { camera } from "ionicons/icons";

interface ConfirmButtonProps {
    handleConfirmUpload: () => void;
}
const ConfirmButtonStyles: any = {
    margin: "auto 0",
    textTransform: "none",
    width: "144px",
    '--border-radius': '4px',
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({ handleConfirmUpload }) => {
    return (
        <IonButton
            style={ConfirmButtonStyles}
            onClick={handleConfirmUpload}
        >
            Upload receipt
        </IonButton>
    )
}

export default ConfirmButton;