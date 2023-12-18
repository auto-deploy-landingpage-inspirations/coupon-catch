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
  daysLeft: number;
  terminalNumber: string;
  transactionNumber: string;
  operatorNumber: string;
  dateOfPurchase: string;
  createdAt: string;
  isUnlocked: boolean;
  isRedeemed: boolean;
  isDeleted: boolean;
  itemLines: ILineItem[];
  unlockCouponTotal: number;
  };

export const receiptList: IReceiptItem[] = [];

// Required interface for ButtonContent component
export interface IButtonContentProps {
  loadingFor: string;
  buttonName: string;
  children: ReactNode;
}

export interface ILineItem {  
  itemNumber: string;
  quantity: string;
  itemPrice: string;
  couponNum: string;
  availCouponAmount: string;
  isRedeemed: boolean;
  origPurchasedCouponAmt: string;
  itemDesc: string;
}
