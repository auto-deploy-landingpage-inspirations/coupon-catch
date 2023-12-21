// UnlockCouponsButton.tsx
import React from 'react';
import { IonButton } from '@ionic/react';
import { IReceiptItem } from '../utils/types';
import { ButtonContent } from '../components/ButtonContent';

interface UnlockCouponsButtonProps {
    receipt: IReceiptItem;
    loadingFor: string;
    handleUnlockCouponsButton: () => void;
}

const UnlockCouponsButton: React.FC<UnlockCouponsButtonProps> = ({ receipt, loadingFor, handleUnlockCouponsButton }) => {
    return (
        receipt.daysLeft > 0 && (
            <IonButton
                fill="solid"
                className="btn"
                onClick={handleUnlockCouponsButton}
            >
            <ButtonContent loadingFor={loadingFor} buttonName="unlockbutton">
            Unlock ${receipt.unlockCouponTotal.toFixed(2)} in coupons
            </ButtonContent>
            </IonButton>
        )
    );
};

export default UnlockCouponsButton;