import React from 'react';
import { IonSpinner } from '@ionic/react';
import { IButtonContentProps } from '../utils/types';

export const ButtonContent: React.FC<IButtonContentProps> = ({ loadingFor, buttonName, children }) => {
    return loadingFor === buttonName ? <IonSpinner name="bubbles" /> : children;
};