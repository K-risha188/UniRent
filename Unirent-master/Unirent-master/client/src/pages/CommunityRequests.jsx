import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Search, AlertCircle, CheckCircle, Clock, Plus, X } from 'lucide-react';

const CommunityRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', description: '', urgency: 'standard', deadline: '' });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch requests', error);
            setLoading(false);
        }
    };

    const handlePostRequest = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/requests`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setFormData({ title: '', description: '', urgency: 'standard', deadline: '' });
            fetchRequests();
        } catch (error) {
            console.error('Error posting request', error);
        }
    };

    const handleFulfill = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/requests/${id}/fulfill`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRequests();
        } catch (error) {
            console.error('Error fulfilling request', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight italic flex items-center gap-3">
                            <Megaphone className="text-academy-gold" size={36} />
                            Community Bulletin
                        </h1>
                        <p className="text-slate-500 font-medium mt-2 max-w-2xl">
                            Help a peer out or post an urgent gear request. If you can't find what you need on the marketplace, ask the community!
                        </p>
                    </div>
                    {user && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-midnight-navy text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-midnight-navy/20"
                        >
                            <Plus size={20} />
                            Post Urgent Request
                        </button>
                    )}
                </div>

                {/* Grid Feed */}
                {loading ? (
                    <div className="text-center py-20 text-slate-500">Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No active requests</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">The community board is currently clear. Be the first to post if you need something specific!</p>
                        {user && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-slate-100 text-midnight-navy px-6 py-2 rounded-lg font-bold hover:bg-slate-200 transition"
                            >
                                Create a Request
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map(req => (
                            <div key={req._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                                        <img src={req.user?.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + req.user?._id} alt={req.user?.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{req.user?.name?.split(' ')[0] || 'A student'} requested:</p>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{req.title}</h3>
                                {req.urgency === 'urgent' ? (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider mb-4 border border-rose-100">
                                        <AlertCircle size={12} />
                                        Urgent
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider mb-4 border border-amber-100">
                                        <Clock size={12} />
                                        Standard Request
                                    </div>
                                )}
                                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                                    {req.description}
                                </p>
                                {req.deadline && (
                                    <p className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
                                        Needed by: {new Date(req.deadline).toLocaleDateString()}
                                    </p>
                                )}
                                {user?._id !== req.user?._id ? (
                                    <button
                                        onClick={() => handleFulfill(req._id)}
                                        className="w-full bg-academy-gold/10 hover:bg-academy-gold text-amber-700 hover:text-midnight-navy border border-academy-gold/30 hover:border-academy-gold transition px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} />
                                        Help Out / I Have This
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFulfill(req._id)}
                                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                    >
                                        Mark as Fulfilled
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                        <div className="bg-white rounded-[2rem] w-full max-w-lg relative z-10 p-8 shadow-2xl flex flex-col max-h-[90vh]">
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition">
                                <X size={24} />
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 mb-2 italic tracking-tight">Post a Request</h2>
                            <p className="text-slate-500 mb-8 font-medium">Describe what you need and how soon you need it.</p>

                            <form onSubmit={handlePostRequest} className="flex flex-col gap-5 overflow-y-auto pr-2">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">What do you need?</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. DSLR Camera for Weekend Shoot"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-academy-gold focus:ring-1 focus:ring-academy-gold transition"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description / Context</label>
                                    <textarea
                                        required
                                        placeholder="Explain why you need it and for how long..."
                                        rows="4"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-academy-gold focus:ring-1 focus:ring-academy-gold transition resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Urgency</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-academy-gold focus:ring-1 focus:ring-academy-gold transition appearance-none"
                                            value={formData.urgency}
                                            onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                                        >
                                            <option value="standard">Standard</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Deadline (Optional)</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-academy-gold focus:ring-1 focus:ring-academy-gold transition"
                                            value={formData.deadline}
                                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-midnight-navy text-white rounded-xl py-3.5 font-bold hover:bg-slate-800 transition shadow-lg shadow-midnight-navy/20 mt-4">
                                    Post to Community
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityRequests;
