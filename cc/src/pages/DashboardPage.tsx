import React, { Suspense, useEffect, useState } from "react";
import {
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
  IonIcon,
  IonLabel,
  IonLoading,
  IonContent,
} from "@ionic/react";
import { Redirect, Route } from "react-router-dom";

const HomeTab = React.lazy(() => import('./HomeTab'));
const AddTab = React.lazy(() => import('./AddTab'));
const SaleTab = React.lazy(() => import('./SaleTab'));
const SaleDetailPage = React.lazy(() => import('./SaleDetailPage'));
const AccountTab = React.lazy(() => import('./AccountTab'));
const ReceiptDetailPage = React.lazy(() => import('./ReceiptDetailPage'));
const EditProfilePage = React.lazy(() => import('./EditProfilePage'));

import { home, add, newspaper, person } from "ionicons/icons";
import ProtectedRoute from "../layouts/ProtectedRoutes";
import HomeTabSkeleton from "../components/HomeTabSkeleton";

const DashboardPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');

  useEffect(() => {
    const preloadModules = [
      import('./HomeTab'),
      import('./AddTab'),
      import('./SaleTab'),
      import('./SaleDetailPage'),
      import('./AccountTab'),
      import('./ReceiptDetailPage'),
      import('./EditProfilePage')
    ];
    Promise.all(preloadModules);
  }, []);

  // const getFallbackComponent = () => {
  //   switch(currentTab) {
  //     case 'home':
  //       return <HomeTabSkeleton />;
  //     case 'add':
  //       // return <AddTabSkeleton />;
  //     case 'sale':
  //       // return <SaleTabSkeleton />;
  //     case 'account':
  //       // return <AccountTabSkeleton />;
  //     default:
  //       return <IonLoading isOpen={true} message={'Please wait DASHBOARD...'} />;
  //   }
  // };

console.log("DashboardPage loaded");

  return (
    <Suspense fallback={<IonLoading isOpen={true} message={'Please wait DASHBOARD...'} />}>

    <IonPage>
      <IonTabs>
        {/* Router Outlet for Tabs */}
        <IonRouterOutlet>
          <Redirect exact from="/dashboard" to="/dashboard/home" />
          <ProtectedRoute exact path="/dashboard/home" component={HomeTab} />
          <ProtectedRoute
            exact
            path="/dashboard/home/receipts/:receiptId"
            component={ReceiptDetailPage}
          />
          <ProtectedRoute exact path="/dashboard/add" component={AddTab} />
          <ProtectedRoute exact path="/dashboard/sale" component={SaleTab} />
          <ProtectedRoute
            exact
            path="/dashboard/sale/:month"
            component={SaleDetailPage}
          />
          <ProtectedRoute
            exact
            path="/dashboard/account"
            component={AccountTab}
          />
                    <ProtectedRoute
            exact
            path="/dashboard/account/edit-profile"
            component={EditProfilePage}
          />

          <Route exact path="/dashboard">
            <Redirect to="/dashboard/home" />
          </Route>
        </IonRouterOutlet>

        {/* Tab Bar */}
        <IonTabBar slot="bottom" id="tab-bar">
          <IonTabButton tab="home" href="/dashboard/home">
            <IonIcon icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="add" href="/dashboard/add">
            <IonIcon icon={add} />
            <IonLabel>Add</IonLabel>
          </IonTabButton>
          <IonTabButton tab="sale" href="/dashboard/sale">
            <IonIcon icon={newspaper} />
            <IonLabel>Sale</IonLabel>
          </IonTabButton>
          <IonTabButton tab="account" href="/dashboard/account">
            <IonIcon icon={person} />
            <IonLabel>Account</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonPage>
    </Suspense>

  );
};

export default DashboardPage;
