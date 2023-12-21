import React, { useMemo} from 'react';
import { IonBadge, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonIcon } from "@ionic/react";
import { cartOutline, trashOutline } from "ionicons/icons";
import { IReceiptItem } from '../utils/types';

interface ReceiptItemProps {
  receipt: IReceiptItem;
  mostRecentReceiptId: string | undefined;
  onReceiptClick: (id: string) => void;
  onPurchaseCouponUnlock: (id: string) => void;
  onDeleteReceipt: (id: string) => void;
}



const ReceiptItem = React.forwardRef<HTMLIonItemSlidingElement, ReceiptItemProps>(
  ({ receipt, mostRecentReceiptId, onReceiptClick, onPurchaseCouponUnlock, onDeleteReceipt }, ref) => {

    // const hasValidCouponSum = receipt.couponData && typeof receipt.couponData.sum === 'number';

  return (
    <IonItemSliding key={receipt.id} ref={ref}>
    <IonItem
      id={`receipt-item-${mostRecentReceiptId}`}
      color="var(--ion-item-background, white)"
      button
      detail={true}
      onClick={() => onReceiptClick(receipt.id)}
    >
      <IonLabel>
        <h1
          style={{
            fontWeight: "bold",
            color: "var(--ion-color-primary)",
          }}
        >
          {/* if daysLeft is <= 0 OR unlockedCouponTotal == 0 , dipslay "No eligible items"
          then if daysLeft is > 0 AND unlockedCouponTotal > 0, display "x days to redeem"
          */}
          {receipt.daysLeft <= 0 || receipt.unlockCouponTotal === 0
            ? "No eligible items"
            : receipt.daysLeft > 0 && receipt.unlockCouponTotal > 0
            ? `${receipt.daysLeft} days to redeem`
            : "No eligible items"}
        </h1>
        <h2>{receipt.dateOfPurchase}</h2>
      </IonLabel>
      {receipt.unlockCouponTotal > 0 && receipt.daysLeft >= 0 && (
        <IonBadge
          slot="end"
          color="primary"
          style={{ padding: ".5rem", fontSize: "1.4rem" }}
        >
          ${receipt.unlockCouponTotal.toFixed(2)}
        </IonBadge>
      )}
    </IonItem>

    <IonItemOptions>
      {/* Shopping cart option on swipe */}
      <IonItemOption color="success">
        <IonIcon
          icon={cartOutline}
          onClick={() => onPurchaseCouponUnlock(receipt.id)}
          style={{ fontSize: "32px", padding: "8px" }}
        ></IonIcon>
      </IonItemOption>

      {/* Trash option on swipe */}
      <IonItemOption color="danger">
        <IonIcon
          icon={trashOutline}
          onClick={() => onDeleteReceipt(receipt.id)}
          style={{ fontSize: "32px", padding: "8px" }}
        ></IonIcon>
      </IonItemOption>
    </IonItemOptions>
  </IonItemSliding>
  );

});

export default ReceiptItem;
