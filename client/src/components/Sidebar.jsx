import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBookOpen, FiGrid, FiMonitor, FiMessageSquare, FiSettings } from 'react-icons/fi';

const Sidebar = () => {
    return (
        <div className="h-screen w-64 bg-gray-900 text-white fixed top-0 left-0 flex flex-col shadow-lg z-50">
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
                        <NavLink to="/classroom" className={({ isActive }) => `flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800 border-r-4 border-blue-500 text-blue-400' : 'text-gray-400'}`}>
                            <FiMonitor className="mr-3 text-xl" />
                            <span>Classroom</span>
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
                </ul>
            </nav>
            <div className="p-6 border-t border-gray-800">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        JD
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-semibold">John Doe</p>
                        <p className="text-xs text-gray-500">Student</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
