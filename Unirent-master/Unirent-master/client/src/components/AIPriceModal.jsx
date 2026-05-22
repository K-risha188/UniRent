import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Loader2, Check, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const AIPriceModal = ({ isOpen, onClose, onApply, currentData }) => {
  const [originalPrice, setOriginalPrice] = useState(currentData?.securityDeposit ? currentData.securityDeposit * 5 : '');
  const [condition, setCondition] = useState('Good');
  const [category, setCategory] = useState(currentData?.category || 'Electronics');
  const [itemName, setItemName] = useState(currentData?.title || '');
  const [draftDesc, setDraftDesc] = useState(currentData?.description || '');
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const runLoadingAnimation = () => {
    setLoadingStep(0);
    const steps = [
      "Analyzing item market values...",
      "Calculating optimal campus discount curves...",
      "Writing high-converting, professional description...",
      "Verifying listing campus safety guidelines..."
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setLoadingStep(currentStep);
      } else {
        clearInterval(interval);
      }
    }, 1200);

    return () => clearInterval(interval);
  };

  const handleGenerate = async () => {
    if (!itemName) {
      setError("Please provide the Item Name.");
      return;
    }
    if (!originalPrice || isNaN(originalPrice) || Number(originalPrice) <= 0) {
      setError("Please enter a valid original retail price.");
      return;
    }

    setError('');
    setLoading(true);
    const stopAnimation = runLoadingAnimation();

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/recommendation`,
        {
          name: itemName,
          category,
          condition,
          originalPrice: Number(originalPrice),
          description: draftDesc
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setRecommendation(response.data);
      } else {
        setError(response.data.message || "Failed to generate suggestions.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to the AI engine. Please try again.");
    } finally {
      stopAnimation();
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (recommendation) {
      onApply({
        title: recommendation.optimizedTitle,
        description: recommendation.optimizedDescription,
        pricePerDay: recommendation.recommendedPrice,
        securityDeposit: recommendation.recommendedDeposit,
        category: category
      });
      onClose();
    }
  };

  const loadingStepsText = [
    "Analyzing item market values...",
    "Calculating optimal campus discount curves...",
    "Writing high-converting, professional description...",
    "Verifying listing campus safety guidelines..."
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">UniRent AI Listing Helper</h2>
              <p className="text-xs text-indigo-700 font-medium mt-0.5">Optimize price, safety, and listing quality with Google Gemini</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 font-semibold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex-1">
          {error && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-sm font-medium">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!recommendation && !loading ? (
            /* Input Phase Form */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Item Name *</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. DJI Mavic Mini 2 Fly More Combo"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Original Retail Price (₹) *</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Original store price in INR"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Item Condition *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                  >
                    <option>New</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Item Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Draft Description (Optional)</label>
                <textarea
                  value={draftDesc}
                  onChange={(e) => setDraftDesc(e.target.value)}
                  placeholder="Paste your rough description here for AI enhancement..."
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 mt-6 text-sm"
              >
                <Sparkles size={16} />
                Generate AI Pricing & Optimization
              </button>
            </div>
          ) : loading ? (
            /* Loading Phase */
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Gemini AI Engine At Work</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">Our intelligent reasoning algorithms are running computations on your listing.</p>
              
              {/* Dynamic Loading Step Micro-messages */}
              <div className="mt-8 space-y-2 w-full max-w-xs">
                {loadingStepsText.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-left">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      loadingStep > idx 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : loadingStep === idx 
                          ? 'bg-indigo-100 text-indigo-700 animate-pulse' 
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {loadingStep > idx ? <Check size={12} /> : idx + 1}
                    </div>
                    <span className={`text-xs font-medium ${
                      loadingStep === idx ? 'text-indigo-600 font-bold' : loadingStep > idx ? 'text-slate-600' : 'text-slate-400'
                    }`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Recommendations Results Dashboard */
            <div className="space-y-6">
              {recommendation.isFallback && (
                <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs font-medium flex items-center gap-2">
                  <ShieldCheck size={14} />
                  <span>Showing optimized recommendations using standard marketplace price heuristics.</span>
                </div>
              )}

              {/* Recommended Prices Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-100 relative overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">AI Daily Rent</span>
                  <span className="text-3xl font-black text-indigo-900">₹{recommendation.recommendedPrice}</span>
                  <span className="text-[10px] text-indigo-800 font-semibold block mt-1">/ day</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-100 relative overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-1">AI Security Deposit</span>
                  <span className="text-3xl font-black text-purple-900">₹{recommendation.recommendedDeposit}</span>
                  <span className="text-[10px] text-purple-800 font-semibold block mt-1">Fully refundable</span>
                </div>
              </div>

              {/* Security and Policies */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                recommendation.safetyRating === 'safe' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <ShieldCheck size={20} className={recommendation.safetyRating === 'safe' ? 'text-emerald-600' : 'text-rose-600'} />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">AI Campus Safety Check</h4>
                  <p className="text-xs mt-0.5 font-medium">{recommendation.safetyReason}</p>
                </div>
              </div>

              {/* Optimizations Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Optimized Title</h4>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-800 text-sm">
                    {recommendation.optimizedTitle}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Optimized Description</h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-xs font-medium space-y-2 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {recommendation.optimizedDescription}
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="flex gap-3 mt-6 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setRecommendation(null)}
                  className="flex-1 border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition text-sm text-center"
                >
                  Modify Inputs
                </button>
                <button
                  type="button"
                  disabled={recommendation.safetyRating === 'unsafe'}
                  onClick={handleApply}
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply AI Suggestions
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPriceModal;
