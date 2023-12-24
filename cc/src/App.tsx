import { app } from './utils/fbInit';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonLoading,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonPage,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./layouts/ProtectedRoutes";

/* Core CSS required for Ionic co1mponents to work properly */
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
  fetchReceiptsOnce,
  fetchItemLinesOnce,
  subToReceipts,
  subToItemLines,
} from "./utils/fbFirestore";
import { onAuthStateChanged } from "./utils/fbAuth"
import { User as FirebaseUser } from "firebase/auth";
import { ICouponItem, IReceiptItem } from "./utils/types";
import { AuthStore, UserInfoStore } from "./utils/store";
import { ReceiptStore } from "./utils/store";
import { CouponStore } from "./utils/store";
import { updateUserSettings } from "./utils/miscUtils";
import { getAuth } from "./utils/fbAuth";
import { listeners } from "process";
import { differenceInDays, addDays, parse } from 'date-fns';
// import { DarkModeStore } from "./utils/store";
import { ICouponList } from "./utils/types";

const auth = getAuth();

setupIonicReact({
  mode: "ios", // 'md' for Material Design, 'ios' for iOS design
});


// Entry point for the app
const App: React.FC = () => {
  const isAuthed = AuthStore.useState((s) => s.isAuthed);
  // Local state that tracks whether the auth state has been checked for purpose of displaying loading screen before auth state is checked
  const authChecked = AuthStore.useState((s) => s.authChecked);
  const couponList = CouponStore.useState((s) => s.couponList);
  const isDemoUser = AuthStore.useState((s) => s.isDemoUser);
  const uid = AuthStore.useState((s) => s.uid);
const receiptList = ReceiptStore.useState((s) => s.receiptList);
const isCouponLoaded = CouponStore.useState((s) => s.isLoaded);
const isReceiptsLoaded = ReceiptStore.useState((s) => s.isLoaded);
const [isDemoCouponsApplied, setIsDemoCouponsApplied] = useState(false);

// // useEffect for dark mode handling
// useEffect(() => {
//   // Create a MediaQueryList object
//   const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

//   // Function to update dark mode state
//   const updateDarkMode = (e: MediaQueryListEvent) => {
//     const prefersDarkMode = e.matches;
//     DarkModeStore.update((s) => {
//       s.darkMode = prefersDarkMode;
//     });
//     document.body.classList.toggle("dark", prefersDarkMode);
//   };

//   // Set initial dark mode state
//   updateDarkMode({ matches: darkModeMediaQuery.matches } as MediaQueryListEvent);

//   // Add listener to update dark mode state when the system's color scheme changes
//   darkModeMediaQuery.addEventListener('change', updateDarkMode);

//   // Clean up listener on unmount
//   return () => {
//     darkModeMediaQuery.removeEventListener('change', updateDarkMode);
//   };
// }, []); // Run the effect only once when the component mounts

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
    
  // useEffect for handling Auth via Firebase live listener
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
      }
    );

    return () => {
      unsubscribeAuth();
    };
  }, []);


  // useEffect for Coupon List Fetching
  useEffect(() => {
      if (!isAuthed) return;
      const yearToFetch = "2024";
      const unsubscribeFromCoupons = subToCollection(`sales/${yearToFetch}/coupons`, (couponListData) => {
        CouponStore.update((s) => {
          s.couponList = couponListData;
          s.isLoaded = true;
        });
        console.log("Coupon list updated to store");
      });

      return () => {
        if (unsubscribeFromCoupons) unsubscribeFromCoupons();
      };
    }, [isAuthed]);

  // useEffect for Receipts Fetching. This is done after isAuthed is true, and done differently for demo users and regular users
  useEffect(() => {
    if (!isAuthed) return;

    let unsubscribeReceipts: (() => void) | undefined;
    let unsubscribeItemLines: (() => void) | undefined;

    const updateReceipts = async () => {
      let receipts: IReceiptItem[] | undefined;
      if (isDemoUser) {
        receipts = await fetchReceiptsOnce(uid);
        for (let receipt of receipts) {
          const itemLines = await fetchItemLinesOnce(uid, [receipt.id]);
          receipt.itemLines = itemLines;
        }
      } else {
        // user is not demo user
        unsubscribeReceipts = subToReceipts(uid, (data) => {
          receipts = data;
          const receiptIds = receipts.map(receipt => receipt.id);
          unsubscribeItemLines = subToItemLines(uid, receiptIds, (itemLines) => {
            if (!receipts) return;
            for (let receipt of receipts) {
              receipt.itemLines = itemLines.filter(itemLine => itemLine.receiptId === receipt.id);
            }
          });
        });
      }

      if(receipts == undefined) return;

      // calculateReceiptFields(receipts);


      ReceiptStore.update((s) => {
        if (receipts) {
          s.receiptList = receipts;
          s.isLoaded = true;
        }
      });
    };

    updateReceipts();


    return () => {
      if (unsubscribeReceipts) {
        unsubscribeReceipts();
      }
      if (unsubscribeItemLines) {
        unsubscribeItemLines();
      }
    };
  }, [isAuthed, isDemoUser, uid]); // Add isCouponListLoading to the dependency array

  // useEffect for altering demo receipts before fields are calculated
  useEffect(() => {
    console.log("useEffect for Applying Coupons to demo user account, checking if isDemoUser, isReceiptsLoaded and isCouponLoaded")
    if (isDemoUser && isReceiptsLoaded && isCouponLoaded) {
      // index of coupon to edit, days ago to set date of purchase, number of coupons to apply
      updateReceipt(0, 24, 5, couponList);
      updateReceipt(1, 10, 2, couponList);
      updateReceipt(2, 24, 0, couponList);
      updateReceipt(3, 0, 0, couponList);

      setIsDemoCouponsApplied(true);
    }
  }, [isReceiptsLoaded, isDemoUser, isCouponLoaded]);

  // CalulateReceiptFeilds will fill in the daysLeft, unlockCouponTotal, and availCouponAmount fields on the returned receipts
  // Define the function to perform calculations
  const calculateReceiptFields = (receipts: IReceiptItem[]) => {
    const currentDate = new Date();
    const couponEndDate = parse(couponList[0].couponEndDate, 'MM/dd/yyyy', currentDate);
    if (!couponEndDate) {
      console.error('Failed to parse couponEndDate:', couponList[0].couponEndDate);
      return;
    }

    let daysToCouponEnd = differenceInDays(couponEndDate, currentDate);

    receipts.forEach(receipt => {
      const dateOfPurchase = parse(receipt.dateOfPurchase, 'MM/dd/yyyy', currentDate);
      const date30DaysFromPurchase = addDays(dateOfPurchase, 30);
      let daysFromDoP = differenceInDays(date30DaysFromPurchase, currentDate);

      const couponLookup = Object.fromEntries(couponList.map(coupon => [coupon.itemNumber, coupon]));

      receipt.itemLines.forEach(itemLine => {
        const coupon = couponLookup[itemLine.itemNumber];
        if (coupon) {
          if (typeof coupon.discount === 'number') {
            // Update availCouponAmount in the Pullstate store
            ReceiptStore.update(s => {
              const receiptIndex = s.receiptList.findIndex(storeReceipt => storeReceipt.id === receipt.id);
              if (receiptIndex !== -1) {
                const itemLineIndex = s.receiptList[receiptIndex].itemLines.findIndex(storeItemLine => storeItemLine.id === itemLine.id);
                if (itemLineIndex !== -1) {
                  s.receiptList[receiptIndex].itemLines[itemLineIndex].availCouponAmount += coupon.discount;
                }
              }
            });
          } else {
            console.error(`Invalid discount for itemNumber ${itemLine.itemNumber}: ${coupon.discount}`);
          }
        } else {
          // console.warn(`No coupon found for itemNumber ${itemLine.itemNumber}`);
        }
      });

      // Calculate unlockCouponTotal and daysLeft after updating availCouponAmount
      ReceiptStore.update(s => {
        const index = s.receiptList.findIndex(storeReceipt => storeReceipt.id === receipt.id);
        if (index !== -1) {
          const unlockCouponTotal = s.receiptList[index].itemLines.reduce((total, itemLine) => total + Number(itemLine.availCouponAmount), 0);
          const daysLeft = Math.max(0, Math.min(daysFromDoP, daysToCouponEnd));

          s.receiptList[index].unlockCouponTotal = unlockCouponTotal;
          s.receiptList[index].daysLeft = daysLeft;
        }
      });
    });
  };


  // useEffect for calculating receipt fields
  useEffect(() => {
    console.log("useEffect for calculating receipt fields, checking if isReceiptsLoaded and isCouponLoaded")
    if (isDemoUser) {
      if (isReceiptsLoaded && isCouponLoaded && isDemoCouponsApplied) {
        calculateReceiptFields(receiptList);
      }
    } else {
      if (isReceiptsLoaded && isCouponLoaded) {
        calculateReceiptFields(receiptList);
      }
    }
  }, [isReceiptsLoaded, isCouponLoaded, isDemoUser, isDemoCouponsApplied]);




    // useEffect for User Data Fetching. This is done after isAuthed is true, and done differently for demo users and regular users
    useEffect(() => {
      // Only proceed if user is authenticated
      if (!isAuthed) return;
    
      let unsubscribeUserData: (() => void) | undefined;
    
      if (isDemoUser) {
        // Fetch user data for demo users
        fetchDocOnce(`users/${uid}`).then(userData => {
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
    



  const updateReceipt = (
    receiptIndex: any,
    daysAgo: number,
    numberOfCoupons: number = 0,
    couponList: typeof ICouponList
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
    // if (numberOfCoupons > 0) then we need to identify the coupons that are less than $10 and pick the first five items
      // if (numberOfCoupons > 0) {

      //   // Make the array of the first five coupons that are less than $10, push the coupons to the array
      //   const eligibleCoupons: ICouponItem[] = [];
      //   couponList.forEach((coupon, index: number) => {
      //     if (coupon.discount < 10 && eligibleCoupons.length < 5) {
      //       eligibleCoupons.push(coupon);
      //     }
      //   });

      //   // Apply the coupons to the receipt's line items. This is done by picking the first "numberOfCoupons" items from the receipt's line items, and changing the item number and availCouponAmount to the selected coupon's item number and discount amount.
      //   ReceiptStore.update((s) => {
      //     if (receiptIndex >= 0 && receiptIndex < s.receiptList.length) {
      //       const receipt = s.receiptList[receiptIndex];
      
      //       eligibleCoupons.forEach((coupon, index: number) => {
      //         if (receipt.itemLines && receipt.itemLines.length > index) {
      //           const itemLine = receipt.itemLines[index];
      
      //           // Update item number and coupon amount
      //           itemLine.itemNumber = Number(coupon.itemNumber);
      //           itemLine.availCouponAmount = Number(coupon.discount);
      
      //           // Check if the item line was updated
      //           console.log(`Updated item line ${index}:`, itemLine);
      //         }
      //       });
      //     }
      //   });

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

console.log("here is receipts list", receiptList);
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
