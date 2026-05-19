import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Shield, Zap } from 'lucide-react';

const Home = () => {
    return (
        <div className="space-y-24 mb-20">
            {/* Hero Section */}
            <section className="text-center py-24 bg-mist-gray rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-academy-gold/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-midnight-navy/5 rounded-full blur-3xl"></div>

                <div className="relative z-10 px-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-midnight-navy mb-8 tracking-tight">
                        Rent Smarter, <br />
                        <span className="text-academy-gold">Study Harder.</span>
                    </h1>
                    <p className="text-lg text-slate-gray max-w-2xl mx-auto mb-12 leading-relaxed">
                        The trusted student-to-student marketplace for gear, tech, and books.
                        Join our verified campus community to save money and reduce waste.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link to="/rentals" className="bg-midnight-navy text-white px-10 py-4 rounded-lg text-lg font-bold hover:bg-opacity-95 transition-all shadow-lg flex items-center gap-3 group">
                            Explore Listings <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/register" className="bg-white text-midnight-navy border border-slate-200 px-10 py-4 rounded-lg text-lg font-bold hover:bg-slate-50 transition-all shadow-sm">
                            Become a Provider
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="grid md:grid-cols-3 gap-10 px-4">
                {[
                    { icon: <Zap className="text-academy-gold" />, title: "Campus-Quick", desc: "Access essential items within minutes from peers across your university." },
                    { icon: <Calendar className="text-midnight-navy" />, title: "Flexible Terms", desc: "Academic-aligned rental periods. Rent items for an hour, a day, or a full semester." },
                    { icon: <Shield className="text-academy-gold" />, title: "Verified Trust", desc: "Exclusive community for verified students. Safe, secure, and university-focused." },
                ].map((feature, i) => (
                    <div key={i} className="card-premium group hover:-translate-y-1 transition-all duration-300">
                        <div className="bg-mist-gray w-14 h-14 rounded-xl flex items-center justify-center mb-8 group-hover:bg-midnight-navy/5 transition-colors">
                            {React.cloneElement(feature.icon, { size: 28 })}
                        </div>
                        <h3 className="text-2xl font-bold text-midnight-navy mb-4">{feature.title}</h3>
                        <p className="text-slate-gray leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </section>

            {/* CTA Section */}
            <section className="bg-midnight-navy py-16 px-8 rounded-3xl text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to join your campus marketplace?</h2>
                <p className="text-white/70 max-w-xl mx-auto mb-10">Start saving or earning today by interacting with your university community.</p>
                <Link to="/register" className="bg-academy-gold text-midnight-navy px-8 py-3 rounded-lg font-bold hover:brightness-110 transition-all">
                    Get Started Now
                </Link>
            </section>
        </div>
    );
};

export default Home;
