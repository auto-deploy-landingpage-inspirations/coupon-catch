import React, { CSSProperties } from 'react';
import { IonButton, IonIcon } from "@ionic/react";
import { camera } from "ionicons/icons";

interface CameraButtonProps {
    handleTakePhoto: () => void;
}
const CameraButtonStyles: any = {
    margin: "auto 0",
    textTransform: "none",
    width: "144px",
    '--border-radius': '4px',
}

const CameraButton: React.FC<CameraButtonProps> = ({ handleTakePhoto }) => {
    return (
        <IonButton
            style={CameraButtonStyles}
            onClick={handleTakePhoto}
        >
            <IonIcon aria-hidden="true" icon={camera} />
        </IonButton>
    )
}

export default CameraButton;