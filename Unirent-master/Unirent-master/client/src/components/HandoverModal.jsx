import React, { useState } from 'react';
import { X, CheckCircle, PackageCheck, Camera, Plus, Trash } from 'lucide-react';

const HandoverModal = ({ isOpen, onClose, onConfirm, type, title, subtitle, submitting }) => {
    const [notes, setNotes] = useState('');
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [newFiles, setNewFiles] = useState([]);

    if (!isOpen) return null;

    const handleUrlAdd = () => {
        const url = prompt('Enter image URL');
        if (url) setExistingPhotos([...existingPhotos, url]);
    };

    const handleFileAdd = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setNewFiles([...newFiles, ...filesArray]);
        }
    };

    const handleRemoveExistingPhoto = (index) => {
        setExistingPhotos(existingPhotos.filter((_, idx) => idx !== index));
    };

    const handleRemoveNewFile = (index) => {
        setNewFiles(newFiles.filter((_, idx) => idx !== index));
    };

    const handleSubmit = () => {
        onConfirm({
            type,
            notes,
            existingPhotos,
            newFiles
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">

                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
                            <PackageCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight italic">{title}</h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{subtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-700 mb-4">
                            <Camera size={16} className="text-indigo-500" />
                            Proof of Condition
                        </label>
                        <p className="text-xs font-medium text-slate-500 mb-4">Upload photos of the item right now to lock in the condition and protect yourself from disputes.</p>

                        <div className="flex gap-4 flex-wrap">
                            {/* Render existing URL images */}
                            {existingPhotos.map((img, i) => (
                                <div key={`existing-${i}`} className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group shadow-sm">
                                    <img src={img} className="w-full h-full object-cover" alt="Condition" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingPhoto(i)}
                                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"
                                    >
                                        <Trash size={18} />
                                    </button>
                                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-bold px-1.5 rounded-md backdrop-blur-md">URL</span>
                                </div>
                            ))}

                            {/* Render newly uploaded local files */}
                            {newFiles.map((file, i) => (
                                <div key={`file-${i}`} className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group shadow-sm">
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Condition" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewFile(i)}
                                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"
                                    >
                                        <Trash size={18} />
                                    </button>
                                    <span className="absolute bottom-1 right-1 bg-indigo-600/80 text-white text-[8px] font-bold px-1.5 rounded-md backdrop-blur-md">FILE</span>
                                </div>
                            ))}

                            <div className="flex gap-3">
                                <label className="w-24 h-24 border-[2px] border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-slate-50 transition cursor-pointer">
                                    <Plus size={24} />
                                    <span className="text-[9px] font-black mt-2 uppercase text-center">Upload<br />File</span>
                                    <input type="file" multiple accept="image/*" onChange={handleFileAdd} className="hidden" />
                                </label>

                                <button
                                    type="button"
                                    onClick={handleUrlAdd}
                                    className="w-24 h-24 border-[2px] border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-slate-50 transition"
                                >
                                    <Plus size={24} />
                                    <span className="text-[9px] font-black mt-2 uppercase text-center">Add<br />URL</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-black uppercase tracking-widest text-slate-700 mb-3">Inspection Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            placeholder="e.g., Minor scratch on the lens cap, battery fully charged."
                            className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 bg-slate-50/50"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-6 py-3 font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-3 font-black uppercase tracking-widest text-[10px] text-white bg-indigo-600 rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                    >
                        {submitting ? 'Authenticating...' : (
                            <>
                                <CheckCircle size={16} /> Confirm Verification
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HandoverModal;
