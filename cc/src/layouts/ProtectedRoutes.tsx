// Define a new Functional Component called ProtectedRoute.
// This component accepts several props:
// - component: The component to render if the user is authenticated.
// - isAuthed: A boolean or null value representing whether the user is authenticated.
// - path: The URL path associated with this route.
// - exact: A boolean representing whether the path should be exactly matched.

import { Redirect, Route } from 'react-router-dom';
import { AuthStore } from "../utils/store";
import { IonLoading } from '@ionic/react';
import LoadingPage from '../components/LoadingPage';

const ProtectedRoute: React.FC<{
  component: React.ElementType;
  path: string;
  exact: boolean;
}> = ({ component: Component, ...rest }) => {
  const isAuthed = AuthStore.useState(s => s.isAuthed);
  const authChecked = AuthStore.useState(s => s.authChecked);

    // Early return for loading state
  if (!authChecked) {
      return <LoadingPage />;
    }

  // Early return for the authenticated route
  if (isAuthed) {
    return <Route {...rest} render={(props) => <Component {...props} />} />;
  }

  // Redirect if not authenticated
  return <Redirect to="/auth" />;
};

export default ProtectedRoute;
  