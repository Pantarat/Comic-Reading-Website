// LoginPrompt.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LoginPrompt = () => {
    return (
        <div>
            <h2>Please log in to access this page</h2>
            <p>You can <Link to="/signin">sign in here</Link>.</p>
        </div>
    );
};

export default LoginPrompt;
