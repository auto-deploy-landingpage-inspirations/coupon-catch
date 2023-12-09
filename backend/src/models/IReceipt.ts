export interface IReceipt {
    supplier: string;
    barcodeNumber: string;
    storeAddress: string;
    dayCode: string;
    memberNumber: number;
    storeNumber: string;
    storeName: string;
    terminalNumber: number;
    transactionNumber: number;
    operatorNumber: number;
    dateOfPurchase: string;
    timeOfPurchase: string;
    numberOfItems: number;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
    execCheckAmount: number;
    isDeleted: boolean;
    createdAt: string;
    daysLeft: number;
    isUnlocked: boolean;
    isRedeemed: boolean;
    totalCouponAmount: number;
  }