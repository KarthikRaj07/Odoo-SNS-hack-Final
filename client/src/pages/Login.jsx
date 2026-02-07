import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiCheckCircle, FiAlertCircle, FiUser, FiBookOpen, FiMoon, FiSun } from "react-icons/fi";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to login');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) return setError('Password must be at least 6 characters');
        if (password !== confirmPassword) return setError('Passwords do not match');
        setIsLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, full_name: fullName })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setSuccess('Account created! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col relative overflow-hidden font-sans text-[#333]">
            {/* Top Navigation / Theme Toggle */}
            <div className="absolute top-8 right-8 z-50">
                <button className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-500">
                    <FiMoon />
                </button>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50"></div>

            {!isSignUp ? (
                /* --- SIGN IN VIEW (Centered Card) --- */
                <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 animate-fade-in">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#6D4C6A] mb-6 border border-gray-50">
                            <FiBookOpen size={32} />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                        <p className="text-gray-400 font-medium">Elevate your learning experience</p>
                    </div>

                    <div className="bg-white p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 w-full max-w-md">
                        <form onSubmit={handleLogin} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-1 py-3 bg-transparent border-b-2 border-gray-100 focus:border-[#6D4C6A] outline-none transition-all placeholder-gray-300"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-1 py-3 bg-transparent border-b-2 border-gray-100 focus:border-[#6D4C6A] outline-none transition-all placeholder-gray-300"
                                    required
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-[#6D4C6A] text-white font-bold rounded-2xl hover:bg-[#5A3E57] transition-all shadow-lg shadow-purple-100 disabled:opacity-70 uppercase tracking-widest text-sm"
                            >
                                {isLoading ? 'Authenticating...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-8 text-center space-y-4">
                            <button className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Forgot Password?</button>
                            <p className="text-xs text-gray-400 font-medium">
                                New here? <button onClick={() => setIsSignUp(true)} className="text-gray-800 font-black hover:underline">Create Account</button>
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- SIGN UP VIEW (Split Layout) --- */
                <div className="flex-1 flex items-center justify-center p-6 z-10 animate-fade-in">
                    <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 flex overflow-hidden w-full max-w-5xl min-h-[600px]">
                        {/* Left Side: Branding */}
                        <div className="w-1/2 p-16 flex flex-col justify-between border-r border-gray-50 bg-[#FCFDFF]">
                            <div>
                                <div className="flex items-center space-x-3 mb-12">
                                    <div className="w-10 h-10 bg-[#6D4C6A] rounded-xl flex items-center justify-center text-white">
                                        <FiBookOpen size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Platform Excellence</span>
                                </div>
                                <h1 className="text-5xl font-bold leading-tight text-gray-800 mb-8">
                                    Start your <br />
                                    <span className="text-[#6D4C6A]">learning journey</span> <br />
                                    with precision.
                                </h1>
                                <p className="text-gray-400 leading-relaxed max-w-xs font-medium">
                                    Access premium curriculum designed for the modern intellectual. Join our global community of thinkers.
                                </p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`w-10 h-10 rounded-full border-2 border-white ${['bg-gray-200', 'bg-gray-300', 'bg-gray-400'][i - 1]}`}></div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">10K+ Members</span>
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <div className="w-1/2 p-16 flex flex-col justify-center bg-white">
                            <div className="mb-10">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300 mb-4 inline-block border-b-2 border-gray-100 pb-1">Registration</h2>
                            </div>

                            <form onSubmit={handleSignUp} className="space-y-8">
                                <div className="space-y-2 group">
                                    <label className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                        <FiUser className="mr-2" /> Enter Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Johnathan Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-1 py-3 bg-transparent border-b-2 border-gray-100 focus:border-[#6D4C6A] outline-none transition-all placeholder-gray-200"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                        <span className="mr-2">@</span> Enter Email ID
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="email@platform.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-1 py-3 bg-transparent border-b-2 border-gray-100 focus:border-[#6D4C6A] outline-none transition-all placeholder-gray-200"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                        <FiLock className="mr-2" /> Enter Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-1 py-3 bg-transparent border-b-2 border-gray-100 focus:border-[#6D4C6A] outline-none transition-all placeholder-gray-200"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 pb-4">
                                    <label className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                        <FiCheckCircle className="mr-2" /> Re-enter Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-1 py-3 bg-transparent border-b-2 border-gray-100 focus:border-[#6D4C6A] outline-none transition-all placeholder-gray-200"
                                        required
                                    />
                                </div>

                                {error && <p className="text-red-500 text-xs font-bold uppercase tracking-tight">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-[#6D4C6A] text-white font-bold rounded-lg hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-50 disabled:opacity-70 uppercase tracking-widest text-xs"
                                >
                                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </form>

                            <div className="mt-8 text-center pt-6 border-t border-gray-100">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Already Registered?</p>
                                <button
                                    onClick={() => setIsSignUp(false)}
                                    className="w-full py-3 bg-white border border-gray-200 text-gray-500 font-bold rounded-lg hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Branding */}
            <div className="p-8 text-center animate-fade-in">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">
                    © 2024 Innovative Learning Ecosystem
                </span>
            </div>
        </div>
    );
};

export default Login;
