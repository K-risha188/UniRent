import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Plus, Trash } from 'lucide-react';

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
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/items`, submitData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate('/rentals');
        } catch (error) {
            alert('Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">List an Item for Rent</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Item Title</label>
                    <input
                        name="title" required
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. MacBook Pro M1 2021"
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                        name="description" required rows="4"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Tell your peers about the item condition and what's included..."
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Price per Day (₹)</label>
                        <input
                            name="pricePerDay" type="number" required
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Security Deposit (₹)</label>
                        <input
                            name="securityDeposit" type="number" required
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                    <select
                        name="category"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
        </div>
    );
};

export default CreateListing;
