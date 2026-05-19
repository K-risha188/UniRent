import React, { useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';

const ReviewForm = ({ itemId, bookingId, onComplete }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reviews`, {
                itemId,
                bookingId,
                rating,
                comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Review submitted!');
            onComplete();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3 italic">Rate your experience</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => setRating(num)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${rating >= num ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300 border border-slate-100'
                                }`}
                        >
                            <Star size={14} fill={rating >= num ? 'currentColor' : 'none'} />
                        </button>
                    ))}
                </div>
                <textarea
                    placeholder="What did you think of the gear? (e.g. 'Condition was great, owner was helpful')"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:italic"
                    rows="2"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                ></textarea>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition italic"
                >
                    {loading ? 'Submitting...' : 'Post Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
