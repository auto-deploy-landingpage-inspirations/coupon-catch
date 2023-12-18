export interface ILineItem {
  userId: string;
  receiptId: string;
  itemNumber: number;
  itemDesc: string;
  itemPrice: number;
  couponNum: string;
  origPurchasedCouponAmt: number;
  quantity: number;
  isUnlocked: boolean;
  isRedeemed: boolean;
  availCouponAmount: number;
}