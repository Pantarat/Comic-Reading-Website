// LoginPrompt.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminAccess = () => {
    return (
        <div>
            <h2>Warning! You do not have permission to enter this page.</h2>
            <p>You can sign in as admin to access this page <Link to="/signin">here</Link>.</p>
        </div>
    );
};

export default AdminAccess;