import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from 'firebase/auth';
import { FiGoogle, FiMail, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Simulate/Check logic
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
            console.error(err);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to sign in with Google.');
            console.error(err);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            return setError('Please enter your email address to reset password.');
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess('Password reset email sent! Check your inbox.');
            setIsResetting(false);
            setError('');
        } catch (err) {
            setError('Failed to send reset email. Ensure email is expected.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 relative overflow-hidden">

                {/* Decorative background blur */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

                <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h2>
                <p className="text-gray-400 text-center mb-8">Sign in to continue to LearnSphere</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center text-sm">
                        <FiAlertCircle className="mr-2 flex-shrink-0" /> {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6 flex items-center text-sm">
                        <FiCheckCircle className="mr-2 flex-shrink-0" /> {success}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="flex justify-end mt-2">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-blue-600/25"
                    >
                        Sign In
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg"
                >
                    <FiGoogle className="text-xl" />
                    <span>Google</span>
                </button>

                <p className="mt-8 text-center text-gray-400 text-sm">
                    Don't have an account? <a href="#" className="text-blue-400 hover:underline font-medium">Create free account</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
