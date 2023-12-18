import { differenceInDays } from 'date-fns';
import { AuthStore, IUserInfoStore, UserInfoStore } from './store';
import { ICouponItem } from './types';
import { IReceiptItem } from './types';
// import { mergeUserSettingsInFirestore } from './fbFirestore';

 // Use your interface here


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
    // await mergeUserSettingsInFirestore(finalUserInfo, userId);
  };
