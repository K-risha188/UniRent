import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MessageCircle, Search, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/chats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    if (loading) return <div className="text-center py-20">Loading conversations...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Student Messages</h1>
                <div className="bg-white border border-slate-100 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                    <Search size={16} className="text-slate-400" />
                    <input type="text" placeholder="Search chats..." className="bg-transparent outline-none text-sm font-medium text-slate-600" />
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-50 shadow-sm overflow-hidden">
                {chats.map(chat => {
                    const otherParticipant = chat.participants.find(p => p._id !== user.id);
                    const lastMessage = chat.messages[chat.messages.length - 1];

                    return (
                        <Link to={`/messages/${chat._id}`} key={chat._id} className="p-6 flex items-center gap-5 hover:bg-slate-50 transition group">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                                <img src={otherParticipant.image || `https://ui-avatars.com/api/?name=${otherParticipant.name}`} className="w-full h-full object-cover" alt="" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition truncate">
                                        {otherParticipant.name} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 opacity-60">@{otherParticipant.university}</span>
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={10} />
                                        {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded italic">
                                        Item: {chat.item?.title || 'General'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 truncate font-medium">
                                    {lastMessage ? lastMessage.text : 'Start a conversation about this item!'}
                                </p>
                            </div>
                        </Link>
                    );
                })}

                {chats.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <MessageCircle size={32} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm italic">No active conversations</p>
                        <p className="text-slate-500 text-xs mt-2">Chat with owners when you find something to rent!</p>
                        <Link to="/rentals" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition italic">
                            Browse Rentals
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
