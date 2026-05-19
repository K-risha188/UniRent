import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, MapPin, MessageSquare, Calendar as CalendarIcon, Wallet, Star, Clock, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';

const ItemDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: ''
    });
    const [invoice, setInvoice] = useState(null);

    useEffect(() => {
        if (bookingData.startDate && bookingData.endDate && item) {
            const start = new Date(bookingData.startDate);
            const end = new Date(bookingData.endDate);
            if (start <= end) {
                const diffTime = Math.abs(end - start);
                const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

                const rentalPrice = diffDays * item.pricePerDay;
                const platformFee = rentalPrice * 0.05;
                const total = rentalPrice + item.securityDeposit + platformFee;

                setInvoice({
                    days: diffDays,
                    rentalPrice,
                    securityDeposit: item.securityDeposit,
                    platformFee,
                    total
                });
            } else {
                setInvoice(null);
            }
        } else {
            setInvoice(null);
        }
    }, [bookingData, item]);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/items/${id}`);
                setItem(res.data);

                const [reviewRes, historyRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reviews/${id}`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/bookings/item/${id}/history`)
                ]);
                setReviews(reviewRes.data);
                setHistory(historyRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const handleBooking = async () => {
        if (!user) return navigate('/login');
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/bookings`, {
                itemId: id,
                ...bookingData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Booking request sent and funds secured in escrow!');
            navigate('/bookings');
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Booking failed';
            if (errorMsg.includes('wallet balance')) {
                if (window.confirm(errorMsg + ' Go to wallet to add funds now?')) {
                    navigate('/wallet');
                }
            } else {
                alert(errorMsg);
            }
        }
    };

    const handleStartChat = async () => {
        if (!user) return navigate('/login');
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/chats`, {
                recipientId: item.owner._id,
                itemId: id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/messages/${res.data._id}`);
        } catch (err) {
            alert('Failed to start chat');
        }
    };

    if (loading) return <div className="text-center py-40 text-slate-gray font-bold tracking-widest uppercase text-xs">Loading Item Architecture...</div>;
    if (!item) return <div className="text-center py-40 text-rose-500 font-bold">Item not found in the repository</div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="grid lg:grid-cols-2 gap-16">
                {/* Visual Assets */}
                <div className="space-y-6">
                    <div className="aspect-[4/3] bg-mist-gray rounded-[2rem] overflow-hidden border border-slate-100 shadow-whisper relative group">
                        <img
                            src={getImageUrl(item.images[0]) || 'https://via.placeholder.com/800x600'}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-1000"
                            alt={item.title}
                        />
                        <div className="absolute top-6 left-6 flex gap-2">
                            <span className="bg-midnight-navy/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                {item.category}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {item.images.slice(1).map((img, i) => (
                            <div key={i} className="aspect-square bg-mist-gray rounded-2xl overflow-hidden cursor-pointer hover:border-academy-gold border-2 border-transparent transition-all">
                                <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Economic & Contractual Data */}
                <div className="flex flex-col space-y-10">
                    <div className="border-b border-slate-100 pb-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex items-center gap-1.5 text-academy-gold bg-mist-gray px-3 py-1 rounded-lg border border-slate-200">
                                <MapPin size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{item.university} Campus</span>
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold text-midnight-navy leading-tight mb-6 tracking-tight">
                            {item.title}
                        </h1>
                        <p className="text-slate-gray leading-relaxed text-lg font-medium">
                            {item.description}
                        </p>
                    </div>

                    <div className="card-premium space-y-8">
                        <div className="flex items-end justify-between border-b border-slate-50 pb-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mb-3">Daily Investment</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-midnight-navy tracking-tighter">₹{item.pricePerDay}</span>
                                    <span className="text-slate-gray font-bold text-xs uppercase tracking-widest">/ Day</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mb-3">Security Deposit</p>
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-2xl font-bold text-midnight-navy">₹{item.securityDeposit}</span>
                                    <Info size={14} className="text-slate-300 cursor-help" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold text-slate-gray uppercase tracking-widest ml-1">Commencement</label>
                                <input
                                    type="date"
                                    className="w-full bg-mist-gray border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-midnight-navy outline-none text-sm font-bold text-midnight-navy"
                                    onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-bold text-slate-gray uppercase tracking-widest ml-1">Termination</label>
                                <input
                                    type="date"
                                    className="w-full bg-mist-gray border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-midnight-navy outline-none text-sm font-bold text-midnight-navy"
                                    onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 flex-col">
                            {invoice && (
                                <div className="bg-mist-gray border-2 border-slate-200 rounded-2xl p-6 text-sm font-medium text-slate-700 shadow-inner">
                                    <h4 className="font-bold text-midnight-navy mb-4 uppercase tracking-widest text-xs border-b border-slate-200 pb-3 flex items-center justify-between">
                                        <span>Invoice Summary</span>
                                        <span className="bg-academy-gold/20 text-academy-gold px-2 py-1 rounded text-[9px]">SECURE ESCROW</span>
                                    </h4>
                                    <div className="flex justify-between mb-3">
                                        <span>Rental ({invoice.days} Days × ₹{item.pricePerDay})</span>
                                        <span>₹{invoice.rentalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between mb-3">
                                        <span>Security Deposit <span className="text-[10px] text-emerald-500 font-bold ml-1">(Refundable)</span></span>
                                        <span>₹{invoice.securityDeposit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between mb-4 text-slate-500">
                                        <span>Platform Fee (5%)</span>
                                        <span>₹{invoice.platformFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 pt-4 font-black text-xl text-midnight-navy font-outfit">
                                        <span>Total Required</span>
                                        <span>₹{invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={handleBooking}
                                    disabled={!bookingData.startDate || !bookingData.endDate}
                                    className="flex-1 bg-midnight-navy text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-30"
                                >
                                    <Wallet size={18} />
                                    Initiate & Pay
                                </button>
                                <button
                                    onClick={handleStartChat}
                                    className="bg-mist-gray text-midnight-navy p-4 rounded-xl hover:bg-academy-gold/10 hover:text-academy-gold transition-all border border-slate-200"
                                >
                                    <MessageSquare size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="card-premium p-5 flex items-start gap-4 hover:-translate-y-1 transition-all duration-300">
                            <div className="bg-mist-gray w-12 h-12 rounded-xl flex items-center justify-center text-midnight-navy border border-slate-100">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-midnight-navy uppercase tracking-widest mb-1">Scholar Trust</h4>
                                <p className="text-[10px] font-bold text-slate-gray uppercase leading-tight">Verified Student Identity</p>
                            </div>
                        </div>
                        <div className="card-premium p-5 flex items-start gap-4 hover:-translate-y-1 transition-all duration-300">
                            <div className="bg-mist-gray w-12 h-12 rounded-xl flex items-center justify-center text-midnight-navy border border-slate-100">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-midnight-navy uppercase tracking-widest mb-1">Rapid Access</h4>
                                <p className="text-[10px] font-bold text-slate-gray uppercase leading-tight">Ready for collection</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Qualitative Feedback */}
            <div className="mt-24 space-y-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                    <h2 className="text-3xl font-bold text-midnight-navy tracking-tight">
                        Student Reviews <span className="text-academy-gold ml-2">({reviews.length})</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {reviews.map(review => (
                        <div key={review._id} className="card-premium hover:border-academy-gold/20 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={review.user.image || `https://ui-avatars.com/api/?name=${review.user.name}`} className="w-12 h-12 rounded-full border border-mist-gray shadow-sm" alt="" />
                                <div>
                                    <h4 className="text-sm font-bold text-midnight-navy tracking-tight">{review.user.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest">{review.user.university} Scholar</p>
                                </div>
                                <div className="ml-auto flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} className={i < review.rating ? "text-academy-gold fill-academy-gold" : "text-slate-200"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-gray font-medium leading-relaxed italic">"{review.comment}"</p>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-mist-gray rounded-[2rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-gray font-bold uppercase tracking-widest text-xs">No peer reviews available yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Verification Ledger */}
            <div className="mt-24 space-y-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                    <h2 className="text-3xl font-bold text-midnight-navy tracking-tight">
                        Condition Registry <span className="text-academy-gold ml-2">({history.length})</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest flex items-center gap-2">
                        <Shield size={14} className="text-academy-gold" />
                        Audited Log Chain
                    </p>
                </div>

                <div className="space-y-8">
                    {history.map(item => (
                        <div key={item.id} className="card-premium space-y-8 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">Verified Log</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-mist-gray flex items-center justify-center border border-slate-200 text-midnight-navy font-bold text-sm shadow-sm">
                                    {item.renter.name[0]}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-midnight-navy">Rented by {item.renter.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest">Archive Date: {new Date(item.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-bold text-slate-gray uppercase tracking-widest border-l-2 border-midnight-navy pl-4">Handover State</h5>
                                    <div className="flex gap-3">
                                        {item.handover?.photos?.map((ph, i) => (
                                            <img key={i} src={getImageUrl(ph)} className="w-20 h-20 rounded-xl object-cover border border-slate-100 shadow-sm" alt="" />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-gray font-medium italic">"{item.handover?.notes || 'No registry notes provided'}"</p>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-bold text-slate-gray uppercase tracking-widest border-l-2 border-academy-gold pl-4">Restoration State</h5>
                                    <div className="flex gap-3">
                                        {item.return?.photos?.map((ph, i) => (
                                            <img key={i} src={getImageUrl(ph)} className="w-20 h-20 rounded-xl object-cover border border-slate-100 shadow-sm" alt="" />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-gray font-medium italic">"{item.return?.notes || 'No registry notes provided'}"</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="py-20 text-center bg-mist-gray rounded-[2rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-gray font-bold uppercase tracking-widest text-xs">Condition registry is empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;
