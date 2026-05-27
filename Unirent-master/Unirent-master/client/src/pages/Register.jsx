import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Landmark, Upload, Image as ImageIcon, Phone, Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        university: '',
        phone: ''
    });
    const [idCardImage, setIdCardImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIdCardImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email.endsWith('@paruluniversity.ac.in')) {
            setError('Please use your valid university email (@paruluniversity.ac.in)');
            return;
        }

        if (!idCardImage) {
            setError('Please upload your College ID Card for verification.');
            return;
        }

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('university', formData.university);
            data.append('phone', formData.phone);
            data.append('idCardImage', idCardImage);

            await register(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 mb-20">
            <div className="card-premium">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-midnight-navy tracking-tight mb-2">Join UniRent</h2>
                    <p className="text-slate-gray text-sm">Become part of the elite student marketplace</p>
                </div>

                {error && <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-lg text-sm mb-8 font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-gray mb-2 ml-1">Full Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-mist-gray border border-slate-200 rounded-lg focus:border-midnight-navy focus:bg-white outline-none transition-all pl-11"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-gray mb-2 ml-1">University Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-mist-gray border border-slate-200 rounded-lg focus:border-midnight-navy focus:bg-white outline-none transition-all pl-11"
                                placeholder="e.g. Parul University"
                                value={formData.university}
                                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                            />
                            <Landmark className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-gray mb-2 ml-1">University Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-mist-gray border border-slate-200 rounded-lg focus:border-midnight-navy focus:bg-white outline-none transition-all pl-11"
                                placeholder="name@paruluniversity.ac.in"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-gray mb-2 ml-1">Contact Number</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-mist-gray border border-slate-200 rounded-lg focus:border-midnight-navy focus:bg-white outline-none transition-all pl-11"
                                placeholder="e.g. +919876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-gray mb-2 ml-1">College ID Card</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="w-full px-4 py-3 bg-mist-gray border border-slate-200 border-dashed rounded-lg flex items-center justify-between cursor-pointer hover:border-midnight-navy transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Upload className="text-slate-400" size={18} />
                                    <span className="text-sm text-slate-500 font-medium">
                                        {idCardImage ? idCardImage.name : 'Upload your ID Card'}
                                    </span>
                                </div>
                                {previewUrl && (
                                    <div className="w-8 h-8 rounded shrink-0 overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                                        <img src={previewUrl} alt="ID Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 ml-1">For admin verification. Kept secure and private.</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-gray mb-2 ml-1">Security Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-3 bg-mist-gray border border-slate-200 rounded-lg focus:border-midnight-navy focus:bg-white outline-none transition-all pl-11 pr-11"
                                placeholder="Create a secure password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-slate-400 hover:text-midnight-navy transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-midnight-navy text-white py-3.5 rounded-lg font-bold hover:bg-opacity-95 transition-all shadow-lg active:scale-[0.98] mt-4"
                    >
                        Create Account
                    </button>
                </form>

                <p className="mt-10 text-center text-sm text-slate-gray">
                    Already an esteemed member? <Link to="/login" className="text-academy-gold font-bold hover:underline transition-all">Sign in here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
