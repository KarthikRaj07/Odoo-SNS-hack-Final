
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiBookOpen, FiDollarSign, FiActivity, FiFileText, FiMoon, FiMoreVertical, FiShare2, FiArrowRight, FiCheckCircle, FiClock, FiStar, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getToken, getUser } from '../../utils/auth';
import { supabase } from '../../supabase';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const user = getUser();
            if (!user) return;
            const token = getToken();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6D4C6A]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-[#333]">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-12">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#6D4C6A] rounded-xl flex items-center justify-center text-white">
                            <FiFileText size={20} />
                        </div>
                        <span className="text-xl font-black text-gray-800 tracking-tight">EduFlow</span>
                    </div>
                    <nav className="flex space-x-8 h-full font-medium">
                        <button onClick={() => navigate('/admin/courses')} className="text-gray-400 hover:text-gray-800 transition-colors h-20 px-2 flex items-center">Courses</button>
                        <button onClick={() => navigate('/admin/reports')} className="text-gray-400 hover:text-gray-800 transition-colors h-20 px-2 flex items-center">Reporting</button>
                        <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-800 transition-colors h-20 px-2 flex items-center border-b-[3px] border-[#6D4C6A] text-gray-800">Dashboard</button>
                    </nav>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex -space-x-2">
                        {['V', 'C', 'A'].map((initial, i) => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${['bg-purple-400', 'bg-pink-400', 'bg-emerald-400'][i]}`}>
                                {initial}
                            </div>
                        ))}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <FiMoon size={20} />
                    </button>
                </div>
            </header>

            {/* Sub Header / Action Bar */}
            <div className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-20 z-40 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                    <button className="px-6 py-2.5 bg-gray-50 text-gray-800 font-bold rounded-xl text-sm hover:bg-gray-100 transition-all border border-gray-100">
                        Review
                    </button>
                    <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
                    <button className="px-6 py-2.5 bg-[#FDE8E8] text-[#9B1C1C] font-bold rounded-xl text-sm hover:bg-red-100 transition-all">
                        Contact Attendees
                    </button>
                    <button
                        onClick={() => navigate('/admin/course/new')}
                        className="px-6 py-2.5 bg-[#F3F4F6] text-[#374151] font-bold rounded-xl text-sm hover:bg-gray-200 transition-all"
                    >
                        New Course
                    </button>
                </div>
                <div className="flex items-center space-x-6">
                    <button className="text-gray-400 hover:text-gray-600 p-2"><FiShare2 /></button>
                    <button className="text-gray-400 hover:text-gray-600 p-2"><FiMoreVertical /></button>
                </div>
            </div>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 text-blue-600' },
                        { label: 'Courses', value: stats.totalCourses, icon: FiBookOpen, color: 'from-purple-500 to-plum-600', bg: 'bg-purple-50 text-purple-600' },
                        { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 text-emerald-600' },
                        { label: 'Enrollments', value: stats.totalEnrollments, icon: FiActivity, color: 'from-orange-500 to-red-600', bg: 'bg-orange-50 text-orange-600' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50 flex items-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className={`p-5 rounded-2xl ${stat.bg} mr-6 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-800 tabular-nums tracking-tighter">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions & Reporting */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 p-10 flex flex-col justify-between group hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6D4C6A]/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
                        <div>
                            <div className="w-16 h-16 bg-[#6D4C6A] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-purple-100">
                                <FiBookOpen size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Manage Curriculum</h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-12 max-w-sm">Craft world-class learning experiences. Create courses, lessons, and interactive content with our powerful editor.</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/courses')}
                            className="bg-[#6D4C6A] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#5A3E57] transition-all shadow-2xl shadow-purple-100 flex items-center justify-center w-full md:w-max group"
                        >
                            <span>Go to Management</span>
                            <FiArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>

                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 p-10 flex flex-col justify-between group hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
                        <div>
                            <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-100">
                                <FiActivity size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Platform Reporting</h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-12 max-w-sm">Visualize your growth. Track student progress, revenue metrics, and platform engagement in real-time.</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/reports')}
                            className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-100 flex items-center justify-center w-full md:w-max group"
                        >
                            <span>View Analytics</span>
                            <FiArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Recent Activity Mini-List */}
                <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 p-10">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-300 mb-8">Recent Activity</h3>
                    <div className="space-y-6">
                        {[
                            { user: 'Victor S.', action: 'enrolled in', item: 'Odoo Basics', time: '2 mins ago', icon: FiCheckCircle, color: 'text-emerald-500' },
                            { user: 'Clara M.', action: 'completed', item: 'Advanced CRM', time: '15 mins ago', icon: FiStar, color: 'text-orange-500' },
                            { user: 'Alex P.', action: 'purchased', item: 'Sales Mastery', time: '1 hour ago', icon: FiDollarSign, color: 'text-blue-500' }
                        ].map((act, i) => (
                            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors rounded-xl px-4 -mx-4">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center ${act.color}`}>
                                        <act.icon size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">
                                            {act.user} <span className="text-gray-400 font-medium">{act.action}</span> <span className="text-[#6D4C6A]">{act.item}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-300 text-[10px] font-black uppercase tracking-widest">
                                    <FiClock className="mr-2" /> {act.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
