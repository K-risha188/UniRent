import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, ShoppingCart, User, MessageSquare, LogOut, Package, ShieldCheck, Bell, Megaphone, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/rentals?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    useEffect(() => {
        let interval;
        if (user) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            interval = setInterval(fetchNotifications, 30000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <nav className="bg-midnight-navy border-b border-white/10 sticky top-0 z-50 shadow-whisper">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-white flex items-center tracking-tight">
                    Uni<span className="text-academy-gold">Rent</span><span className="text-academy-gold text-3xl font-extrabold ml-0.5">.</span>
                </Link>

                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search student rentals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-4 pr-10 text-white placeholder-white/50 focus:bg-white/20 focus:outline-none transition-all"
                        />
                        <button type="submit" className="absolute right-3 top-2.5 text-white/50 hover:text-academy-gold transition">
                            <Search size={18} />
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-6 text-white/80 font-medium">
                    <Link to="/rentals" className="hover:text-academy-gold transition">Browse</Link>
                    <Link to="/community-requests" className="hover:text-academy-gold transition flex items-center gap-1 group">
                        <Megaphone size={16} className="text-academy-gold/80 group-hover:text-academy-gold transition" />
                        <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-widest mt-0.5">Bulletin</span>
                    </Link>

                    {user ? (
                        <>
                            <Link to="/create-listing" className="bg-academy-gold text-midnight-navy px-5 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition shadow-sm">List Item</Link>
                            <Link to="/messages" className="hover:text-academy-gold transition flex items-center gap-1 group">
                                <MessageSquare size={18} />
                                <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-widest mt-0.5">Chat</span>
                            </Link>

                            {/* Notifications Dropdown */}
                            <div
                                className="relative group/notif flex items-center h-full"
                                onMouseEnter={() => setShowNotifications(true)}
                                onMouseLeave={() => setShowNotifications(false)}
                            >
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative hover:text-academy-gold transition flex items-center h-full"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-midnight-navy">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 top-[100%] pt-4 w-80 z-50 cursor-default">
                                        <div className="bg-white border border-slate-100 rounded-xl shadow-2xl p-0 overflow-hidden text-slate-800">
                                            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                                                <span className="font-bold text-sm uppercase tracking-widest text-midnight-navy">Notifications</span>
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllAsRead} className="text-[10px] font-bold text-academy-gold hover:text-amber-500 uppercase transition-colors">
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto w-full">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-sm text-slate-500 font-medium">No notifications yet.</div>
                                                ) : (
                                                    notifications.map(notif => (
                                                        <div
                                                            key={notif._id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!notif.read) markAsRead(notif._id);
                                                            }}
                                                            className={`p-4 border-b border-slate-50 flex items-start gap-4 transition cursor-pointer ${notif.read ? 'bg-white opacity-60 hover:bg-slate-50' : 'bg-blue-50/30 hover:bg-slate-50'}`}
                                                        >
                                                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 transition-colors ${notif.read ? 'bg-slate-300' : 'bg-academy-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]'}`}></span>
                                                            <div className="flex-1">
                                                                <p className={`text-xs ${notif.read ? 'font-medium text-slate-600' : 'font-bold text-slate-900'}`}>{notif.message}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link to="/bookings" className="hover:text-academy-gold transition"><ShoppingCart size={20} /></Link>
                            <div className="relative group">
                                <button className="flex items-center gap-1 hover:text-academy-gold transition">
                                    <User size={20} />
                                    <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 z-50">
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="flex items-center gap-2 p-3 hover:bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-widest text-midnight-navy transition">
                                            <ShieldCheck size={14} className="text-academy-gold" />
                                            Admin Control
                                        </Link>
                                    )}
                                    <Link to="/dashboard" className="flex items-center gap-2 p-3 hover:bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-700 transition">
                                        <Package size={14} className="text-midnight-navy" />
                                        Store Manager
                                    </Link>
                                    <Link to="/profile" className="flex items-center gap-2 p-3 hover:bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-700 transition">
                                        <User size={14} className="text-midnight-navy" />
                                        My Profile
                                    </Link>
                                    <Link to="/wallet" className="flex items-center gap-2 p-3 hover:bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-700 transition">
                                        <Wallet size={14} className="text-academy-gold" />
                                        My Wallet
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 p-3 hover:bg-rose-50 rounded-lg text-xs font-bold uppercase tracking-widest text-rose-500 transition"
                                    >
                                        <LogOut size={14} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium hover:text-academy-gold transition">Log in</Link>
                            <Link to="/register" className="bg-academy-gold text-midnight-navy px-5 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition shadow-sm">Join UniRent</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
