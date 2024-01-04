import React from 'react';
import { IonList } from '@ionic/react';
import ReceiptItem from './ReceiptItem';
import { IReceiptItem } from '../utils/types';
import { useRef } from 'react';
import { ReceiptStore } from '../utils/store';
import LoadingPage from './LoadingPage';

interface ReceiptListProps {
  receipts: IReceiptItem[];
  mostRecentReceiptId: string | undefined;
  onReceiptClick: (id: string) => void;
  onPurchaseCouponUnlock: (id: string) => void;
  onDeleteReceipt: (id: string) => void;
}

const ReceiptList: React.FC<ReceiptListProps> = ({
  receipts,
  mostRecentReceiptId,
  onReceiptClick,
  onPurchaseCouponUnlock,
  onDeleteReceipt,
}) => {
  const receiptsIsCalculated = ReceiptStore.useState(s => s.isCalculated); // Get the isCalculated state
    // const animatedItemRef = useRef<HTMLIonItemSlidingElement>(null);
//  console.log("receipts at ReceiptList: ", receipts)
//     console.log("ReceiptList component rendering");

if (!receiptsIsCalculated) {
  return <LoadingPage />;
}
  return (
    <IonList>
      {receipts.map(receipt => (
        <ReceiptItem
          key={receipt.id}
          receipt={receipt}
          mostRecentReceiptId={mostRecentReceiptId}
          onReceiptClick={onReceiptClick}
          onPurchaseCouponUnlock={onPurchaseCouponUnlock}
          onDeleteReceipt={onDeleteReceipt}
          // ref={receipt.id === mostRecentReceiptId ? animatedItemRef : undefined}
        />
      ))}
    </IonList>
  );
}

export default ReceiptList;
