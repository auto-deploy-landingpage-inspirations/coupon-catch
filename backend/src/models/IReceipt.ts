export interface IReceipt {
  userId: string;
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
    timeOfPurchase: string;
    numberOfItems: number;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
    execCheckAmount: number;
    // Stuff to send to the client for UI display
    // date of creation of each receipt
    createdAt: string;
    // ID's of each of the numberOfReceipts
    receiptIds: string[];
    // date of purchase
    dateOfPurchase: string;
    // days left til the coupon adjustment expires
    daysLeft: number;
    // is deleted
    isDeleted: boolean;
    isUnlocked: boolean;
    unlockCouponTotal: number;
    isRedeemed: boolean;
    itemLines: [];
  }