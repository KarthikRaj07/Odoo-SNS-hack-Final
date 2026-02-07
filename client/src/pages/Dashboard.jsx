import React from 'react';
import { FiTrendingUp, FiAward, FiCalendar, FiClock } from 'react-icons/fi';

const Dashboard = () => {
    return (
        <div className="pt-20 px-8 pb-8 bg-gray-50 min-h-screen ml-64">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Welcome Section */}
                <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h2>
                        <p className="text-blue-100 mb-6">You've completed 70% of your weekly goal. Keep it up!</p>
                        <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                            Continue Learning
                        </button>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-20 transform translate-y-1/4 translate-x-1/4">
                        <FiAward size={200} />
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <h3 className="font-bold text-gray-700 mb-4">Your Progress</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <div className="text-blue-500 text-2xl font-bold mb-1">12</div>
                            <div className="text-xs text-blue-400 font-medium">Courses Completed</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl">
                            <div className="text-purple-500 text-2xl font-bold mb-1">45h</div>
                            <div className="text-xs text-purple-400 font-medium">Hours Spent</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl">
                            <div className="text-orange-500 text-2xl font-bold mb-1">850</div>
                            <div className="text-xs text-orange-400 font-medium">XP Points</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl">
                            <div className="text-green-500 text-2xl font-bold mb-1">5</div>
                            <div className="text-xs text-green-400 font-medium">Certificates</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Course Progress */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Current Courses</h3>

                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center">
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 mr-4"></div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <h4 className="font-bold text-gray-800">Advanced React Patterns</h4>
                                <span className="text-sm text-gray-500">75%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <div className="flex items-center text-xs text-gray-400 space-x-4">
                                <span className="flex items-center"><FiClock className="mr-1" /> 2h 15m remaining</span>
                                <span className="flex items-center"><FiCalendar className="mr-1" /> Last accessed 2h ago</span>
                            </div>
                        </div>
                        <button className="ml-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                            Resume
                        </button>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center">
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 mr-4"></div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <h4 className="font-bold text-gray-800">Data Science Fundamentals</h4>
                                <span className="text-sm text-gray-500">32%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                            </div>
                            <div className="flex items-center text-xs text-gray-400 space-x-4">
                                <span className="flex items-center"><FiClock className="mr-1" /> 12h remaining</span>
                                <span className="flex items-center"><FiCalendar className="mr-1" /> Last accessed 1d ago</span>
                            </div>
                        </div>
                        <button className="ml-4 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
                            Resume
                        </button>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Upcoming Classes */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                            Upcoming Classes
                            <span className="text-xs text-blue-500 cursor-pointer">View All</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                                    14
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">UX Design Workshop</h4>
                                    <p className="text-xs text-gray-500 mb-1">Today, 4:00 PM</p>
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Live</span>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                                    15
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Python Masterclass</h4>
                                    <p className="text-xs text-gray-500 mb-1">Tomorrow, 10:00 AM</p>
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Zoom</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard/Gamification */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                            Top Learners
                            <FiTrendingUp className="text-green-500" />
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">User {i}</p>
                                            <p className="text-xs text-gray-400">12{i}0 XP</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold ${i === 1 ? 'text-yellow-500' : i === 2 ? 'text-gray-400' : 'text-orange-400'}`}>#{i}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
