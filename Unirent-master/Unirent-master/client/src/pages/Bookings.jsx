import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, ShieldCheck, ArrowRight, Star, Package, Share2, Flag, ChevronDown, CheckCircle } from 'lucide-react';
import ReviewForm from '../components/ReviewForm';
import HandoverModal from '../components/HandoverModal';
import StepTracker from '../components/StepTracker';
import { getImageUrl } from '../utils/imageUtils';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verificationConfig, setVerificationConfig] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [expandedBookingId, setExpandedBookingId] = useState(null);
    const [orderTab, setOrderTab] = useState('active');

    const fetchBookings = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/bookings/my-rentals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sortedBookings = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBookings(sortedBookings);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        const interval = setInterval(fetchBookings, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleReturnRequest = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/bookings/${id}/request-return`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'requested_return' } : b));
        } catch (err) {
            console.error(err);
            alert('Failed to send return request');
        }
    };

    const handleCancelBooking = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking request? Your held funds will be fully refunded to your wallet.')) return;
        try {
            const token = sessionStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/bookings/${id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
            alert('Booking request cancelled successfully and funds fully refunded!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to cancel booking request');
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

    if (loading) return <div className="text-center py-20 font-black uppercase tracking-widest text-slate-300 italic">Preparing your gear journey...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <div className="px-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">My Gear Journey</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Track your rentals and manage handovers</p>
            </div>

            <div className="flex items-center gap-8 border-b border-slate-100 px-4">
                <button
                    onClick={() => setOrderTab('active')}
                    className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${orderTab === 'active' ? 'text-[#1B3B5A] border-b-2 border-[#1B3B5A]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Active Journeys
                </button>
                <button
                    onClick={() => setOrderTab('completed')}
                    className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${orderTab === 'completed' ? 'text-[#1B3B5A] border-b-2 border-[#1B3B5A]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Completed Journeys
                </button>
            </div>

            <div className="grid gap-10">
                {bookings.filter(b => orderTab === 'active' ? ['pending', 'approved', 'active', 'requested_return'].includes(b.status) : ['completed', 'rejected'].includes(b.status)).map(booking => {
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
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldCheck size={12} /> Peer</p>
                                            <p className="text-xs font-bold text-slate-700 uppercase">{booking.owner.name}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Total Commitment</p>
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
                                        <StepTracker currentStatus={booking.status} type="renter" />
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8">
                                        {booking.status === 'approved' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setVerificationConfig({
                                                        id: booking._id,
                                                        type: 'preRental',
                                                        title: 'Start Handover',
                                                        subtitle: 'Lock in the gear condition'
                                                    });
                                                }}
                                                className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-slate-900 transition shadow-lg shadow-indigo-100"
                                            >
                                                Begin Handover
                                            </button>
                                        )}
                                        {booking.status === 'active' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReturnRequest(booking._id);
                                                }}
                                                className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-indigo-600 transition shadow-lg"
                                            >
                                                Return Gear
                                            </button>
                                        )}
                                        {booking.status === 'requested_return' && (
                                            <div className="flex items-center gap-2 text-amber-500 bg-white px-6 py-3 rounded-xl border border-amber-100 shadow-sm animate-pulse">
                                                <Clock size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Waiting for Owner</span>
                                            </div>
                                        )}
                                        {booking.status === 'completed' && (
                                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-100 shadow-sm">
                                                <CheckCircle size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Journey Complete</span>
                                            </div>
                                        )}
                                        {booking.status === 'pending' && (
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 text-indigo-400 bg-white px-6 py-3 rounded-xl border border-slate-100 shadow-sm">
                                                    <Clock size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Peer</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelBooking(booking._id);
                                                    }}
                                                    className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:text-rose-500 transition border border-transparent hover:border-slate-200 shadow-sm bg-slate-100 font-bold"
                                                >
                                                    Cancel Request
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {bookings.filter(b => orderTab === 'active' ? ['pending', 'approved', 'active', 'requested_return'].includes(b.status) : ['completed', 'rejected'].includes(b.status)).length === 0 && (
                    <div className="text-center py-40 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                        <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Package size={24} className="text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No gear journeys started yet</p>
                        <button className="mt-4 text-indigo-600 text-[10px] font-black uppercase tracking-widest italic hover:underline">Explore Marketplace</button>
                    </div>
                )}
            </div>

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

export default Bookings;
