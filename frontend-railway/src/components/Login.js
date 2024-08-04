
import React, { useState } from 'react';
import Register from "./Register"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index.css'
import AdminLogin from './AdminLogin';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');
    const [username, setUserName] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/login', {
                email,
                username,
                password
            });
            localStorage.setItem('jwtToken', response.data.token);
            setToken(response.data.token);
            setMessage(response.data.message);
            navigate('/ticketBooking');
            
        } catch (error) {
            setMessage(error.response ? error.response.data.message : 'An error occurred');
        }
    };

    return (
        <div className='tickets-view'>
            <div><h2>Passenger Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>User Name:</label>
                    <input type="text" value={username} onChange={(e) => setUserName(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
            {token && <p>Token: {token}</p>}</div>
            
            <div><Register /></div>
            <div><AdminLogin /></div>
        </div>
        
    );
};

export default Login;