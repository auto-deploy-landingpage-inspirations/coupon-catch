import React from 'react';
import { IonBadge, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonIcon } from "@ionic/react";
import { cartOutline, trashOutline } from "ionicons/icons";
import { isOlderThan30Days } from "../utils/miscUtils";
import { IReceiptItem } from '../utils/types';

interface ReceiptItemProps {
  receipt: IReceiptItem; // Assuming IReceiptItem is the type for receipt
  mostRecentReceiptId: string | undefined;
  onReceiptClick: (id: string) => void;
  onPurchaseCouponUnlock: (id: string) => void;
  onDeleteReceipt: (id: string) => void;
}

const ReceiptItem = React.forwardRef<HTMLIonItemSlidingElement, ReceiptItemProps>(
  ({ receipt, mostRecentReceiptId, onReceiptClick, onPurchaseCouponUnlock, onDeleteReceipt }, ref) => {

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
            color: isOlderThan30Days(receipt.dateOfPurchase)
              ? "var(--ion-color-danger-shade)"
              : "inherit",
          }}
        >
          {" "}
          {receipt.receiptHasCouponItems === false
            ? "No eligible items"
            : `$${receipt.totalCouponAmount.toFixed(2)} avail for ${
                receipt.daysLeft
              } days`}
        </h1>
        <h2>{receipt.dateOfPurchase}</h2>
      </IonLabel>
      {receipt.couponData.sum > 0 && (
        <IonBadge
          slot="end"
          color="secondary"
          style={{ padding: ".5rem", fontSize: "1.4rem" }}
        >
          ${receipt.couponData.sum.toFixed(2)}
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
