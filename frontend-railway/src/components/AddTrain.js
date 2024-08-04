import React, { useState } from 'react';
import axios from 'axios';
import './index.css'
import { useNavigate } from 'react-router-dom';
const AddTrain = () => {
    const [name, setName] = useState('');
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [message, setMessage] = useState('');
    const [noOfSeats, setNoOfSeats] = useState(100);
    const [availableSeats , setAvailbleSeats] = useState(100);
    const navigate = useNavigate();

    const handleAddTrain = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwtAdminToken');

        try {
            const response = await axios.post('http://localhost:3000/api/trains', {
                name,
                source,
                destination,
                noOfSeats,
                availableSeats,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage(response.data);
        } catch (error) {
            setMessage(error.response ? error.response.data : 'An error occurred');
        }
    };

    const logoutAdmin = () => {
        navigate('/login');
        localStorage.removeItem('jwtAdminToken');

    }

    return (
        <div className='text-center'>
            <h2>Add New Train</h2>
            <form onSubmit={handleAddTrain} className='form-container'>
                <div>
                    <label>Train Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Source:</label>
                    <input type="text" value={source} onChange={(e) => setSource(e.target.value)} required />
                </div>
                <div>
                    <label>Destination:</label>
                    <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                </div>
                <div>
                    <label>Set No Of Seats:</label>
                    <input type="text" value={noOfSeats} onChange={(e) => setNoOfSeats(e.target.value)} required />
                </div>
                <div>
                    <label>Set Available Seats:</label>
                    <input type="text" value={availableSeats} onChange={(e) => setAvailbleSeats(e.target.value)} required />
                </div>
                <button type="submit">Add Train</button>
                
            </form>
            <button typr="button" onClick={logoutAdmin}>Logout</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddTrain;