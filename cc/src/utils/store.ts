import { Store } from "pullstate";
import { ICouponList, IReceiptItem } from "../utils/types";

export interface IDarkModeStore {
  darkMode: boolean;
}

export const DarkModeStore = new Store<IDarkModeStore>({
  darkMode: false,
});

export interface IAuthStore {
  couponsChecked: boolean,
  isAuthed: boolean;
  authChecked: boolean;
  user: any;
  idToken: string | null;
  isDemoUser: boolean;
  uid: string;
}

export const AuthStore = new Store<IAuthStore>({
    couponsChecked: false,
    isAuthed: false,
    authChecked: false,
    user: null,
    idToken: null,
    isDemoUser: false,
    uid: "",
});

interface IReceiptStore {
  receiptList: IReceiptItem[];
  isCalculated: boolean;
  isSorted: boolean;
}

export const ReceiptStore = new Store<IReceiptStore>({
  receiptList: [],
  isCalculated: false,
  isSorted: false,
});

interface ICouponStore {
  couponList: typeof ICouponList;
  isLoaded: boolean;
}

export const CouponStore = new Store<ICouponStore>({
  couponList: [],
  isLoaded: false,
});

export interface IUserInfoStore {
  name: string;
  email: string;
  isDemoCouponApplied: boolean;
  isPayingUser: boolean;
  sp_subscriptionId: string;
  sp_customerId: string;
  
}

export const UserInfoStore = new Store<IUserInfoStore>({
  name: "",
  email: "",
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

