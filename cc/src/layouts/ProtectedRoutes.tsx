// Define a new Functional Component called ProtectedRoute.
// This component accepts several props:
// - component: The component to render if the user is authenticated.
// - isAuthed: A boolean or null value representing whether the user is authenticated.
// - path: The URL path associated with this route.
// - exact: A boolean representing whether the path should be exactly matched.

import { Redirect, Route } from 'react-router-dom';
import { UserStore } from "../utils/store";
import { IonLoading } from '@ionic/react';

const ProtectedRoute: React.FC<{
  component: React.ElementType; // React.ElementType represents a component (either class or functional) that can be rendered.
  path: string;
  exact: boolean;
}> = ({ component: Component, ...rest }) => {
  // Use the useState method of pullstate to get the isAuthed value from UserStore
  const isAuthed = UserStore.useState(s => s.isAuthed);
  const authChecked = UserStore.useState(s => s.authChecked);
  
  return (
<Route
      {...rest}
      render={(props) => {
        if (!authChecked) {
          return <IonLoading />;
        }
        return isAuthed ? <Component {...props} /> : <Redirect to="/auth" />;
      }}
    />
  );
};

export default ProtectedRoute;
  