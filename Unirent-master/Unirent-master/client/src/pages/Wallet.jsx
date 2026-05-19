import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, RefreshCcw, Landmark, ShieldCheck } from 'lucide-react';

const Wallet = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/wallet`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBalance(response.data.balance);
            setTransactions(response.data.transactions);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching wallet:', err);
            setError('Failed to load wallet data.');
            setLoading(false);
        }
    };

    const handleTopUp = async (e) => {
        e.preventDefault();
        setError('');
        const amount = Number(topUpAmount);

        if (!amount || amount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        setProcessing(true);
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/wallet/topup`, { amount }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTopUpAmount('');
            fetchWalletData(); // Refresh data
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to top up wallet');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-black text-midnight-navy mb-8 font-outfit uppercase tracking-tight flex items-center gap-3">
                <WalletIcon className="text-academy-gold" size={32} />
                Virtual Wallet
            </h1>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-lg flex items-center gap-3">
                    <ShieldCheck size={20} className="text-rose-500" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Balance Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-midnight-navy to-slate-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <p className="text-slate-300 font-medium text-sm mb-1 uppercase tracking-widest">Available Balance</p>
                            <h2 className="text-5xl font-black font-outfit text-white">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-academy-gold bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm shadow-inner">
                            <ShieldCheck size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Secured via Escrow</span>
                        </div>
                    </div>
                </div>

                {/* Top Up Card */}
                <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-center">
                    <h3 className="font-bold text-midnight-navy mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-slate-400" />
                        Top Up Wallet
                    </h3>
                    <form onSubmit={handleTopUp} className="flex flex-col gap-3">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                type="number"
                                min="1"
                                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-academy-gold transition font-medium"
                                placeholder="Amount"
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                                disabled={processing}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-academy-gold hover:bg-amber-400 text-midnight-navy font-bold py-3 rounded-xl transition shadow-md shadow-amber-200 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {processing ? <RefreshCcw size={18} className="animate-spin" /> : <Landmark size={18} />}
                            {processing ? 'Processing...' : 'Add Funds'}
                        </button>
                        <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">For testing purposes, you can add unlimited simulated funds.</p>
                    </form>
                </div>
            </div>

            {/* Transaction History */}
            <h3 className="text-xl font-bold text-slate-800 mb-4 ml-1">Recent Activity</h3>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500 flex justify-center py-20">
                        <RefreshCcw size={32} className="animate-spin text-slate-300" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <CreditCard size={24} className="text-slate-300" />
                        </div>
                        <p className="font-medium">No transactions yet.</p>
                        <p className="text-sm mt-1">Add funds to start renting.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {transactions.map(tx => (
                            <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm leading-tight">{tx.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500 font-medium">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                                                {tx.purpose.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`font-bold font-outfit text-lg ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wallet;
