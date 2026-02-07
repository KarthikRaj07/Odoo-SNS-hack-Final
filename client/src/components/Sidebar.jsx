import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBookOpen, FiGrid, FiMonitor, FiMessageSquare, FiSettings, FiDollarSign, FiAward, FiShield } from 'react-icons/fi';
import { getUser } from '../utils/auth';
import { hasRole } from '../utils/rbac';

const Sidebar = () => {
    const user = getUser();

    return (
        <div className="h-screen w-64 bg-gray-900 text-white fixed top-0 left-0 flex flex-col shadow-lg z-50">
            {/* Sidebar Navigation */}
            <div className="p-6 text-2xl font-bold text-blue-400 border-b border-gray-800">
                LearnSphere
            </div>
            <nav className="flex-1 mt-6">
                <ul className="space-y-4">
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => `flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800 border-r-4 border-blue-500 text-blue-400' : 'text-gray-400'}`}>
                            <FiHome className="mr-3 text-xl" />
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/catalog" className={({ isActive }) => `flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800 border-r-4 border-blue-500 text-blue-400' : 'text-gray-400'}`}>
                            <FiGrid className="mr-3 text-xl" />
                            <span>Catalog</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/courses" className={({ isActive }) => `flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800 border-r-4 border-blue-500 text-blue-400' : 'text-gray-400'}`}>
                            <FiMonitor className="mr-3 text-xl" />
                            <span>My Learning</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/leaderboard" className={({ isActive }) => `flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800 border-r-4 border-blue-500 text-blue-400' : 'text-gray-400'}`}>
                            <FiAward className="mr-3 text-xl" />
                            <span>Leaderboard</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/messages" className={({ isActive }) => `flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800 border-r-4 border-blue-500 text-blue-400' : 'text-gray-400'}`}>
                            <FiMessageSquare className="mr-3 text-xl" />
                            <span>Messages</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings" className={({ isActive }) => `flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800 border-r-4 border-blue-500 text-blue-400' : 'text-gray-400'}`}>
                            <FiSettings className="mr-3 text-xl" />
                            <span>Settings</span>
                        </NavLink>
                    </li>

                    {hasRole(user, 'admin') && (
                        <>
                            <li className="pt-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Administration
                            </li>
                            <li>
                                <NavLink to="/admin" className={({ isActive }) => `flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800 border-r-4 border-blue-500 text-blue-400' : 'text-gray-400'}`}>
                                    <FiShield className="mr-3 text-xl" />
                                    <span>Admin Dashboard</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/courses" className={({ isActive }) => `flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800 border-r-4 border-blue-500 text-blue-400' : 'text-gray-400'}`}>
                                    <FiBookOpen className="mr-3 text-xl" />
                                    <span>Manage Courses</span>
                                </NavLink>
                            </li>
                        </>
                    )}

                </ul>
            </nav>
            <div className="p-6 border-t border-gray-800">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.full_name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-semibold truncate w-32">{user?.full_name || 'Guest'}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role || 'Visitor'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
