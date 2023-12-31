import React from 'react';
import { IonButton, IonIcon } from "@ionic/react";
import { images } from "ionicons/icons";

interface GalleryButtonProps {
    handleTakePhoto: () => void;
}

const GalleryButtonStyles: any = {
    margin: "auto 0",
    textTransform: "none",
    width: "144px",
    '--border-radius': '4px',
}

const GalleryButton: React.FC<GalleryButtonProps> = ({ handleTakePhoto }) => {
    return (
        <IonButton
        style={GalleryButtonStyles}
        onClick={handleTakePhoto}
        >
            <IonIcon aria-hidden="true" icon={images} />
        </IonButton>
    )
}

export default GalleryButton;