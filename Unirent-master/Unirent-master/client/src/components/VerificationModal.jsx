import React from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';

const VerificationModal = ({ student, onClose, onApprove }) => {
    if (!student) return null;

    return (
        <div className="fixed inset-0 bg-midnight-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">

                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-mist-gray/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-academy-gold/20 text-academy-gold rounded-xl flex items-center justify-center">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-midnight-navy">Student ID Verification</h2>
                            <p className="text-sm font-medium text-slate-gray">Reviewing credentials for {student.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 space-y-6">
                        <div className="bg-mist-gray p-5 rounded-2xl border border-slate-100">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-gray mb-4">Scholar Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 mb-1">Full Legal Name</p>
                                    <p className="font-bold text-midnight-navy">{student.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 mb-1">Institution</p>
                                    <p className="font-bold text-midnight-navy">{student.university}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 mb-1">Academic Email</p>
                                    <p className="font-medium text-slate-700 break-all">{student.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 mb-1">Registration Date</p>
                                    <p className="font-medium text-slate-700">
                                        {new Date(student.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
                            <h4 className="text-amber-800 font-bold mb-2 text-sm flex items-center gap-2">
                                <ShieldCheck size={16} /> Verification Guide
                            </h4>
                            <ul className="text-xs text-amber-700/80 space-y-2 list-disc pl-4 font-medium">
                                <li>Ensure the ID card clearly displays the <strong>Parul University</strong> logo.</li>
                                <li>Check that the name matches precisely.</li>
                                <li>Look for any signs of tampering or forgery.</li>
                                <li>Verify the ID is currently valid (not expired).</li>
                            </ul>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center relative min-h-[400px]">
                        {student.idCardImage ? (
                            <img
                                src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${student.idCardImage}`}
                                alt="College ID Card"
                                className="w-full h-full object-contain hover:scale-110 transition-transform duration-500 cursor-zoom-in"
                            />
                        ) : (
                            <div className="text-center p-8">
                                <ShieldCheck className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-500 font-bold">No Image Provided</p>
                            </div>
                        )}
                        <span className="absolute bottom-4 right-4 bg-midnight-navy/80 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            Official Document
                        </span>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-mist-gray/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Review Later
                    </button>
                    <button
                        onClick={() => onApprove(student._id)}
                        className="px-6 py-3 font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 flex items-center gap-2"
                    >
                        <CheckCircle size={18} /> Approve Scholar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
