import React, { useState } from 'react';
import axios from 'axios';

const BookingDetails = () => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);
  const [bookingId, setBookingId] = useState('');
  
  const getBookingDetails = async () => {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get(`http://localhost:3000/api/bookings/${bookingId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        setBookingDetails(response.data)
                  
        console.log(response.data)

    } catch (error) {
        console.error('Error booking seat', error);
        setError('Booking failed');
    }
};

  if (error) return <p>Error fetching booking details: {error.message}</p>;

  return (
    <div>
      <h2>Booking Details</h2>
      <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter the booking id"
            />

        <button onClick={getBookingDetails}>Get Booking Details</button>
      {bookingDetails ? (
        <div>
          <p><strong>Booking ID:</strong> {bookingDetails.id}</p>
          <p><strong>Train Name:</strong> {bookingDetails.train_name}</p>
          <p><strong>User Name:</strong> {bookingDetails.user_name}</p>
          <p><strong>Number of Seats:</strong> {bookingDetails.number_of_seats}</p>
        </div>
      ) : (
        <p>No booking details found.</p>
      )}
    </div>
  );
};

export default BookingDetails;




