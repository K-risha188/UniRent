import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Rentals from './pages/Rentals';
import CreateListing from './pages/CreateListing';
import ItemDetails from './pages/ItemDetails';
import Bookings from './pages/Bookings';
import Messages from './pages/Messages';
import ChatWindow from './pages/ChatWindow';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import CommunityRequests from './pages/CommunityRequests';
import Wallet from './pages/Wallet';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/rentals" element={<Rentals />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/create-listing" element={<CreateListing />} />
                        <Route path="/bookings" element={<Bookings />} />
                        <Route path="/dashboard" element={<OwnerDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/community-requests" element={<CommunityRequests />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/messages/:id" element={<ChatWindow />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/wallet" element={<Wallet />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
