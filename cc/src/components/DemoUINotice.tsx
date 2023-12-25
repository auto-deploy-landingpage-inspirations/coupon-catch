// DemoAccountNotice.tsx
import React, { CSSProperties, useEffect, useState } from 'react';
import { IonFab, IonFabButton, IonIcon, IonModal, IonButton, IonContent } from '@ionic/react';
import { informationCircle } from 'ionicons/icons';

const DemoAccountNotice: React.FC<{ uid: string }> = ({ uid }) => {
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    if (showDemoModal) {
      // Save the current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Restore the original position and scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Clean up function
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    };
  }, [showDemoModal]);

  const blockStyle: CSSProperties = {
    padding: '20px', 
    overflowY: 'auto', 
    height: '100%',
    WebkitOverflowScrolling: 'touch' 
  };
  
  const ionFabStyle: CSSProperties = {
    margin: '0 0 -16px 0',
    position: 'fixed',
  };
  
  const floatingTextStyle: CSSProperties = {
    position: 'fixed',
    fontSize: '16px',
    color: 'var(--ion-color-danger)',
    fontWeight: 'bold',
    fontFamily: '"Arial Narrow", "Arial", sans-serif',
    bottom: '18px',
    left: '0',
    width: '100%',
    textAlign: 'center',
    padding: '10px',
    boxSizing: 'border-box',
    margin: '0 0 -16px -24px'
  };

  return (
    <>
      {uid === 'rSGEP4KpEMaZBVkpI9Uc6ViWQG63' && (
        <>
          {/* IonFab to trigger the modal */}
          <IonFab style={ionFabStyle} vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton color="danger" size="small" onClick={() => setShowDemoModal(true)}>
              <IonIcon icon={informationCircle} />
            </IonFabButton>
          </IonFab>

          {/* Floating Text Container */}
          <div style={floatingTextStyle}>
            DEMO ACCT-RERESH CLEARS CHANGES
          </div>

          {/* IonModal */}
          <IonModal
            isOpen={showDemoModal}
            onDidDismiss={() => setShowDemoModal(false)}
            initialBreakpoint={.2} breakpoints={[0, .2, .5, 1]}
          >
  <IonContent style={blockStyle}>
                <p>Thank you for checking out the demo account. Changes made here will not be saved through a refresh- changes are only displayed locally.</p>
                <br />
                <p>On non-demo, regular user accounts, this warning is not displayed and users have full access to persistent Firebase CRUD operations.</p>
                <br />
                <p>You may still access dark mode, add/upload a Costco receipt, delete receipts, etc, but changes will not persist through a reload.</p>
                <br />
                <p>Powered by <b>Ionic React</b> with <b>Typescript</b> throughout for a seamless, responsive design. <b>Firebase</b> ensures real-time interactions and efficient data management. </p>

                <p><b>Google Cloud's Document AI</b> elevates our <b>OCR</b> capabilities, while custom regex algorithms accessible via an API on our backend drive intelligent data processing.</p>
                
                <p>The backbone of the applications logic is a <b>custom-built algorithm</b> providing access through an <b>Express Node</b> backend API.</p> 

                <p><b>Firebase</b> was utitlized for other essential services such as <b>Auth</b>, <b>Firestore</b>  for real-time <b>NoSQL</b> database,  </p>
                
                <p>The app transcends traditional limits with <b>Capacitor's PWA</b> plugins, offering native-like features in a web app environment, optimizing user experience and functionality.</p>
              </IonContent>
            <IonButton onClick={() => setShowDemoModal(false)}>Close Modal</IonButton>
          </IonModal>
        </>
      )}
    </>
  );
};

export default DemoAccountNotice;
