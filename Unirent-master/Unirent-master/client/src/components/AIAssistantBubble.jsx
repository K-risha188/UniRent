import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Sparkles, HelpCircle, Loader2 } from 'lucide-react';

const AIAssistantBubble = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'model',
            text: '👋 **Hello fellow student!** I am your **UniRent Campus Assistant AI**.\n\nAsk me anything about how renting works, wallets, safety policies, or deposits. You can also click one of the quick questions below!'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of conversation
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (textToSend) => {
        const messageText = textToSend || input;
        if (!messageText.trim()) return;

        if (!textToSend) setInput('');

        // Append user message
        const newMessages = [...messages, { role: 'user', text: messageText }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const token = sessionStorage.getItem('token');
            const historyData = newMessages.slice(1, -1); // Exclude the initial greeting and the newly added message

            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/chat`,
                {
                    message: messageText,
                    history: historyData
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setMessages(prev => [...prev, { role: 'model', text: res.data.reply }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [
                ...prev,
                { role: 'model', text: '⚠️ **Oops!** I had trouble reaching the support servers. Please verify you are logged in and try again.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleChipClick = (suggestion) => {
        handleSend(suggestion);
    };

    // Lightweight clean markdown formatter to render bold, list items, and headers elegantly
    const formatMessageText = (text) => {
        if (!text) return '';
        
        return text.split('\n').map((line, idx) => {
            let renderedLine = line;
            
            // 1. Process headers: ### title or **title**
            if (renderedLine.startsWith('###')) {
                return <h4 key={idx} className="font-black text-slate-800 text-sm mt-3 mb-1 italic">{renderedLine.replace('###', '').trim()}</h4>;
            }
            
            // 2. Process bullet lists: * item or - item
            const isBullet = renderedLine.trim().startsWith('*') || renderedLine.trim().startsWith('-');
            if (isBullet) {
                const cleanText = renderedLine.trim().replace(/^[\*\-]\s*/, '');
                return (
                    <li key={idx} className="list-disc ml-5 text-xs text-slate-600 font-medium my-0.5 leading-relaxed">
                        {renderBoldSegments(cleanText)}
                    </li>
                );
            }

            return (
                <p key={idx} className="text-xs text-slate-600 font-medium leading-relaxed my-1">
                    {renderBoldSegments(renderedLine)}
                </p>
            );
        });
    };

    const renderBoldSegments = (lineText) => {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(lineText)) !== null) {
            // Append plain text segment before the bold segment
            if (match.index > lastIndex) {
                parts.push(lineText.substring(lastIndex, match.index));
            }
            // Append bold segment
            parts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
            lastIndex = boldRegex.lastIndex;
        }

        if (lastIndex < lineText.length) {
            parts.push(lineText.substring(lastIndex));
        }

        return parts.length > 0 ? parts : lineText;
    };

    const suggestedChips = [
        "💰 How do deposits work?",
        "💳 Tell me about the wallet",
        "🔒 OTP & Verification details",
        "⚠️ My listing was flagged"
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Conversation Window */}
            {isOpen && (
                <div className="w-[380px] h-[520px] bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-6 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white flex items-center justify-between shadow-md relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12 blur-2xl" />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 animate-pulse">
                                <Sparkles size={18} className="text-indigo-200" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-widest italic">Campus AI Helper</h3>
                                <p className="text-[9px] font-bold text-indigo-200 mt-0.5">Online • Peer Support Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="bg-white/10 hover:bg-white/20 p-2.5 rounded-2xl text-white transition active:scale-95 border border-white/10 relative z-10"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end animate-in slide-in-from-right-4' : 'justify-start animate-in slide-in-from-left-4'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-[2rem] px-5 py-4 shadow-sm border ${
                                        msg.role === 'user'
                                            ? 'bg-slate-900 text-white rounded-tr-none border-slate-800'
                                            : 'bg-white text-slate-800 rounded-tl-none border-slate-100'
                                    }`}
                                >
                                    {msg.role === 'user' ? (
                                        <p className="text-xs font-semibold leading-relaxed">{msg.text}</p>
                                    ) : (
                                        <div>{formatMessageText(msg.text)}</div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading Typing Indicator */}
                        {loading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-white border border-slate-100 rounded-[2rem] rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1.5">
                                    <Loader2 size={12} className="animate-spin text-indigo-600" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assistant is typing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Chips */}
                    {messages.length === 1 && (
                        <div className="px-6 py-2 bg-slate-50/50 flex flex-wrap gap-2 shrink-0">
                            {suggestedChips.map((chip, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleChipClick(chip.substring(2))} // Strips emoji from prompt trigger
                                    className="text-[9px] font-black uppercase tracking-wider bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-100 hover:border-indigo-100 px-3 py-2 rounded-xl transition active:scale-95 shadow-sm"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Chat Input Footer */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="p-4 border-t border-slate-50 bg-white flex gap-3 items-center shrink-0"
                    >
                        <input
                            type="text"
                            placeholder="Ask me about deposits, phone OTP, etc..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition outline-none placeholder-slate-400 italic"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className={`p-3.5 rounded-2xl transition-all shadow-md ${
                                !input.trim() || loading
                                    ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
                                    : 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 hover:scale-[1.05]'
                            }`}
                        >
                            <Send size={14} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Badge Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 p-4 rounded-full shadow-2xl transition transform hover:scale-[1.08] active:scale-95 ${
                    isOpen 
                        ? 'bg-slate-950 text-white hover:bg-slate-800' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 animate-bounce'
                }`}
            >
                {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
                {!isOpen && (
                    <span className="text-[10px] font-black uppercase tracking-widest pr-2 hidden md:inline flex items-center gap-1">
                        <Sparkles size={10} fill="currentColor" /> AI Support
                    </span>
                )}
            </button>
        </div>
    );
};

export default AIAssistantBubble;
