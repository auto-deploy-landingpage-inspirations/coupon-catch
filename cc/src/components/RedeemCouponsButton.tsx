import { IonButton } from '@ionic/react'
import React from 'react'
import { IReceiptItem } from '../utils/types'
import ConfettiExplosion from "react-confetti-explosion";
import ReactHowler from "react-howler";

interface RedeemCouponsButtonProps {
  receipt: IReceiptItem;
  handleRedeemCouponsButton: () => void;
  isExploding: boolean;
}

const RedeemCouponsButton: React.FC<RedeemCouponsButtonProps> = ({ receipt, handleRedeemCouponsButton, isExploding }) => {
  return (
    receipt.daysLeft && (
      <>
      <br />
      <IonButton
        id="redeem-alert"
        fill="solid"
        className="btn"
        onClick={handleRedeemCouponsButton}
      >
        {isExploding && (
          <>
            <ConfettiExplosion
              particleCount={250}
              duration={3500}
              force={0.8}
            />
            <ReactHowler src="/confetti.mp3" playing={isExploding} />
          </>
        )}
        I've redeemed these coupons,<br /> add them to my total!
      </IonButton>
      </>
    )
  )
}

export default RedeemCouponsButton