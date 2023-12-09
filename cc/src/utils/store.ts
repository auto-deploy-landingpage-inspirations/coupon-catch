import { Store } from "pullstate";

export interface IAuthStore {
  receiptsUpdated: boolean,
  couponsChecked: boolean,
  isAuthed: boolean;
  authChecked: boolean;
  user: any;
  idToken: string | null;
  isDemoUser: boolean;
  uid: string;
}

export const AuthStore = new Store<IAuthStore>({
    receiptsUpdated: false,
    couponsChecked: false,
    isAuthed: false,
    authChecked: false,
    user: null,
    idToken: null,
    isDemoUser: false,
    uid: "",
});

interface IReceiptStore {
  receiptList: any[];
}

export const ReceiptStore = new Store<IReceiptStore>({
  receiptList: [],
});

interface ICouponStore {
  couponList: any[];
}

export const CouponStore = new Store<ICouponStore>({
  couponList: [],
});

export interface IUserInfoStore {
  name: string;
  email: string;
  totalRedeemedAmount: number;
  totalUnlockedAmount: number;
  totalReceiptsRedeemed: number;
  totalReceiptsUnlocked: number;
  prefersDarkMode: boolean;
  isDemoCouponApplied: boolean;
  isPayingUser: boolean;
  sp_subscriptionId: string;
  sp_customerId: string;
}

export const UserInfoStore = new Store<IUserInfoStore>({
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
  sp_customerId: "",
});

interface IUploadInfo {
  showProgressBar: boolean;
  showSuccessToast: boolean;
  isInitialLoad: boolean;
}

export const UploadInfoStore = new Store<IUploadInfo>({
  showProgressBar: false,
  showSuccessToast: false,
  isInitialLoad: true,
});

interface ILoginOrSignup {
  isLogin: boolean;
}

export const LoginOrSignupStore = new Store<ILoginOrSignup>({
  isLogin: true,
});

// EXAMPLE OF SELECTOR
// Using Selectors
// Selectors are functions that take the entire store state and return a part of it. They are used for selecting slices of your state for use in your components. This way, your component only re-renders when the specific piece of state it’s subscribed to changes.

// Here's an example of a selector:
// const selectIsAuthenticated = state => state.isAuthenticated;

//  Using Selectors in Components
// When you want to use a piece of state in a component, you can use the useStoreState hook along with the selector:

// import React from 'react';
// import { useStoreState } from 'pullstate';

// const MyComponent = () => {
//   const isAuthenticated = useStoreState(AuthStore, selectIsAuthenticated);

//   return (
//     <div>
//       {isAuthenticated ? 'User is authenticated' : 'User is not authenticated'}
//     </div>
//   );
// };

