import { firestore } from 'firebase-admin';

// Interface for a Coupon
export interface ICoupon {
    itemNumber: number;
    discount: number;
    couponEndDate: string;
    couponStartDate: string;
    desc: string;
    daysLeft: number;
}

// Firestore collection name
const collectionName = 'coupons';

// Function to save a coupon to Firestore
export const saveCoupon = async (couponData: ICoupon): Promise<void> => {
    const db = firestore();
    await db.collection(collectionName).add(couponData);
};

// Function to get a coupon by item number
export const getCouponByItemNumber = async (itemNumber: number): Promise<ICoupon | undefined> => {
    const db = firestore();
    const snapshot = await db.collection(collectionName)
                             .where('itemNumber', '==', itemNumber)
                             .get();

    if (snapshot.empty) {
        return undefined;
    }

    return snapshot.docs[0].data() as ICoupon;
};

// Other functions as needed for your business logic
// e.g., updateCoupon, deleteCoupon, etc.
