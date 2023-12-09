import { ReactNode } from "react";

export interface ICouponItem {
  itemNumber: number;
  discount: number;
  couponEndDate: string;
  couponStartDate: string;
  desc: string;
  daysLeft: number;
}
export const couponList: ICouponItem[] = [];

export interface IReceiptItem {
  id: string;
  barcodeNumber: string;
  storeAddress: string;
  memberNumber: string;
  storeNumber: string;
  storeName: string;
  terminalNumber: string;
  transactionNumber: string;
  operatorNumber: string;
  subTotal: number;
  dateOfPurchase: string;
  timeOfPurchase: string;
  numberOfItems: number;
  taxAmount: number;
  totalAmount: number;
  dollarAmounts: number[];
  couponAmounts: number[];
  execCheckAmount: number;
  multiplierLines: {
    multiple: number;
    amount: number;
    itemNumber: string;
  }[];
  itemLines: {
    itemNumber: number;
    itemDesc: string;
    couponNum: string;
    couponAmt: string;
    itemPrice: number;
    quantity: number;
  }[];
  couponLines: {
    itemNumber: string;
    couponNumber: string;
  }[];
  createdAt: string;
  daysLeft: number;
  isUnlocked: boolean;
  isRedeemed: boolean;
  isDeleted: boolean;
  receiptHasCouponItems: boolean;
  couponData: {
    count: number;
    sum: number;
    daysLeft: number;
    items: ICouponItem[];
  };
  totalCouponAmount: number;
  totalCouponAmountUnlocked: number;
  totalCOuponAmountRedeemed: number;
  };

export const receiptList: IReceiptItem[] = [];

// Required interface for ButtonContent component
export interface IButtonContentProps {
  loadingFor: string;
  buttonName: string;
  children: ReactNode;
}
