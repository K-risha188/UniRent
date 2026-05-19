import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Package, BarChart3, Trash2, ShieldCheck, ShieldAlert, Search, RefreshCcw, ExternalLink, UserCheck } from 'lucide-react';
import VerificationModal from '../components/VerificationModal';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [items, setItems] = useState([]);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (activeTab === 'stats') {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/stats`, { headers });
                setStats(res.data);
            } else if (activeTab === 'users') {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/users`, { headers });
                setUsers(res.data);
            } else if (activeTab === 'items') {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/items`, { headers });
                setItems(res.data);
            } else if (activeTab === 'verifications') {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/unverified-users`, { headers });
                setUnverifiedUsers(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Delete this listing from the registry?')) return;
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/items/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(items.filter(item => item._id !== id));
        } catch (err) {
            alert('Operation failed');
        }
    };

    const handleToggleAdmin = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/users/${id}/toggle-admin`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.map(u => u._id === id ? { ...u, role: res.data.user.role } : u));
        } catch (err) {
            alert('Role modification failed');
        }
    };

    const handleApproveVerification = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/verify-user/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnverifiedUsers(unverifiedUsers.filter(u => u._id !== id));
            setSelectedStudent(null);
            alert('Student verified successfully!');
        } catch (err) {
            alert('Verification approval failed');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-midnight-navy tracking-tight mb-2">Chancellor's Console</h1>
                    <p className="text-slate-gray font-medium">Platform oversight and community management.</p>
                </div>

                <div className="flex bg-mist-gray p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    {[
                        { id: 'stats', icon: <BarChart3 size={18} />, label: 'Analytics' },
                        { id: 'users', icon: <Users size={18} />, label: 'Registry' },
                        { id: 'items', icon: <Package size={18} />, label: 'Inventory' },
                        { id: 'verifications', icon: <UserCheck size={18} />, label: 'Verifications' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-white text-midnight-navy shadow-sm'
                                : 'text-slate-gray hover:text-midnight-navy'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <RefreshCcw className="animate-spin text-academy-gold" size={32} />
                    <p className="text-[10px] font-bold text-slate-gray uppercase tracking-[0.3em]">Synching Data Ledger...</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {activeTab === 'stats' && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="card-premium group hover:border-academy-gold/20 transition-all">
                                <Users className="text-midnight-navy mb-6 group-hover:scale-110 transition-transform" size={40} />
                                <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mb-2">Total Scholars</p>
                                <h3 className="text-5xl font-bold text-midnight-navy tracking-tighter">{stats.totalUsers}</h3>
                            </div>
                            <div className="card-premium group hover:border-academy-gold/20 transition-all">
                                <Package className="text-midnight-navy mb-6 group-hover:scale-110 transition-transform" size={40} />
                                <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mb-2">Asset Inventory</p>
                                <h3 className="text-5xl font-bold text-midnight-navy tracking-tighter">{stats.totalItems}</h3>
                            </div>
                            <div className="card-premium group hover:border-academy-gold/20 transition-all">
                                <BarChart3 className="text-midnight-navy mb-6 group-hover:scale-110 transition-transform" size={40} />
                                <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mb-2">Platform Activity</p>
                                <h3 className="text-5xl font-bold text-midnight-navy tracking-tighter">{stats.totalBookings}</h3>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="card-premium p-0 overflow-hidden border-slate-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-mist-gray border-b border-slate-200">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Name</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Email</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Authority</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map(user => (
                                            <tr key={user._id} className="hover:bg-mist-gray/30 transition-all">
                                                <td className="px-8 py-5 font-bold text-midnight-navy">{user.name}</td>
                                                <td className="px-8 py-5 text-slate-gray font-medium text-sm">{user.email}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-max ${user.role === 'admin'
                                                        ? 'bg-midnight-navy text-white'
                                                        : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {user.role === 'admin' ? <ShieldCheck size={10} className="text-academy-gold" /> : null}
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button
                                                        onClick={() => handleToggleAdmin(user._id)}
                                                        className="p-2.5 text-slate-400 hover:text-midnight-navy hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
                                                        title={user.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                                                    >
                                                        {user.role === 'admin' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div className="card-premium p-0 overflow-hidden border-slate-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-mist-gray border-b border-slate-200">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Asset Title</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Registry Owner</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Valuation</th>
                                            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map(item => (
                                            <tr key={item._id} className="hover:bg-mist-gray/30 transition-all">
                                                <td className="px-8 py-5 font-bold text-midnight-navy">{item.title}</td>
                                                <td className="px-8 py-5 text-slate-gray font-medium text-sm">
                                                    <div className="flex items-center gap-2">
                                                        {item.owner?.name} <ExternalLink size={12} className="opacity-30" />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 font-bold text-midnight-navy">₹{item.pricePerDay} <span className="text-[10px] text-slate-gray uppercase">/ Day</span></td>
                                                <td className="px-8 py-5 text-right">
                                                    <button
                                                        onClick={() => handleDeleteItem(item._id)}
                                                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'verifications' && (
                        <div className="card-premium p-0 overflow-hidden border-slate-200">
                            <div className="p-6 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-midnight-navy flex items-center gap-2">
                                        <UserCheck className="text-amber-600" size={20} /> Action Required
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Review new scholar registrations. Academic credentials must be verified before platform access is granted.
                                    </p>
                                </div>
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                    {unverifiedUsers.length} Pending
                                </span>
                            </div>

                            {unverifiedUsers.length === 0 ? (
                                <div className="p-16 text-center">
                                    <ShieldCheck size={48} className="mx-auto text-emerald-200 mb-4" />
                                    <h4 className="text-xl font-bold text-midnight-navy mb-2">All Caught Up!</h4>
                                    <p className="text-slate-500 max-w-sm mx-auto">
                                        There are zero pending verification requests in the queue right now.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-mist-gray border-b border-slate-200">
                                            <tr>
                                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Scholar Name</th>
                                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">University</th>
                                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray">Submitted On</th>
                                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-gray text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {unverifiedUsers.map(user => (
                                                <tr key={user._id} className="hover:bg-amber-50/30 transition-all group">
                                                    <td className="px-8 py-5">
                                                        <p className="font-bold text-midnight-navy">{user.name}</p>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </td>
                                                    <td className="px-8 py-5 text-slate-gray font-medium text-sm">{user.university}</td>
                                                    <td className="px-8 py-5 text-slate-gray font-medium text-sm">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button
                                                            onClick={() => setSelectedStudent(user)}
                                                            className="px-4 py-2 bg-white border border-slate-200 text-midnight-navy text-xs font-bold rounded-lg hover:border-midnight-navy transition-all shadow-sm"
                                                        >
                                                            Review ID
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <VerificationModal
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
                onApprove={handleApproveVerification}
            />
        </div>
    );
};

export default AdminDashboard;
