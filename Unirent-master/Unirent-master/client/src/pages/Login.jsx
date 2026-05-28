import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20">
            <div className="card-premium">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-midnight-navy tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-slate-gray text-sm">Log in to your UniRent scholar account</p>
                </div>

                {error && <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-lg text-sm mb-8 font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-gray mb-2 ml-1">Email / Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-mist-gray border border-slate-200 rounded-lg focus:border-midnight-navy focus:bg-white outline-none transition-all pl-11"
                                placeholder="name@paruluniversity.ac.in or admin"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-gray mb-2 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-3 bg-mist-gray border border-slate-200 rounded-lg focus:border-midnight-navy focus:bg-white outline-none transition-all pl-11 pr-11"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        className="w-full bg-midnight-navy text-white py-3.5 rounded-lg font-bold hover:bg-opacity-95 transition-all shadow-lg active:scale-[0.98]"
                    >
                        Sign In
                    </button>
                </form>

                <p className="mt-10 text-center text-sm text-slate-gray">
                    Don't have an account? <Link to="/register" className="text-academy-gold font-bold hover:underline transition-all">Create account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
