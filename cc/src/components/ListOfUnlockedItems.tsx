import {
  IonCheckbox,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonSkeletonText,
} from "@ionic/react";
import React, { useState } from "react";
import { IReceiptItem, ICouponItem } from "../utils/types";

interface ListOfUnlockedItemsProps {
  receipt: IReceiptItem;
}

const ListOfUnlockedItems: React.FC<ListOfUnlockedItemsProps> = ({
  receipt,
}) => {
  const couponItemsFromReceipt = receipt.itemLines.filter(
    (item) => item.availCouponAmount > 0
  );

  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    couponItemsFromReceipt.reduce((items, item) => ({ ...items, [item.itemNumber]: true }), {})
  );
  
  const handleCheckChange = (itemNumber: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [itemNumber]: checked }));
  };


  return (
<IonList style={{ width: '100%' }}>
      <IonListHeader>
        <IonLabel style={{ flex: "1", textAlign: 'center' }}>
          <h1>Item #</h1>
        </IonLabel>
        <IonLabel style={{ flex: "1", textAlign: 'center' }}>
          <h1>Desc</h1>
        </IonLabel>
        <IonLabel style={{ flex: "1", textAlign: 'center' }}>
          <h1>Cpn Amt</h1>
        </IonLabel>
      </IonListHeader>

      {receipt.isUnlocked
        ? couponItemsFromReceipt.map((item: any, index: any) => (
            <IonItem key={index} style={{ width: '118%', marginLeft: '-16px' }}>
              <IonCheckbox
              mode="ios"
                slot="start"
                checked={checkedItems[item.itemNumber] || false}
                onIonChange={(e) =>
                  handleCheckChange(item.itemNumber, e.detail.checked)
                }
                aria-label={`Select item ${item.itemNumber}`}
              />
              <IonLabel style={{ flex: "0 0 23%" }}>{item.itemNumber}</IonLabel>
              <IonLabel style={{ flex: "0 0 50%" }}>{item.itemDesc}</IonLabel>
              <IonLabel style={{ flex: "0 0 15%" }}>
                ${item.availCouponAmount.toFixed(2)}
              </IonLabel>
            </IonItem>
          ))
        : Array.from({ length: couponItemsFromReceipt.length }, (_, index) => (
            <IonItem key={index}>
              <IonSkeletonText
                // animated
                style={{ width: "19%", height: "20px" }}
              />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <IonSkeletonText
                // animated
                style={{ width: "50%", height: "20px" }}
              />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <IonSkeletonText
                // animated
                style={{ width: "15%", height: "20px" }}
              />
            </IonItem>
          ))}
    </IonList>
  );
};

export default ListOfUnlockedItems;
