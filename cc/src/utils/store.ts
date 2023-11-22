import { Store } from "pullstate";

interface IAuthStore {
  authChecked: boolean, 
  isAuthed: boolean;
  receipts: any[];
  user: any;
  uid: string;
  idToken: string | null;
}

export const UserStore = new Store<IAuthStore>({
    authChecked: false,
    isAuthed: false,
    receipts: [],
    user: null,
    uid: '',
    idToken: null,
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

// interface IToastNotification {
//   showToast: boolean;
//   toastMessage: string;
//   duration: number;
// }

// export const ToastNotificationStore = new Store<IToastNotification>({
//   showToast: false,
//   toastMessage: '',
//   duration: 3000
// });