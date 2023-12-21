import React from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonText } from '@ionic/react';
import { IReceiptItem } from '../utils/types'

interface NoEligibleItemsCardProps {
    receipt: IReceiptItem; // Assuming IReceiptItem is the correct type for receipt
  }

  const NoEligibleItemsCard: React.FC<NoEligibleItemsCardProps> = ({ receipt }) => {
    return (

      <IonCard className="background-translucent">
      <IonCardHeader>
        <IonCardTitle>
          No eligible items found
        </IonCardTitle>
        <IonCardSubtitle>sorry!</IonCardSubtitle>
      </IonCardHeader>
    <IonCardContent>
      <IonText>
        <h2>
          It looks like no items from this receipt are eligbile for a coupon adjustment. If
          you think this receipt does have eligible items and we made an error, please
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
    </IonCard>
  );
};

export default NoEligibleItemsCard;
