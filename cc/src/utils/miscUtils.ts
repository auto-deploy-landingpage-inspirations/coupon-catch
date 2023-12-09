import { differenceInDays } from 'date-fns';
import { AuthStore, IUserInfoStore, UserInfoStore } from './store';
import { ICouponItem } from './types';
import { receipt } from 'ionicons/icons';
import { IReceiptItem } from './types';
import { mergeUserSettingsInFirestore } from './fbFirestore';
 // Use your interface here

const DAYS_UNTIL_EXP = 30;

export const daysTil30DaysFromDOfP = (date: string) => {
  // calculate days left before 30 days from the dateOfPurchase
  const dateOfPurchase = new Date(date);
  const today = new Date();
  const daysSincePurchase = differenceInDays(today, dateOfPurchase);
  const daysLeft = DAYS_UNTIL_A_COUPON_ADJ_EXPIRES - daysSincePurchase;
  return daysLeft > 0 ? daysLeft : 0;
};

export const evaluateCouponEligibilityForReceipt = (
    receipt: IReceiptItem, 
    couponList: ICouponItem[]
  ) => {
    const today = new Date();
  
    const result = receipt.itemLines.reduce(
      (
        acc: { count: number; sum: number; daysLeft: number | undefined; items: ICouponItem[] },
        itemLine: any
      ) => {
        const itemLineNumber = itemLine.itemNumber !== null
          ? parseInt(itemLine.itemNumber, 10)
          : null;
  
        if (
          itemLine.couponNum === "" &&
          itemLineNumber !== null &&
          !isNaN(itemLineNumber)
        ) {
          const matches = couponList.filter(
            (coupon: ICouponItem) => coupon.itemNumber === itemLineNumber
          );
  
          if (matches.length > 0) {
            acc.count += matches.length;
            acc.sum += matches.reduce((sum, match) => sum + match.discount, 0);
            acc.items = [...acc.items, ...matches]; // Adding entire coupon items
  
            // Calculate days left for the first match (assuming all matches have the same couponEndDate)
            if (acc.daysLeft === undefined && matches[0].couponEndDate) {
              const [month, day, year] = matches[0].couponEndDate
                .split("/")
                .map(Number);
              const couponEndDate = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript Date
              acc.daysLeft = differenceInDays(couponEndDate, today);
            }
          }
        }
        return acc;
      },
      { count: 0, sum: 0, daysLeft: undefined, items: [] }
    );
  
    // Step 2: Create a map for quick item description lookup from the receipt
    // Explicitly type the accumulator to have string keys and string values
    const itemDescMap = receipt.itemLines.reduce((acc: { [key: string]: string }, itemLine) => {
        acc[itemLine.itemNumber.toString()] = itemLine.itemDesc; // Convert number to string for key
        return acc;
    }, {});

// Step 3: Update the 'desc' in couponItemsFromReceipt using the itemDescMap
const updatedCouponItems = result.items.map(item => {
    const updatedDesc = itemDescMap[item.itemNumber.toString()]; // Convert number to string for lookup
    return {
        ...item,
        desc: updatedDesc || item.desc // Fallback to original desc if no match found
    };
});

    return { ...result, items: updatedCouponItems };
  };


  const DAYS_UNTIL_A_COUPON_ADJ_EXPIRES = 30;
  // This function will return the number of days left, which is the lower of the two values: 
  export const daysLeftForCouponRedemption = (receipt: IReceiptItem, couponList: ICouponItem[]) => {
    const eligibilityResult = evaluateCouponEligibilityForReceipt(receipt, couponList);
    const daysLeftFromCoupon = eligibilityResult.daysLeft ?? Number.MAX_VALUE; // Fallback if daysLeft is undefined
  
    return Math.round(
      Math.min(
        daysLeftFromCoupon,
        daysTil30DaysFromDOfP(receipt.dateOfPurchase)
      )
    );
  };

  export const isOlderThan30Days = (date: string) => {
    const dateOfPurchase = new Date(date);
    const today = new Date();
    const differenceInTime = today.getTime() - dateOfPurchase.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return differenceInDays > 30;
  };

  export const updateUserSettings = async (userInfo: any, userId: string) => {
    // Define default values
    const defaultUserInfo: IUserInfoStore = {
      name: "",
      email: "",
      totalRedeemedAmount: 0,
      totalUnlockedAmount: 0,
      totalReceiptsRedeemed: 0,
      totalReceiptsUnlocked: 0,
      prefersDarkMode: false,
      isDemoCouponApplied: false,
      isPayingUser: false,
      sp_subscriptionId: "",
      sp_customerId: ""
    };
  
    // Create finalUserInfo with explicit property assignments
    const finalUserInfo: IUserInfoStore = {
      name: userInfo?.name ?? defaultUserInfo.name,
      email: userInfo?.email ?? defaultUserInfo.email,
      totalRedeemedAmount: userInfo?.totalRedeemedAmount ?? defaultUserInfo.totalRedeemedAmount,
      totalUnlockedAmount: userInfo?.totalUnlockedAmount ?? defaultUserInfo.totalUnlockedAmount,
      totalReceiptsRedeemed: userInfo?.totalReceiptsRedeemed ?? defaultUserInfo.totalReceiptsRedeemed,
      totalReceiptsUnlocked: userInfo?.totalReceiptsUnlocked ?? defaultUserInfo.totalReceiptsUnlocked,
      prefersDarkMode: userInfo?.prefersDarkMode ?? defaultUserInfo.prefersDarkMode,
      isDemoCouponApplied: userInfo?.isDemoCouponApplied ?? defaultUserInfo.isDemoCouponApplied,
      isPayingUser: userInfo?.isPayingUser ?? defaultUserInfo.isPayingUser,
      sp_subscriptionId: userInfo?.sp_subscriptionId ?? defaultUserInfo.sp_subscriptionId,
      sp_customerId: userInfo?.sp_customerId ?? defaultUserInfo.sp_customerId
    };
  
    // Update the UserInfoStore
    UserInfoStore.update(s => {
      Object.assign(s, finalUserInfo);
    });
  
    // Push the final user info to Firestore
    await mergeUserSettingsInFirestore(finalUserInfo, userId);
  };
