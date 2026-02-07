import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiBell, FiMoon, FiGlobe, FiShield, FiSave, FiLogOut } from 'react-icons/fi';
import { getUser, clearAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const user = getUser();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    return (
        <div className="pt-24 px-8 pb-12 bg-[#F8F9FB] min-h-screen ml-64 font-sans text-[#333]">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tight">Settings</h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">Manage your account and preferences</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="md:col-span-1 space-y-2">
                        {[
                            { id: 'profile', label: 'Profile Settings', icon: FiUser },
                            { id: 'account', label: 'Account Security', icon: FiLock },
                            { id: 'notifications', label: 'Notifications', icon: FiBell },
                            { id: 'appearance', label: 'Appearance', icon: FiMoon },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${tab.id === 'profile' ? 'bg-white shadow-md text-[#6D4C6A]' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tab.id === 'profile' ? 'bg-[#6D4C6A] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <tab.icon size={18} />
                                </div>
                                <span className="text-sm font-black uppercase tracking-widest">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Profile Section */}
                        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 space-y-8">
                            <div className="flex items-center space-x-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-[#6D4C6A] to-[#2D1F2B] rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-xl">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-gray-800 tracking-tight">{user?.full_name || 'Your Name'}</h3>
                                    <p className="text-gray-400 font-medium">{user?.email || 'email@example.com'}</p>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-[#6D4C6A] hover:text-[#5A3E57] pt-2">Change Avatar</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue={user?.full_name}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-[#6D4C6A]/20 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue={user?.email}
                                        disabled
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none font-medium opacity-50 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 flex justify-between items-center">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 text-red-500 font-black uppercase tracking-widest text-[10px] hover:text-red-600 transition-colors"
                                >
                                    <FiLogOut /> <span>Sign Out</span>
                                </button>
                                <button className="px-8 py-4 bg-[#6D4C6A] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-100 flex items-center space-x-2">
                                    <FiSave /> <span>Save Profile</span>
                                </button>
                            </div>
                        </div>

                        {/* Additional Settings Card */}
                        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 space-y-8">
                            <h3 className="text-xl font-black text-gray-800 tracking-tight">Preferences</h3>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500">
                                            <FiBell />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-800">Email Notifications</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Learn about new courses</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-500">
                                            <FiMoon />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-800">Dark Mode</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Easier on the eyes</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
