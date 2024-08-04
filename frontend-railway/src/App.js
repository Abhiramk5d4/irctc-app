import { BrowserRouter, Route, Routes,Navigate } from "react-router-dom";
import React from 'react';
import Login from './components/Login';
import GetSeatAvailability from "./components/GetSeatAvailability";
import AddTrain from "./components/AddTrain";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/ticketBooking" element={<GetSeatAvailability />} />
        <Route path="/addTrain" element={<AddTrain />} />
        <Route path="*" element={<Navigate to="/login" />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;