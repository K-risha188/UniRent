import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(res.data);
                } catch (err) {
                    console.error('Failed to fetch user data', err);
                    sessionStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        fetchUserData();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/login`, { email, password });
        sessionStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (userData) => {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/register`, userData);
        sessionStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
