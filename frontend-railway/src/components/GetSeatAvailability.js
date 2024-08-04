import React, { useState } from 'react';
import axios from 'axios';
import BookSeat from './BookSeat'
import BookingDetails from './BookingDetails'
import './index.css'


const GetSeatAvailability = () => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [availability, setAvailability] = useState(null);

    const handleCheckAvailability = async () => {
        try {
            const token = localStorage.getItem('jwtToken'); 
            const response = await axios.get(`http://localhost:3000/api/trains/availability?source=${source}&destination=${destination}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAvailability(response.data);
        } catch (error) {
            console.error('Error fetching seat availability', error);
        }
    };

    return (
        <div className='tickets-view'>
            <div>
                <h1>Check Seat Availability</h1>
                <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Source"
                />
                <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Destination"
                />
                <button onClick={handleCheckAvailability}>Check Availability</button>

                {availability && (
                    <div>
                        <h2>Available Trains</h2>
                        <ul>
                            {availability.map((each) => (
                                <li className='list-items-trains' key={each.id}>
                                    Train: {each.name} | Seats Available: {each.seatsAvailable}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div><BookSeat /></div>
            <div> <BookingDetails /></div>
        
       
        </div>
        
    );
};

export default GetSeatAvailability;