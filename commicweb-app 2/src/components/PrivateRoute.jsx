// PrivateRoute.jsx
import React from 'react';
import { useAuth } from './AuthContext';
import LoginPrompt from './LoginPrompt';

const PrivateRoute = ({ component: Component, ...rest }) => {
    const { user } = useAuth();

    return user ? (
        <Component {...rest} />
    ) : (
        <LoginPrompt />
    );
};

export default PrivateRoute;
