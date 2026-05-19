import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Tag, Clock, SlidersHorizontal, ArrowRight, SearchX } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Rentals = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Parse the search query from the URL
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/items`);
                setItems(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    // Filter items based on the search query (title or category)
    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="text-center py-20 text-slate-gray font-medium">Loading rentals...</div>;

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-midnight-navy tracking-tight mb-2">Campus Marketplace</h1>
                    <p className="text-slate-gray">Discover quality items shared by your university peers.</p>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
                    <div className="flex items-center gap-2 px-4 py-2 bg-mist-gray rounded-lg text-midnight-navy font-bold text-sm border border-slate-200">
                        <SlidersHorizontal size={16} /> Filters
                    </div>
                    {['All', 'Electronics', 'Books', 'Furniture'].map(cat => (
                        <button key={cat} className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-gray hover:border-midnight-navy hover:text-midnight-navy transition whitespace-nowrap bg-white shadow-sm">
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredItems.map(item => {
                    const imageUrl = item.images?.[0]
                        ? (item.images[0].startsWith('http') ? item.images[0] : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${item.images[0]}`)
                        : 'https://via.placeholder.com/300?text=No+Image';

                    return (
                        <Link to={`/item/${item._id}`} key={item._id} className="card-premium p-0 overflow-hidden group hover:border-academy-gold/30 transition-all duration-300">
                            <div className="h-56 bg-mist-gray relative overflow-hidden">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                    alt={item.title}
                                />
                                <div className="absolute top-4 left-4 bg-midnight-navy/90 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                                    {item.category}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-midnight-navy text-lg mb-2 truncate group-hover:text-academy-gold transition-colors">{item.title}</h3>
                                <div className="flex items-center gap-1.5 text-slate-gray text-xs mb-6">
                                    <MapPin size={14} className="text-academy-gold" />
                                    <span className="font-medium">{item.university} Campus</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div>
                                        <span className="text-2xl font-bold text-midnight-navy tracking-tighter">₹{item.pricePerDay}</span>
                                        <span className="text-slate-gray text-[10px] font-bold uppercase tracking-wider ml-1">/ Day</span>
                                    </div>
                                    <button className="bg-mist-gray text-midnight-navy w-10 h-10 rounded-lg flex items-center justify-center hover:bg-midnight-navy hover:text-white transition-all shadow-sm">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-40 bg-mist-gray rounded-3xl border border-dashed border-slate-300">
                    <div className="flex justify-center mb-4 text-slate-400">
                        <SearchX size={48} strokeWidth={1.5} />
                    </div>
                    <p className="text-slate-gray font-bold text-lg">
                        {searchQuery ? `No results found for "${searchQuery}"` : "No listings available at the moment."}
                    </p>
                    <p className="text-slate-gray/60 mt-2">Try adjusting your search or check back later!</p>
                </div>
            )}
        </div>
    );
};

export default Rentals;
