import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonRoute,
  setupIonicReact,
  IonLoading,
  IonSpinner,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./layouts/ProtectedRoutes";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import {
  subToCollection,
  subToDoc,
  fetchCollectionOnce,
  fetchDocOnce,
} from "./utils/fbFirestore";
import { onAuthStateChanged } from "./utils/fbAuth"
import { User as FirebaseUser } from "firebase/auth";
import { ICouponItem } from "./utils/types";
import { AuthStore, UserInfoStore } from "./utils/store";
import { ReceiptStore } from "./utils/store";
import { CouponStore } from "./utils/store";
import { IUserInfoStore } from "./utils/store";
import { updateUserSettings } from "./utils/miscUtils";
import { list } from "firebase/storage";
import { auth } from "./utils/fbAuth";
setupIonicReact({
  mode: "ios", // 'md' for Material Design, 'ios' for iOS design
});


// Entry point for the app
const App: React.FC = () => {

  // const history = useHistory();
  //Use pullstate states
  const isAuthed = AuthStore.useState((s) => s.isAuthed);
  const [isLoading, setIsLoading] = useState(true); // Introduce a loading state
  // Local state that tracks whether the auth state has been checked for purpose of displaying loading screen before auth state is checked
  const authChecked = AuthStore.useState((s) => s.authChecked);
  const couponList = CouponStore.useState((s) => s.couponList);
  const isDemoUser = AuthStore.useState((s) => s.isDemoUser);
  const uid = AuthStore.useState((s) => s.uid);
const receiptsUpdated = AuthStore.useState((s) => s.receiptsUpdated);

  // useEffect for handling auth of user or demo user, receipts and user data fetching come later (above)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        AuthStore.update((s) => {
          s.authChecked = true;
        });
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          const isDemoUid = firebaseUser.uid === "rSGEP4KpEMaZBVkpI9Uc6ViWQG63";
          AuthStore.update((s) => {
            s.isAuthed = true;
            s.user = firebaseUser;
            s.idToken = idToken;
            s.uid = firebaseUser.uid;
            s.isDemoUser = isDemoUid;
          });

        } else {
          // Handle user sign-out
          resetStores();
        }
        setIsLoading(false);
      }
    );

    // Function to reset stores when user logs out
    const resetStores = () => {
      AuthStore.update((s) => {
        s.isAuthed = false;
        s.user = null;
        s.idToken = "";
      });
      ReceiptStore.update((s) => {
        s.receiptList = [];
      });
      CouponStore.update((s) => {
        s.couponList = [];
      });
      UserInfoStore.update((s) => {
        // Reset user info
      });
    };

    return () => {
      setIsLoading(false);
      unsubscribeAuth();
    };
  }, []);


  // useEffect for Coupon List Fetching
  useEffect(() => {
      if (!isAuthed) return;
      const yearToFetch = "2023";
      const unsubscribeFromCoupons = subToCollection(`sales/${yearToFetch}/coupons`, (couponListData) => {
        CouponStore.update((s) => {
          s.couponList = couponListData;
        });
        console.log("Coupon list updated to store");
      });

      return () => {
        if (unsubscribeFromCoupons) unsubscribeFromCoupons();
      };
    }, [isAuthed]);


    // useEffect for Receipts Data Fetching. This is done after isAuthed is true, and done differently for demo users and regular users
    useEffect(() => {
      // Only proceed if user is authenticated
      if (!isAuthed) return;
    
      let unsubscribeReceipts: (() => void) | undefined;
    
      if (isDemoUser) {
        // Fetch receipts for demo users
        subToCollection(`users/${uid}/receipts`, (receiptsData) => {
          ReceiptStore.update((s) => {
            s.receiptList = receiptsData;
          });
        });
      } else {
        // Subscribe to receipts for regular users
        unsubscribeReceipts = subToCollection(`users/${uid}/receipts`, (receiptsData) => {
          ReceiptStore.update((s) => {
            s.receiptList = receiptsData;
          });
        });
      }
      AuthStore.update((s) => {
        s.receiptsUpdated = true;
      });
    
      // Return a cleanup function
      return () => {
        if (unsubscribeReceipts) {
          unsubscribeReceipts();
        }
      };
    }, [isAuthed, isDemoUser, uid]);


    // useEffect for User Data Fetching. This is done after isAuthed is true, and done differently for demo users and regular users
    useEffect(() => {
      // Only proceed if user is authenticated
      if (!isAuthed) return;
    
      let unsubscribeUserData: (() => void) | undefined;
    
      if (isDemoUser) {
        // Fetch user data for demo users
        fetchDocOnce(`users/${uid}/info/settings`).then(userData => {
          updateUserSettings(userData, uid);
        });
         
      } else {
        // Subscribe to user data for regular users
        unsubscribeUserData = subToDoc(`users/${uid}/info/settings`, (userData) => {
          updateUserSettings(userData, uid);
        });
      }
    
      // Return a cleanup function
      return () => {
        if (unsubscribeUserData) {
          unsubscribeUserData();
        }
      };
    }, [isAuthed, isDemoUser, uid]); // Dependencies array
    

  // useEffect for Applying Coupons to demo user account
  useEffect(() => {
    if (isDemoUser && receiptsUpdated) {
      updateReceipt(0, 24, 5, couponList);
      updateReceipt(1, 10, 2, couponList);
      updateReceipt(2, 24, 0, couponList);
      updateReceipt(3, 37, 0, couponList);

      UserInfoStore.update((s) => {
        s.isDemoCouponApplied = true;
      });
    }
  }, [couponList, isDemoUser, receiptsUpdated]);

  const updateReceipt = (
    receiptIndex: any,
    daysAgo: number,
    numberOfCoupons: number = 0,
    couponList: any[]
  ) => {
    // Update the date of purchase
    const receiptDate = new Date();
    receiptDate.setDate(receiptDate.getDate() - daysAgo);
    const receiptDateString = `${
      receiptDate.getMonth() + 1
    }/${receiptDate.getDate()}/${receiptDate.getFullYear()}`;

    ReceiptStore.update((s) => {
      if (receiptIndex >= 0 && receiptIndex < s.receiptList.length) {
        s.receiptList[receiptIndex].dateOfPurchase = receiptDateString;
      }
    });

    // Update the receipt's item lines with selected coupons if there are any
    if (numberOfCoupons > 0) {
      // Filter coupons with discount less than $10 and randomly pick 'numberOfCoupons' items
      const eligibleCoupons = couponList.filter(
        (coupon) => coupon.discount < 10
      );

      const selectedCoupons: ICouponItem[] = [];
      while (
        selectedCoupons.length < numberOfCoupons &&
        eligibleCoupons.length > 0
      ) {
        const randomIndex = Math.floor(Math.random() * eligibleCoupons.length);
        selectedCoupons.push(...eligibleCoupons.splice(randomIndex, 1));
      }

      //     // Update the receipt's item lines with selected coupons
      ReceiptStore.update((s) => {
        if (receiptIndex >= 0 && receiptIndex < s.receiptList.length) {
          const receipt = s.receiptList[receiptIndex];

          selectedCoupons.forEach((coupon, index: number) => {
            if (receipt.itemLines && receipt.itemLines.length > index) {
              const itemLine = receipt.itemLines[index];

              // Update item number and coupon amount
              itemLine.itemNumber = String(coupon.itemNumber);
              itemLine.couponAmt = String(coupon.discount);
            }
          });
        }
      });
    }
  };

  // Return early if auth state has not been checked
  if (!authChecked) {
    return (
      <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard/account"></IonBackButton>
          </IonButtons>
          <IonTitle></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen color="light">
      <IonLoading isOpen={true} message={"Loading..."} />
        </IonContent>
        </IonPage>    
);
  }

  console.log("App is rendering. User isAuthed:", isAuthed);
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Private routes */}
          <ProtectedRoute
            path="/dashboard"
            component={DashboardPage}
            exact={true}
          />
          {/* Child routes are taken care of inside of the DashboardPage component */}

          {/* Public routes */}
          <Route path="/auth" component={AuthPage} exact={true} />
          <Redirect
            from="/"
            to={isAuthed ? "/dashboard/home" : "/auth"}
            exact={true}
          />
          {/* This route catches all typed in urls that are not defined above and redirects to the auth page. */}
          <Route
            component={() => (isAuthed ? <DashboardPage /> : <AuthPage />)}
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
