
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiAward, FiUser, FiTrendingUp, FiChevronLeft, FiStar, FiZap } from 'react-icons/fi';
import { getToken, getUser } from '../utils/auth';

const Leaderboard = () => {
    const navigate = useNavigate();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        setCurrentUser(getUser());
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const token = getToken();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/gamification/leaderboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaders(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6D4C6A]"></div>
        </div>
    );

    const topThree = leaders.slice(0, 3);
    const rest = leaders.slice(3);

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-[#333] ml-64">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-12 h-24 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-6">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                        <FiChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center">
                            Hall of Fame <FiAward className="ml-3 text-yellow-500" />
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Top learners across the ecosystem</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#6D4C6A]">Your Rank</p>
                        <p className="text-sm font-black text-gray-800">
                            #{leaders.findIndex(l => l.id === currentUser?.id) + 1 || 'N/A'}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl border-2 border-[#6D4C6A]/10 p-1">
                        <div className="w-full h-full bg-gray-100 rounded-xl overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'learner'}`} alt="avatar" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-12 space-y-16 pb-32">

                {/* Podium Section */}
                <div className="relative pt-20 pb-10">
                    <div className="flex items-end justify-center perspective-1000 gap-4 md:gap-8">

                        {/* 2nd Place */}
                        {topThree[1] && (
                            <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-[32px] bg-white shadow-2xl border-4 border-gray-100 overflow-hidden relative z-10">
                                        <img src={topThree[1].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[1].email || '2'}`} className="w-full h-full object-cover" alt="2nd" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center text-gray-500 font-black z-20">2</div>
                                </div>
                                <div className="text-center mb-4">
                                    <p className="font-black text-gray-800 text-sm md:text-base truncate w-32">{topThree[1].full_name}</p>
                                    <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{topThree[1].badge_level}</p>
                                </div>
                                <div className="w-32 md:w-40 h-32 md:h-40 bg-gradient-to-b from-gray-100 to-gray-50 rounded-t-[40px] shadow-inner flex flex-col items-center justify-center border-x border-t border-white/50 relative">
                                    <FiTrendingUp className="text-gray-300 mb-2" size={24} />
                                    <span className="text-2xl font-black text-gray-700">{topThree[1].total_points}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Points</span>
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <div className="flex flex-col items-center animate-fade-in-up">
                                <div className="relative mb-8 -mt-10">
                                    <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[40px] bg-white shadow-3xl border-4 border-yellow-400 overflow-hidden relative z-10">
                                        <img src={topThree[0].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[0].email || '1'}`} className="w-full h-full object-cover" alt="1st" />
                                    </div>
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center text-white text-xl z-20 shadow-lg">
                                        <FiStar size={20} fill="white" />
                                    </div>
                                </div>
                                <div className="text-center mb-6">
                                    <p className="font-black text-gray-900 text-lg md:text-xl truncate w-40">{topThree[0].full_name}</p>
                                    <p className="text-[11px] font-black text-yellow-600 tracking-[0.2em] uppercase bg-yellow-400/10 px-4 py-1 rounded-full">{topThree[0].badge_level}</p>
                                </div>
                                <div className="w-36 md:w-48 h-48 md:h-56 bg-gradient-to-b from-[#6D4C6A] to-[#2D1F2B] rounded-t-[48px] shadow-3xl flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full opacity-10 flex flex-wrap gap-4 p-4 pointer-events-none">
                                        {[...Array(20)].map((_, i) => <FiStar key={i} size={10} />)}
                                    </div>
                                    <FiZap className="text-yellow-400 mb-2 animate-bounce" size={32} />
                                    <span className="text-4xl font-black text-white">{topThree[0].total_points}</span>
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Grand Master</span>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-[32px] bg-white shadow-2xl border-4 border-gray-100 overflow-hidden relative z-10">
                                        <img src={topThree[2].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[2].email || '3'}`} className="w-full h-full object-cover" alt="3rd" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-orange-400 rounded-full border-4 border-white flex items-center justify-center text-white font-black z-20">3</div>
                                </div>
                                <div className="text-center mb-4">
                                    <p className="font-black text-gray-800 text-sm md:text-base truncate w-32">{topThree[2].full_name}</p>
                                    <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{topThree[2].badge_level}</p>
                                </div>
                                <div className="w-32 md:w-40 h-24 md:h-32 bg-gradient-to-b from-orange-50 to-orange-100/50 rounded-t-[40px] shadow-inner flex flex-col items-center justify-center border-x border-t border-white/50 relative">
                                    <FiTrendingUp className="text-orange-300 mb-2" size={24} />
                                    <span className="text-2xl font-black text-gray-700">{topThree[2].total_points}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Points</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* List of Other Learners */}
                <div className="bg-white rounded-[48px] shadow-2xl p-8 border border-gray-100 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8 px-8">
                        <h2 className="text-xl font-black text-gray-800 tracking-tight">Ascending Competitors</h2>
                        <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing Top 100</div>
                    </div>

                    <div className="space-y-4">
                        {rest.map((user, index) => {
                            const isCurrentUser = currentUser && user.id === currentUser.id;
                            const rank = index + 4;
                            return (
                                <div
                                    key={user.id}
                                    className={`group flex items-center justify-between p-6 rounded-[32px] transition-all cursor-pointer border ${isCurrentUser ? 'bg-purple-50 border-[#6D4C6A]/20 shadow-xl' : 'bg-white border-transparent hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center space-x-8">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-300 text-lg group-hover:bg-[#6D4C6A] group-hover:text-white transition-all">
                                            {rank}
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                                <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || rank}`} alt="avatar" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-gray-800 group-hover:text-[#6D4C6A] transition-colors">{user.full_name || 'Anonymous Learner'}</h4>
                                                <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-500">
                                                    <span>{user.badge_level}</span>
                                                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                    <span className="text-blue-500">{user.courses_completed || 0} Courses</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center space-x-2 justify-end">
                                            <FiTrendingUp className="text-emerald-500" size={14} />
                                            <span className="text-2xl font-black text-gray-800 tracking-tighter tabular-nums">{user.total_points}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest uppercase">Cumulative Points</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {leaders.length === 0 && (
                        <div className="p-20 text-center">
                            <FiUser size={48} className="mx-auto text-gray-100 mb-6" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No learners found in current season</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Custom Styles for animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
            ` }} />
        </div>
    );
};

export default Leaderboard;
