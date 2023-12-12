// SignIn.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignIn.css';
import { useAuth } from '../components/AuthContext';

const SignIn = (props) => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

    const handleRegister = () => {
        navigate('/register');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:${backendPort}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username, // Assuming email is used as the username
                    password: password,
                }),
            });

            if (!response.ok) {
                throw new Error('Login failed'); // You can handle different HTTP status codes here
            }

            const data = await response.json();
            // Handle the response from the server
            if (data.error) {
                setMessage(data.error)
            }
            else if (data.message) {
                setMessage(data.message);
            }
            else {
                try {
                    const response = await fetch(`http://localhost:${backendPort}/admin/checkAdmin`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId: data.User_ID
                        }),
                    });
                    const data2 = await response.json();
                    console.log('Signed in successful user:', username);
                    login({...data, isAdmin: data2.isAdmin});
                    navigate('/search');
                } catch (error) {
                    console.error('Error checking admin status:', error);
                }

            }

            // You might want to redirect the user or perform other actions based on the response
        } catch (error) {
            console.error('Error submitting login:', error);
            // Handle errors, such as displaying an error message to the user
        }
    };

    // useEffect(() => {
    //     logout();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])

    return (
        <div className="sign-in-container">
            <form onSubmit={handleSubmit}>
                <h2>Sign In</h2>
                <div className="input-field">
                    <label htmlFor="email">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="input-field">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <label>{message}</label>
                <div className="sign-in-buttons">
                    <button type="submit">Sign In</button>
                    <button onClick={handleRegister}>Register</button>
                </div>
            </form>
        </div>
    );
};

export default SignIn;
