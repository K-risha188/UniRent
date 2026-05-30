import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, MapPin, MessageSquare, Calendar as CalendarIcon, Wallet, Star, Clock, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';

const ItemDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [history, setHistory] = useState([]);
    const [reservedDates, setReservedDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: ''
    });
    const [invoice, setInvoice] = useState(null);

    // Calendar UI State
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const formatDateString = (year, month, day) => {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
    };

    const isDateReserved = (dateStr) => {
        const target = new Date(dateStr + 'T00:00:00');
        return reservedDates.some(range => {
            const start = new Date(range.startDate.split('T')[0] + 'T00:00:00');
            const end = new Date(range.endDate.split('T')[0] + 'T00:00:00');
            return target >= start && target <= end;
        });
    };

    const isRangeOverlapping = (startStr, endStr) => {
        const start = new Date(startStr + 'T00:00:00');
        const end = new Date(endStr + 'T00:00:00');
        let current = new Date(start);
        while (current <= end) {
            const str = formatDateString(current.getFullYear(), current.getMonth(), current.getDate());
            if (isDateReserved(str)) return true;
            current.setDate(current.getDate() + 1);
        }
        return false;
    };

    const handleDateClick = (day) => {
        const dateStr = formatDateString(currentYear, currentMonth, day);
        
        if (!bookingData.startDate || (bookingData.startDate && bookingData.endDate)) {
            setBookingData({ startDate: dateStr, endDate: '' });
        } else {
            if (dateStr < bookingData.startDate) {
                setBookingData({ startDate: dateStr, endDate: '' });
            } else {
                if (isRangeOverlapping(bookingData.startDate, dateStr)) {
                    alert("⚠️ Scheduling conflict: Selected range overlaps with an active reservation. Please choose another period.");
                    setBookingData({ startDate: dateStr, endDate: '' });
                } else {
                    setBookingData({ ...bookingData, endDate: dateStr });
                }
            }
        }
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const renderCalendarGrid = () => {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
        const todayStr = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

        const grid = [];
        
        for (let i = 0; i < startDayOfWeek; i++) {
            grid.push(<div key={`empty-${i}`} className="aspect-square"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDateString(currentYear, currentMonth, day);
            const isReserved = isDateReserved(dateStr);
            const isPast = dateStr < todayStr;
            const isSelectedStart = bookingData.startDate === dateStr;
            const isSelectedEnd = bookingData.endDate === dateStr;
            const isInRange = bookingData.startDate && bookingData.endDate && dateStr > bookingData.startDate && dateStr < bookingData.endDate;

            let cellClass = "aspect-square flex items-center justify-center text-xs font-bold rounded-xl border transition-all select-none ";
            let clickHandler = () => handleDateClick(day);

            if (isPast) {
                cellClass += "bg-slate-100/50 text-slate-300 border-transparent cursor-not-allowed";
                clickHandler = null;
            } else if (isReserved) {
                cellClass += "bg-amber-50 border-amber-200/50 text-amber-600 line-through cursor-not-allowed font-extrabold relative overflow-hidden";
                clickHandler = null;
            } else if (isSelectedStart || isSelectedEnd) {
                cellClass += "bg-midnight-navy text-white border-midnight-navy shadow-md font-black scale-105 z-10 hover:brightness-110";
            } else if (isInRange) {
                cellClass += "bg-midnight-navy/10 text-midnight-navy border-midnight-navy/20 font-black hover:bg-midnight-navy/20";
            } else {
                cellClass += "bg-slate-50 border-slate-200/40 text-slate-700 hover:border-midnight-navy hover:bg-white hover:text-midnight-navy cursor-pointer";
            }

            grid.push(
                <button
                    key={day}
                    type="button"
                    onClick={clickHandler}
                    disabled={isPast || isReserved}
                    className={cellClass}
                    title={isReserved ? "Reserved" : undefined}
                >
                    {day}
                    {isReserved && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/10 to-amber-500/0 rotate-45 scale-[2] pointer-events-none" />
                    )}
                </button>
            );
        }

        return grid;
    };

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

                const [reviewRes, historyRes, reservedRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reviews/${id}`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/bookings/item/${id}/history`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/bookings/item/${id}/reserved-dates`)
                ]);
                setReviews(reviewRes.data);
                setHistory(historyRes.data);
                setReservedDates(reservedRes.data);
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

                        <div className="grid grid-cols-2 gap-6 border-b border-slate-100 pb-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-gray uppercase tracking-widest ml-1">Commencement</label>
                                <div className="w-full bg-mist-gray rounded-xl py-3.5 px-5 text-xs font-bold text-midnight-navy border border-slate-200/50 flex items-center gap-2 select-none">
                                    <CalendarIcon size={14} className="text-slate-400" />
                                    <span>{bookingData.startDate ? new Date(bookingData.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "Select below..."}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-gray uppercase tracking-widest ml-1">Termination</label>
                                <div className="w-full bg-mist-gray rounded-xl py-3.5 px-5 text-xs font-bold text-midnight-navy border border-slate-200/50 flex items-center gap-2 select-none">
                                    <CalendarIcon size={14} className="text-slate-400" />
                                    <span>{bookingData.endDate ? new Date(bookingData.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "Select below..."}</span>
                                </div>
                            </div>
                        </div>

                        {/* Premium Visual Booking Calendar */}
                        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon size={16} className="text-academy-gold" />
                                    <h4 className="text-xs font-black uppercase tracking-wider text-midnight-navy">Availability Calendar</h4>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handlePrevMonth}
                                        className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500 hover:text-midnight-navy cursor-pointer"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-xs font-black uppercase tracking-widest text-midnight-navy w-28 text-center select-none">
                                        {monthNames[currentMonth]} {currentYear}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleNextMonth}
                                        className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500 hover:text-midnight-navy cursor-pointer"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 text-center border-b border-slate-100 pb-2">
                                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, idx) => (
                                    <span key={idx} className="text-[10px] font-black text-slate-gray uppercase tracking-widest">{day}</span>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {renderCalendarGrid()}
                            </div>

                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-100/50 select-none">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-slate-50 border border-slate-200/50 rounded-sm" />
                                    <span>Available</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-amber-50 border border-amber-200/50 text-amber-600 rounded-sm flex items-center justify-center line-through font-bold text-[6px]">X</div>
                                    <span>Booked Peer</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-midnight-navy rounded-sm" />
                                    <span>Your Range</span>
                                </div>
                                {(bookingData.startDate || bookingData.endDate) && (
                                    <button
                                        type="button"
                                        onClick={() => setBookingData({ startDate: '', endDate: '' })}
                                        className="text-indigo-600 hover:text-indigo-800 transition active:scale-95 cursor-pointer font-black"
                                    >
                                        Clear Dates
                                    </button>
                                )}
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
