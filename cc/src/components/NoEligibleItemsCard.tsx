import React from 'react';
import { IonCardContent, IonText } from '@ionic/react';
import { IReceiptItem } from '../utils/types'

interface NoEligibleItemsCardProps {
    receipt: IReceiptItem; // Assuming IReceiptItem is the correct type for receipt
  }

  const NoEligibleItemsCard: React.FC<NoEligibleItemsCardProps> = ({ receipt }) => {
    return (
    <IonCardContent>
      <IonText>
        <h2>
          Sorry, we didn't find any eligible items on this receipt. If
          you think this receipt should have eligible items, please
          contact us at{" "}
          <a
            href={`mailto:couponcatchapp@gmail.com?subject=Inquiry about Receipt ID: ${receipt.id}`}
          >
            couponcatchapp@gmail.com
          </a>
          .
        </h2>
      </IonText>
    </IonCardContent>
  );
};

export default NoEligibleItemsCard;
