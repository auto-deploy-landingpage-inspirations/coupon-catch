export interface ILineItem {
  receiptId: string;
  itemNumber: number;
  itemDesc: string;
  itemPrice: number;
  couponNum: string;
  origPurchasedCouponAmt: string;
  quantity: number;
  isUnlocked: boolean;
  isRedeemed: boolean;
  // couponAmountAssignedFromCouponAd: number;
}