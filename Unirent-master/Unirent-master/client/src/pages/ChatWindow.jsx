import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Send, ChevronLeft, MapPin, Info, Send as SendIcon } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';

const ChatWindow = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [chat, setChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const scrollRef = useRef();

    useEffect(() => {
        const newSocket = io(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}`);
        setSocket(newSocket);
        newSocket.emit('join_chat', id);

        newSocket.on('receive_message', (data) => {
            setChat(prev => ({
                ...prev,
                messages: [...prev.messages, data]
            }));
        });

        return () => newSocket.close();
    }, [id]);

    useEffect(() => {
        const fetchChat = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/chats/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChat(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchChat();
    }, [id]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/chats/${id}/messages`, { text: newMessage }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const messageData = {
                ...res.data,
                chatId: id,
                sender: { _id: user.id, name: user.name }
            };

            socket.emit('send_message', messageData);
            setChat(prev => ({
                ...prev,
                messages: [...prev.messages, messageData]
            }));
            setNewMessage('');
        } catch (err) {
            console.error(err);
        }
    };

    if (!chat) return <div className="text-center py-20 font-black uppercase tracking-widest text-slate-300 bg-slate-50 min-h-screen">Loading secure chat...</div>;

    const otherParticipant = chat.participants.find(p => p._id !== user.id);

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[80vh] mb-8">
            {/* Header */}
            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Link to="/messages" className="p-2 hover:bg-white rounded-xl text-slate-400 group transition">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition" />
                    </Link>
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                        <img src={otherParticipant.image || `https://ui-avatars.com/api/?name=${otherParticipant.name}`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 tracking-tight italic">{otherParticipant.name}</h2>
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <MapPin size={8} className="text-indigo-500" />
                            {otherParticipant.university} Student
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 group cursor-pointer hover:border-indigo-100 transition">
                        <img src={chat.item?.images[0]} className="w-6 h-6 rounded-md object-cover" alt="" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter truncate max-w-[120px]">{chat.item?.title}</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-slate-50/30">
                {chat.messages.map((msg, i) => {
                    const isMe = msg.sender._id === user.id || msg.sender === user.id;
                    return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${isMe
                                ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none font-medium'
                                }`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <span className={`text-[9px] block mt-1 font-black uppercase tracking-widest opacity-60 ${isMe ? 'text-indigo-100 text-right' : 'text-slate-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-50">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a secure message to your peer..."
                        className="flex-1 bg-slate-100 border-none rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:italic transition-all focus:bg-white focus:shadow-sm"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 bg-slate-900 text-white p-3 rounded-xl hover:bg-indigo-600 transition hover:scale-105 active:scale-95 shadow-md group border border-indigo-500/0 hover:border-indigo-400/50"
                    >
                        <SendIcon size={18} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </form>
                <div className="mt-2 flex items-center justify-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">
                    <Shield size={10} className="text-indigo-200" />
                    Encrypted Peer-to-Peer Channel
                </div>
            </div>
        </div>
    );
};

// Internal icon for Shield
const Shield = ({ size, className }) => <Info size={size} className={className} />;

export default ChatWindow;
