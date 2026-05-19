import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ClipboardList, CheckCircle, XCircle, Clock, Calendar, PackageCheck, Share2, Flag, Plus, Settings, Trash2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HandoverModal from '../components/HandoverModal';
import StepTracker from '../components/StepTracker';
import { getImageUrl } from '../utils/imageUtils';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookings');
    const [verificationConfig, setVerificationConfig] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [expandedBookingId, setExpandedBookingId] = useState(null);
    const [orderStatusTab, setOrderStatusTab] = useState('active');

    const fetchData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const [listingsRes, bookingsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/items/my-listings`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/bookings/received-bookings`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            const sortedBookings = bookingsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setListings(listingsRes.data);
            setBookings(sortedBookings);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/bookings/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/items/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListings(prev => prev.filter(item => item._id !== id));
        } catch (err) {
            alert('Failed to delete listing');
        }
    };

    const handleConfirmVerification = async ({ type, notes, existingPhotos, newFiles }) => {
        const { id } = verificationConfig;
        setSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('type', type);
            submitData.append('notes', notes);

            existingPhotos.forEach(p => submitData.append('existingPhotos', p));
            newFiles.forEach(f => submitData.append('photos', f));

            const token = sessionStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/bookings/${id}/verify`, submitData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const nextStatus = type === 'preRental' ? 'active' : 'completed';
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: nextStatus } : b));
            setVerificationConfig(null);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit verification');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 font-black uppercase tracking-widest text-slate-300 italic">Syncing your gear store...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Store Hub</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Package size={14} className="text-indigo-500" />
                        Managing {listings.length} Gears & {bookings.length} Rentals
                    </p>
                </div>

                <div className="flex bg-slate-50 p-2 rounded-[2rem] border border-slate-100 shadow-inner">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'bookings' ? 'bg-white text-indigo-600 shadow-xl scale-[1.05] italic' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Active Journeys
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'listings' ? 'bg-white text-indigo-600 shadow-xl scale-[1.05] italic' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        My Catalog
                    </button>
                </div>
            </div>

            {activeTab === 'bookings' && (
                <div className="grid gap-6">
                    <div className="flex items-center gap-8 border-b border-slate-100 px-4 mb-2">
                        <button
                            onClick={() => setOrderStatusTab('active')}
                            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${orderStatusTab === 'active' ? 'text-[#1B3B5A] border-b-2 border-[#1B3B5A]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Active Journeys
                        </button>
                        <button
                            onClick={() => setOrderStatusTab('completed')}
                            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${orderStatusTab === 'completed' ? 'text-[#1B3B5A] border-b-2 border-[#1B3B5A]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Completed Journeys
                        </button>
                    </div>

                    {bookings.filter(b => orderStatusTab === 'active' ? ['pending', 'approved', 'active', 'requested_return'].includes(b.status) : ['completed', 'rejected'].includes(b.status)).map(booking => {
                        const isExpanded = expandedBookingId === booking._id;

                        return (
                            <div key={booking._id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
                                {/* Collapsed Summary Header */}
                                <div
                                    onClick={() => setExpandedBookingId(isExpanded ? null : booking._id)}
                                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                            <img src={booking.item.images[0]} className="w-full h-full object-cover" alt="" />
                                        </div>

                                        <div className="flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">#{booking._id.slice(-6).toUpperCase()}</span>
                                                <div className={`w-2 h-2 rounded-full ${booking.status === 'completed' ? 'bg-emerald-400' : booking.status === 'pending' ? 'bg-indigo-400' : 'bg-amber-400'}`} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight italic">{booking.item.title}</h3>
                                        </div>

                                        <div className="hidden md:flex items-center gap-8 px-8 border-l border-slate-100">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={12} /> Schedule</p>
                                                <p className="text-xs font-bold text-slate-700">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><PackageCheck size={12} /> Student</p>
                                                <p className="text-xs font-bold text-slate-700 uppercase">{booking.renter.name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Est. Revenue</p>
                                            <p className="text-xl font-black text-slate-900 italic">₹{booking.totalPrice}</p>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'bg-slate-100 rotate-180' : 'bg-slate-50 text-indigo-500'}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content Area */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 bg-slate-50/50 p-8 pt-10">
                                        {/* Status Timeline */}
                                        <div className="mb-12 max-w-2xl mx-auto px-4">
                                            <StepTracker currentStatus={booking.status} type="owner" />
                                        </div>

                                        <div className="flex justify-end gap-3 mt-8">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(booking._id, 'rejected') }}
                                                        className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:text-rose-500 transition border border-transparent hover:border-slate-200 shadow-sm bg-slate-100"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(booking._id, 'approved') }}
                                                        className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-slate-900 transition shadow-lg shadow-indigo-100"
                                                    >
                                                        Accept Request
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'approved' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setVerificationConfig({
                                                            id: booking._id,
                                                            type: 'preRental',
                                                            title: 'Peer Handover',
                                                            subtitle: 'Secure the gear condition'
                                                        });
                                                    }}
                                                    className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-slate-900 transition shadow-lg"
                                                >
                                                    Confirm Handover
                                                </button>
                                            )}
                                            {booking.status === 'requested_return' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setVerificationConfig({
                                                            id: booking._id,
                                                            type: 'postRental',
                                                            title: 'Receive Gear',
                                                            subtitle: 'Final inspection'
                                                        });
                                                    }}
                                                    className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-[#D4AF37] hover:brightness-110 transition shadow-lg shadow-amber-100"
                                                >
                                                    Complete Cycle
                                                </button>
                                            )}
                                            {booking.status === 'completed' && (
                                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-100 shadow-sm">
                                                    <CheckCircle size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Journey Done</span>
                                                </div>
                                            )}
                                            {booking.status === 'active' && (
                                                <div className="flex items-center gap-2 text-indigo-500 bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
                                                    <Clock size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Out with Renter</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {bookings.filter(b => orderStatusTab === 'active' ? ['pending', 'approved', 'active', 'requested_return'].includes(b.status) : ['completed', 'rejected'].includes(b.status)).length === 0 && (
                        <div className="text-center py-40 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <ClipboardList size={24} className="text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">Market is quiet right now</p>
                            <p className="text-slate-300 text-[9px] font-bold uppercase tracking-[0.1em] mt-2">Active requests will appear here</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'listings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.map(item => (
                        <div key={item._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500 relative">
                            <div className="h-56 bg-slate-100 relative overflow-hidden">
                                <img src={item.images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" alt="" />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-600 shadow-sm border border-white/20 italic">
                                    {item.category}
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight truncate italic">{item.title}</h3>
                                    <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${item.isAvailable ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)] animate-pulse' : 'bg-slate-200'}`} />
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <span className="text-sm font-black text-indigo-600 uppercase tracking-widest italic">₹{item.pricePerDay}<span className="text-[10px] text-slate-300 ml-1">/day</span></span>
                                    <div className="flex items-center gap-2">
                                        <button className="text-slate-400 hover:text-slate-900 transition p-2">
                                            <Settings size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item._id)}
                                            className="text-slate-300 hover:text-rose-500 transition p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="bg-slate-50/30 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 group hover:bg-slate-50 transition-colors cursor-pointer min-h-[300px]">
                        <div className="w-14 h-14 rounded-3xl bg-white flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-110 transition duration-500">
                            <Plus size={24} />
                        </div>
                        <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Expand Your Catalog</p>
                    </div>
                </div>
            )}

            {/* Verification Modal */}
            {verificationConfig && (
                <HandoverModal
                    isOpen={!!verificationConfig}
                    onClose={() => setVerificationConfig(null)}
                    onConfirm={handleConfirmVerification}
                    type={verificationConfig.type}
                    title={verificationConfig.title}
                    subtitle={verificationConfig.subtitle}
                    submitting={submitting}
                />
            )}
        </div>
    );
};

export default OwnerDashboard;
