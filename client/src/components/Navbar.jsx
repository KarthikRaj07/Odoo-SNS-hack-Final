import React, { useState } from 'react';
import { FiSearch, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../utils/auth';
import { hasRole } from '../utils/rbac';

const Navbar = ({ title }) => {
    const navigate = useNavigate();
    const user = getUser();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    return (
        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-8 fixed top-0 left-64 right-0 z-40 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64 transition-all"
                    />
                </div>
                <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
                    <FiBell className="text-xl" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center space-x-2 focus:outline-none"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors border border-blue-200">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="font-bold">{user?.full_name?.charAt(0) || <FiUser />}</span>
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.full_name || 'User'}</span>
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-fade-in-down">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.full_name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>

                            {hasRole(user, 'admin') && (
                                <>
                                    <button
                                        onClick={() => navigate('/admin')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                    >
                                        <FiSettings className="w-4 h-4" />
                                        <span>Admin Dashboard</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/admin/courses')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                    >
                                        <FiBookOpen className="w-4 h-4" />
                                        <span>Manage Courses</span>
                                    </button>
                                </>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                                <FiLogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
