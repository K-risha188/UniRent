import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Plus, Trash, Sparkles } from 'lucide-react';
import AIPriceModal from '../components/AIPriceModal';

const CreateListing = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pricePerDay: '',
        securityDeposit: '',
        category: 'Electronics',
        existingImages: [],
        newFiles: []
    });
    const [loading, setLoading] = useState(false);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    
    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    
    const navigate = useNavigate();

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            // The video ref might not be available immediately because the modal needs to render first.
            // We set state to open the modal, then assign the stream in a timeout or effect.
            setIsCameraOpen(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check your browser permissions.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setFormData(prev => ({
                        ...prev,
                        newFiles: [...prev.newFiles, file]
                    }));
                    stopCamera();
                }
            }, 'image/jpeg', 0.8);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleApplyAI = (aiData) => {
        setFormData({
            ...formData,
            title: aiData.title,
            description: aiData.description,
            pricePerDay: String(aiData.pricePerDay),
            securityDeposit: String(aiData.securityDeposit),
            category: aiData.category
        });
    };

    const handleUrlAdd = () => {
        const url = prompt('Enter image URL');
        if (url) setFormData({ ...formData, existingImages: [...formData.existingImages, url] });
    };

    const handleFileAdd = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setFormData({ ...formData, newFiles: [...formData.newFiles, ...filesArray] });
        }
    };

    const handleRemoveExistingImage = (index) => {
        setFormData({
            ...formData,
            existingImages: formData.existingImages.filter((_, idx) => idx !== index)
        });
    };

    const handleRemoveNewFile = (index) => {
        setFormData({
            ...formData,
            newFiles: formData.newFiles.filter((_, idx) => idx !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('pricePerDay', formData.pricePerDay);
            submitData.append('securityDeposit', formData.securityDeposit);
            submitData.append('category', formData.category);

            formData.existingImages.forEach(url => {
                submitData.append('existingImages', url);
            });

            formData.newFiles.forEach(file => {
                submitData.append('images', file);
            });

            const token = sessionStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/items`, submitData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (res.data.moderationStatus === 'flagged') {
                alert(`⚠️ Safety Alert:\n\nYour listing "${res.data.title}" was flagged by automated moderation for inappropriate context:\n\n"${res.data.moderationReason}"\n\nIt has been hidden from public search and is pending review by the admin team.`);
                navigate('/dashboard');
            } else {
                navigate('/rentals');
            }
        } catch (error) {
            alert('Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-800">List an Item for Rent</h1>
            </div>

            {/* AI Listing Helper Banner */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between mb-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-800">Unsure about pricing or description?</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Let our intelligent AI helper write and price your listing.</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setAiModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                    <Sparkles size={12} />
                    Use AI Helper
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Item Title</label>
                    <input
                        name="title" required
                        value={formData.title}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="e.g. MacBook Pro M1 2021"
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                        name="description" required rows="5"
                        value={formData.description}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="Tell your peers about the item condition and what's included..."
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Price per Day (₹)</label>
                        <input
                            name="pricePerDay" type="number" required
                            value={formData.pricePerDay}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Security Deposit (₹)</label>
                        <input
                            name="securityDeposit" type="number" required
                            value={formData.securityDeposit}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                        onChange={handleChange}
                    >
                        <option>Electronics</option>
                        <option>Books</option>
                        <option>Lab Gear</option>
                        <option>Furniture</option>
                        <option>Calculators</option>
                        <option>Sports</option>
                        <option>Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Images</label>
                    <div className="flex gap-4 flex-wrap">
                        {/* Render existing URL images */}
                        {formData.existingImages.map((img, i) => (
                            <div key={`existing-${i}`} className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                                <img src={img} className="w-full h-full object-cover" alt="" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExistingImage(i)}
                                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"
                                >
                                    <Trash size={18} />
                                </button>
                                <span className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-[8px] font-bold px-1 rounded">URL</span>
                            </div>
                        ))}

                        {/* Render newly uploaded local files */}
                        {formData.newFiles.map((file, i) => (
                            <div key={`file-${i}`} className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveNewFile(i)}
                                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"
                                >
                                    <Trash size={18} />
                                </button>
                                <span className="absolute bottom-1 right-1 bg-indigo-600 bg-opacity-80 text-white text-[8px] font-bold px-1 rounded">FILE</span>
                            </div>
                        ))}

                        <div className="flex gap-2">
                            <label className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition cursor-pointer">
                                <Plus size={24} />
                                <span className="text-[10px] font-bold mt-1 uppercase text-center">Upload<br />File</span>
                                <input type="file" multiple accept="image/*" onChange={handleFileAdd} className="hidden" />
                            </label>

                            <button 
                                type="button"
                                onClick={startCamera}
                                className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition cursor-pointer"
                            >
                                <Camera size={24} />
                                <span className="text-[10px] font-bold mt-1 uppercase text-center">Take<br />Photo</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleUrlAdd}
                                className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition"
                            >
                                <Plus size={24} />
                                <span className="text-[10px] font-bold mt-1 uppercase text-center">Add<br />URL</span>
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2"
                >
                    {loading ? 'Creating...' : 'Publish Listing'}
                </button>
            </form>

            {/* WebRTC Camera Modal */}
            {isCameraOpen && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-[2rem] max-w-lg w-full flex flex-col items-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="w-full flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Camera className="text-indigo-600" size={24} /> 
                                Live Camera
                            </h3>
                            <button onClick={stopCamera} className="text-slate-400 hover:text-rose-500 font-black uppercase tracking-widest text-[10px] transition">
                                Close
                            </button>
                        </div>
                        <div className="w-full bg-slate-900 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border-4 border-slate-100 shadow-inner">
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover scale-x-[-1]"
                            ></video>
                        </div>
                        <button 
                            type="button" 
                            onClick={capturePhoto}
                            className="mt-8 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 text-white font-black uppercase tracking-widest text-xs px-10 py-4 rounded-2xl flex items-center gap-3 transition shadow-lg shadow-indigo-200"
                        >
                            <Camera size={18} className="animate-pulse" />
                            Capture Image
                        </button>
                    </div>
                </div>
            )}

            <AIPriceModal
                isOpen={aiModalOpen}
                onClose={() => setAiModalOpen(false)}
                onApply={handleApplyAI}
                currentData={formData}
            />
        </div>
    );
};

export default CreateListing;
