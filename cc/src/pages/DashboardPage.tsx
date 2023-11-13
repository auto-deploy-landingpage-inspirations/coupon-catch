import React from 'react';
import { IonPage, IonTabs, IonTabBar, IonTabButton, IonRouterOutlet, IonIcon, IonLabel } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import HomeTab from './HomeTab';
import AddTab from './AddTab';
import SaleTab from './SaleTab';
import SaleDetailPage from './SaleDetailPage';
import AccountTab from './AccountTab';
import ReceiptDetailPage from './ReceiptDetailPage';
import { home, add, newspaper, person } from 'ionicons/icons';
import ProtectedRoute from '../layouts/ProtectedRoutes';

const DashboardPage: React.FC = () => {
  
  return (
    <IonPage>
      <IonTabs>
        {/* Router Outlet for Tabs */}
        {/* This key={window.location.pathname} in the IonRouterOutlet below is a workaround for likely faulty structural or logical error in Ionic React Router */}
        <IonRouterOutlet>
          <Redirect exact from="/dashboard" to="/dashboard/home" />
          <ProtectedRoute exact path="/dashboard/home" component={HomeTab} />
            <ProtectedRoute exact path="/dashboard/home/receipts/:receiptId" component={ReceiptDetailPage} />
          <ProtectedRoute exact path="/dashboard/add" component={AddTab} />
          <ProtectedRoute exact path="/dashboard/sale" component={SaleTab} />
            <ProtectedRoute exact path="/dashboard/sale/:month" component={SaleDetailPage} />
          <ProtectedRoute exact path="/dashboard/account" component={AccountTab} />
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
  );
};

export default DashboardPage;
