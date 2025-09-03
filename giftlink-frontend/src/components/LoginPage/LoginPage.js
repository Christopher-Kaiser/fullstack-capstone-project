import React, { useState, useEffect } from 'react';
import {urlConfig} from '../../config';
import { useAppContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import './LoginPage.css';

function LoginPage() {
    
    // Create useState hook variables for email, password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // State for incorrect password
    const [incorrect, setIncorrect] = useState('');

    // Local variable for `navigate`,`bearerToken` and `setIsLoggedIn`
    const navigate = useNavigate();
    const bearerToken = sessionStorage.getItem('bearer-token');
    const { setIsLoggedIn } = useAppContext();

    // If the bearerToken has a value (user already logged in), navigate to MainPage
    useEffect(() => {
        if (sessionStorage.getItem('auth-token')) {
            navigate('/app')
        }
    }, [navigate]);

    // Create handleLogin function and include console.log
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // Implement API call
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': bearerToken ? `Bearer ${bearerToken}` : '', // Include Bearer token if available
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                })
            })
            // Access data coming from fetch API
            const json = await response.json();
            console.log('json data', json);
            console.log('er', json.error);

            // Set user details
            if (json.authtoken) {
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', json.userName);
                sessionStorage.setItem('email', json.userEmail);

                // Set the user's state to log in using the `useAppContext`
                setIsLoggedIn(true);

                // Navigate to the MainPage after logging in
                navigate('/app');
            } else {
                // Clear input and set an error message if the password is incorrect
                document.getElementById("email").value="";
                document.getElementById("password").value="";
                setIncorrect("Wrong password. Try again.");
                // Clear out error message after 2 seconds
                setTimeout(() => {
                    setIncorrect("");
                }, 2000);
            }
        } catch (e) {
            console.log("Error fetching details: " + e.message);
        }
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="login-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Login</h2>

                        {/* Create input elements for the variables email and  password */}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="text"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => {setEmail(e.target.value); setIncorrect("")}}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {setPassword(e.target.value); setIncorrect("")}}
                            />
                            {/* Display an error message to the user */}
                            <span style={{color:'red',height:'.5cm',display:'block',fontStyle:'italic',fontSize:'12px'}}>{incorrect}</span>
                        </div>

                        {/* Create a button that performs the `handleLogin` function on click */}
                        <button className="btn btn-primary mb-3" onClick={handleLogin}>Login</button>

                        <p className="mt-4 text-center">
                            New here? <a href="/app/register" className="text-primary">Register Here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;