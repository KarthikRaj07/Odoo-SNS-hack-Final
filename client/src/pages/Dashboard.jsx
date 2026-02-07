import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiTrendingUp, FiAward, FiCalendar, FiClock, FiBook, FiCheckCircle } from 'react-icons/fi';
import { getToken, getUser } from '../utils/auth';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_points: 0,
        badge_level: 'Newbie',
        completed_courses: 0,
        hours_spent: 0, // Placeholder as we don't track hours yet
        nextBadge: null,
        progressPercent: 0
    });
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const u = getUser();
        if (u) {
            setUser(u);
            fetchDashboardData(u);
        } else {
            setLoading(false);
            navigate('/login');
        }
    }, []);

    const fetchDashboardData = async (currentUser) => {
        try {
            const token = getToken();
            const headers = { Authorization: `Bearer ${token}` };

            // Parallel fetch
            const [statsRes, coursesRes, leaderboardRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/gamification/my-stats`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/courses/my-courses`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/gamification/leaderboard`, { headers })
            ]);

            setStats(prev => ({ ...prev, ...statsRes.data }));
            setCourses(coursesRes.data);
            setLeaderboard(leaderboardRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center ml-64 bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="pt-24 px-8 pb-12 bg-gray-50 min-h-screen ml-64 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

                {/* Welcome Section */}
                <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.displayName?.split(' ')[0] || 'Learner'}! 👋</h2>
                        <p className="text-blue-100 mb-6 max-w-lg">
                            You are currently a <span className="font-bold text-yellow-300">{stats.badge_level}</span>.
                            {stats.nextBadge ? ` Earn ${stats.pointsToNext} more points to become a ${stats.nextBadge.name}!` : ' You have reached the highest rank!'}
                        </p>
                        <button
                            onClick={() => navigate('/catalog')}
                            className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-md"
                        >
                            Explore New Courses
                        </button>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FiAward size={100} className="text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <FiTrendingUp className="text-blue-500" /> Your Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <div className="text-blue-600 text-2xl font-bold mb-1">{courses.filter(c => c.progress === 100).length}</div>
                            <div className="text-xs text-blue-400 font-medium uppercase tracking-wider">Completed</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl">
                            <div className="text-orange-500 text-2xl font-bold mb-1">{stats.total_points || 0}</div>
                            <div className="text-xs text-orange-400 font-medium uppercase tracking-wider">Total Points</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl col-span-2 flex items-center justify-between">
                            <div>
                                <div className="text-purple-600 text-lg font-bold mb-0.5">{stats.badge_level}</div>
                                <div className="text-xs text-purple-400 font-medium uppercase tracking-wider">Current Rank</div>
                            </div>
                            <FiAward className="text-purple-300 text-3xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Course Progress */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">My Courses</h3>
                        {courses.length > 0 && <span className="text-sm text-gray-500">{courses.length} Enrolled</span>}
                    </div>

                    {courses.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                <FiBook size={24} />
                            </div>
                            <h4 className="text-gray-800 font-semibold mb-2">No courses yet</h4>
                            <p className="text-gray-500 text-sm mb-4">Start your learning journey today.</p>
                            <button
                                onClick={() => navigate('/catalog')}
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Browse Catalog
                            </button>
                        </div>
                    ) : (
                        courses.map(course => (
                            <div key={course.enrollment_id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex item-start sm:items-center gap-4 group cursor-pointer" onClick={() => navigate(`/course/${course.id}`)}>
                                <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden relative">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            <FiBook />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-gray-800 truncate pr-4 group-hover:text-blue-600 transition-colors">{course.title}</h4>
                                        <span className="text-sm font-medium text-gray-500 flex-shrink-0">{Math.round(course.progress || 0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${course.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${course.progress || 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400 gap-4">
                                        {course.progress === 100 ? (
                                            <span className="flex items-center text-green-600 gap-1 font-medium"><FiCheckCircle /> Completed</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><FiClock /> {course.completed_lessons?.length || 0} lessons done</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/course/${course.id}`);
                                    }}
                                    className="hidden sm:block px-4 py-2 bg-gray-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
                                >
                                    {course.progress === 0 ? 'Start' : course.progress === 100 ? 'Review' : 'Continue'}
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Leaderboard Placeholder - To implement real leaderboard later */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                            Top Learners
                            <FiTrendingUp className="text-green-500" />
                        </h3>
                        <div className="space-y-4">
                            {leaderboard.slice(0, 5).map((learner, i) => (
                                <div key={learner.id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/leaderboard')}>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 mr-3 flex items-center justify-center overflow-hidden">
                                            {learner.avatar_url ? (
                                                <img src={learner.avatar_url} alt={learner.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-gray-400 font-bold text-xs">{learner.full_name?.[0] || 'L'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{learner.full_name || 'Learner'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{learner.badge_level}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-800">{learner.total_points}</p>
                                        <p className={`text-[10px] font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-blue-300'}`}>#{i + 1}</p>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => navigate('/leaderboard')}
                                className="w-full py-3 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gray-100 hover:text-gray-600 transition-all mt-2"
                            >
                                View Full Leaderboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
