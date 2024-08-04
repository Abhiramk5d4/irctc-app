import React, { useState } from 'react';
import axios from 'axios';

const BookSeat = () => {
    const [trainId, setTrainId] = useState('');
    const [seatNumber, setSeatNumber] = useState('');
    const [message, setMessage] = useState('');

    const handleBookSeat = async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.post('http://localhost:3000/api/trains/book', 
            {
                trainId,
                seatNumber
            }, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setMessage(`Booking successful 
                        Your Booking Id : ${response.data.bookingId}`);
        } catch (error) {
            console.error('Error booking seat', error);
            setMessage('Booking failed');
        }
    };

    return (
        <div>
            <h1>Book a Seat</h1>
            <input
                type="text"
                value={trainId}
                onChange={(e) => setTrainId(e.target.value)}
                placeholder="Train ID"
            />
            <input
                type="text"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                placeholder="Enter No.Of Seats"
            />
            <button onClick={handleBookSeat}>Book Seats</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default BookSeat;