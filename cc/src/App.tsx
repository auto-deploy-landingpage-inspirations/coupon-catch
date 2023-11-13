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
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import { UserStore } from './utils/store';
import ProtectedRoute from './layouts/ProtectedRoutes';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { useHistory } from 'react-router-dom';
import { fetchReceiptsData, auth, onAuthStateChanged } from './utils/firebaseConfig';

setupIonicReact();


// Entry point for the app
const App: React.FC = () => {
  const history = useHistory();
    //Use pullstate states
    const isAuthed = UserStore.useState(s => s.isAuthed);
    const user = UserStore.useState(s => s.user);
    const uid = UserStore.useState(s => s.uid);
    const authChecked = UserStore.useState(s => s.authChecked);


    // Using useEffect hook to set up authentication state listener
    useEffect(() => {
      let unsubscribeFromReceipts: () => void;

      const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
        UserStore.update(s => {
          s.isAuthed = !!firebaseUser;
          s.user = firebaseUser;
          s.uid = firebaseUser?.uid || null;
          s.authChecked = true;
        });
  
        if (firebaseUser) {
          unsubscribeFromReceipts = fetchReceiptsData(firebaseUser.uid, (receiptsData) => {
            UserStore.update(s => {
              s.receipts = receiptsData;
            });
          });
        } else if (unsubscribeFromReceipts) {
          unsubscribeFromReceipts();
        }
      });
  
      return () => {
        unsubscribeAuth();
        if (unsubscribeFromReceipts) unsubscribeFromReceipts();
      };
    }, []);

        // Construct the path to the user's receipts collection
        const collectionPath = `receipts/${uid}/extractedText`;

    // Show a loading spinner or a splash screen while waiting for auth state to be confirmed
    if (!authChecked) {
      return <IonLoading isOpen={true} message={'Loading...'} spinner="lines-sharp" />;
    }
 
    console.log("After useEffect", isAuthed, uid, user);

  return (
    <IonApp>
      <IonReactRouter>
      <IonRouterOutlet>
            {/* Private routes */}
            <ProtectedRoute path="/dashboard" component={DashboardPage} exact={true} />
            {/* Child routes are taken care of inside of the DashboardPage component */}

             {/* Public routes */}
            <Route path="/auth" component={AuthPage} exact={true} />
            <Redirect from="/" to={isAuthed ? "/dashboard" : "/auth"} exact={true} />
            {/* This route catches all typed in urls that are not defined above and redirects to the auth page. */}
            <Route component={() => (isAuthed ? <DashboardPage /> : <AuthPage />)} />
          </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
