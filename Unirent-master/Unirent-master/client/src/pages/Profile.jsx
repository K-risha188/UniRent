import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User as UserIcon, Shield, MapPin, Package, Heart, Leaf, Settings as SettingsIcon, Camera, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [activityData, setActivityData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        phone: '',
        yearOfStudy: '',
        enrollmentId: '',
        image: ''
    });
    const [message, setMessage] = useState('');
    const [uploadingId, setUploadingId] = useState(false);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [isActivityOpen, setIsActivityOpen] = useState(true);

    const handleIdUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('idCardImage', file);

        try {
            setUploadingId(true);
            const token = sessionStorage.getItem('token');
            const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/upload-id-card`, uploadData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfileData(res.data);
            setMessage('ID Card uploaded successfully! Awaiting verification.');
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.error || 'Error uploading ID card');
            setTimeout(() => setMessage(''), 4000);
        } finally {
            setUploadingId(false);
        }
    };

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            setUploadingProfile(true);
            const token = sessionStorage.getItem('token');
            const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/upload-profile-image`, uploadData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfileData(res.data);
            setFormData({ ...formData, image: res.data.image });
            setMessage('Profile photo updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.error || 'Error uploading profile photo');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setUploadingProfile(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token');

                const profileRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfileData(profileRes.data);
                setFormData({
                    name: profileRes.data.name,
                    bio: profileRes.data.bio,
                    phone: profileRes.data.phone,
                    yearOfStudy: profileRes.data.yearOfStudy,
                    enrollmentId: profileRes.data.enrollmentId,
                    image: profileRes.data.image
                });

                const activityRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/activity`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setActivityData(activityRes.data);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/update-profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData(res.data);
            setIsEditing(false);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Error updating profile');
        }
    };

    if (loading) return <div className="text-center py-20 font-black uppercase tracking-widest text-slate-300 bg-slate-50 min-h-screen">Loading Profile...</div>;

    const stats = profileData?.stats || { itemsShared: 0, totalRentals: 0, moneySaved: 0 };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Success/Error Message */}
            {message && (
                <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce font-black uppercase tracking-widest text-xs border ${message.includes('success') ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
                    }`}>
                    {message}
                </div>
            )}

            {/* Profile Header */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-0" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-lg">
                            <img src={profileData?.image?.startsWith('http') ? profileData.image : profileData?.image ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${profileData.image}` : `https://ui-avatars.com/api/?name=${profileData?.name}&background=6366f1&color=fff&size=128`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            id="profileImageUpload"
                            className="hidden"
                            onChange={handleProfileImageUpload}
                        />
                        <label htmlFor="profileImageUpload" className={`absolute -bottom-2 -right-2 bg-slate-900 text-white p-2.5 rounded-xl shadow-lg hover:bg-indigo-600 transition group-hover:scale-110 active:scale-95 cursor-pointer ${uploadingProfile ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Camera size={16} />
                        </label>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">{profileData?.name}</h1>
                            <span className="bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-200">
                                Verified Peer
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-3 justify-center md:justify-start">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                                <MapPin size={14} className="text-indigo-500" />
                                {profileData?.university}
                            </span>
                            <span className="text-slate-200 hidden md:block">|</span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                                <Package size={14} className="text-indigo-500" />
                                {stats.itemsShared} Items Shared
                            </span>
                        </div>
                        <p className="mt-4 text-sm text-slate-500 font-medium leading-relaxed max-w-xl italic">
                            {profileData?.bio || "No bio yet. Tell the student community about the gear you share!"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-slate-50 text-slate-400 p-4 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition border border-transparent hover:border-indigo-100"
                        >
                            <SettingsIcon size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">Student Settings</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Refine your peer-to-peer presence</p>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px]">Close</button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition shadow-inner italic"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition shadow-inner italic"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91-XXXXX-XXXXX"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Year of Study</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition shadow-inner italic"
                                        value={formData.yearOfStudy}
                                        onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                                        placeholder="3rd Year, Final Year, etc."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Enrollment ID</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition shadow-inner italic"
                                        value={formData.enrollmentId}
                                        onChange={(e) => setFormData({ ...formData, enrollmentId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Your Student Bio</label>
                                <textarea
                                    rows="4"
                                    className="w-full bg-slate-50 border-none rounded-3xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition shadow-inner italic resize-none"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell the community about what you share..."
                                />
                            </div>

                            <button type="submit" className="w-full bg-slate-900 text-white rounded-2xl py-5 font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-600 transition shadow-lg hover:scale-[1.01] active:scale-95 italic">
                                Save Profile Enhancements
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Impact Dashboard */}
            <div className="grid md:grid-cols-3 gap-6">
                <button onClick={() => { setMessage('Eco details feature coming soon!'); setTimeout(() => setMessage(''), 3000); }} className="text-left bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[2rem] shadow-lg shadow-indigo-100 text-white relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                    <Leaf className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1 italic">Eco Contribution</h3>
                    <p className="text-4xl font-black tracking-tight mb-2 italic">12kg <span className="text-sm opacity-80 font-bold uppercase tracking-widest">CO2</span></p>
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Saved by renting vs buying</p>
                </button>

                <button onClick={() => { setMessage('Viewing reviews feature coming soon!'); setTimeout(() => setMessage(''), 3000); }} className="text-left bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl group hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300">
                    <Heart className="text-rose-500 mb-4 group-hover:scale-110 transition" size={24} fill="currentColor" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">Community Karma</h3>
                    <p className="text-4xl font-black text-slate-900 tracking-tight mb-2 italic">4.9 <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Rating</span></p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">From student interactions</p>
                </button>

                <button onClick={() => { setMessage('Wallet insights coming soon!'); setTimeout(() => setMessage(''), 3000); }} className="text-left bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl group hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300">
                    <Shield className="text-indigo-600 mb-4 group-hover:scale-110 transition" size={24} fill="currentColor" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">Wallet Saved</h3>
                    <p className="text-4xl font-black text-slate-900 tracking-tight mb-2 italic">₹{stats.moneySaved} <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">INR</span></p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">By using student rentals</p>
                </button>
            </div>

            {/* Activity Tabs */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <button
                        onClick={() => setIsActivityOpen(!isActivityOpen)}
                        className="w-full flex items-center justify-between px-2 group hover:opacity-80 transition"
                    >
                        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">Recent Activity</h2>
                        <div className="bg-slate-100 p-1.5 rounded-full text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600 transition">
                            <ChevronDown size={20} className={`transform transition-transform duration-300 ${isActivityOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {isActivityOpen && (
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden transition-all animate-in fade-in slide-in-from-top-4 duration-300">
                            {activityData.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 font-bold text-sm italic">
                                    Your recent interactions will appear here.
                                </div>
                            ) : (
                                activityData.map((activity, index) => (
                                    <div key={activity._id || index} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition cursor-default">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activity.type === 'review_received' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {activity.type === 'review_received' ? <Heart size={20} /> : <Package size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 leading-tight">
                                                {activity.title}
                                            </p>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5 max-w-lg line-clamp-2">
                                                {activity.message}
                                            </p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 block">
                                                {new Date(activity.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic px-2">Privacy & Setup</h2>
                    <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-100">
                        <h4 className="font-black text-sm uppercase tracking-widest mb-4 italic">Verification Status</h4>
                        <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md mb-4 border border-white/10">
                            <Shield size={24} className="text-indigo-200" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-0.5">University Email</p>
                                <p className="text-xs font-bold italic">{profileData?.email}</p>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold opacity-70 italic leading-relaxed mb-4">
                            {profileData?.isVerified ? `Your account is verified at ${profileData?.university}. Only verified peers can see your full listings.` : `Your account is pending verification. Please upload your student ID to verify your profile.`}
                        </p>

                        {!profileData?.isVerified && (
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 mt-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-2">Upload ID Card</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="idCardUpload"
                                    className="hidden"
                                    onChange={handleIdUpload}
                                />
                                <label
                                    htmlFor="idCardUpload"
                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${uploadingId ? 'bg-indigo-400 text-indigo-100 cursor-not-allowed' : 'bg-white text-indigo-600 hover:bg-slate-50 shadow-md transform hover:scale-[1.02] active:scale-95'}`}
                                >
                                    <Camera size={16} />
                                    {uploadingId ? 'Uploading...' : 'Upload Student ID'}
                                </label>
                                {profileData?.idCardImage && (
                                    <p className="text-[9px] font-medium text-emerald-300 mt-2 text-center">ID Card uploaded. Awaiting admin review.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
