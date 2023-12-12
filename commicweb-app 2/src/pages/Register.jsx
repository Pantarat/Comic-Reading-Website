import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        displayName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState('');

    const {
        displayName,
        username,
        email,
        password,
        confirmPassword
    } = formData;

    const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;
    const navigate = useNavigate();

    const onChange = (e) => {
        const updatedFormData = { ...formData, [e.target.name]: e.target.value };
        setFormData(updatedFormData);
    }

    const onSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match');
        } else {
            try {
                const response = await fetch(`http://localhost:${backendPort}/user/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        display_name: displayName,
                        username: username,
                        email: email,
                        password: password,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Registration failed');
                }

                const data = await response.json();
                // Handle the response from the server
                if (data.error) {
                    if (data.error.includes('ER_DUP_ENTRY')) {
                        setMessage('Username or email is already taken. Please choose a different one.');
                    } else if (data.error.startsWith('Database error')) {
                        // Handle other database-related errors
                        console.error('Database error:', data.error);
                        setMessage('Registration failed due to a database error.');
                    } else {
                        // Handle other errors
                        setMessage(data.error);
                    }
                }
                else {
                    console.log("Registered successful.")
                    navigate('/signin');
                }

                // Optionally, you can redirect the user or perform other actions based on the response
            } catch (error) {
                console.error('Error during registration:', error);
                // Handle errors, such as displaying an error message to the user
            }
        }
    };


    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6 mx-auto">
                    <div className="card bg-white text-dark">
                        <div className="card-body">
                            <h1 className="text-center">Register</h1>
                            <form onSubmit={(e) => onSubmit(e)}>
                                <div className="form-group">
                                    <label>Display Name</label>
                                    <input type="text" name="displayName" value={displayName} onChange={(e) => onChange(e)} required className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" name="username" value={username} onChange={(e) => onChange(e)} required className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={email} onChange={(e) => onChange(e)} required className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" name="password" value={password} onChange={(e) => onChange(e)} required className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => onChange(e)} required className="form-control" />
                                </div>
                                <label>{message}</label>
                                <button type="submit" className="btn btn-primary btn-block">Register</button>
                            </form>
                            <p className="lead mt-4">Have an account? <Link to="/signin">Login</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
