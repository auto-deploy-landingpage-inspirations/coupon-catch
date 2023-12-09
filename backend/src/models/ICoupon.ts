export interface ICoupon {
    itemNumber: number;
    discount: number;
    couponEndDate: string;
    couponStartDate: string;
    desc: string;
    daysLeft: number;
}