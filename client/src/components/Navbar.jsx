import React from 'react';
import { FiSearch, FiBell, FiUser } from 'react-icons/fi';

const Navbar = ({ title }) => {
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
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-300 transition-colors">
                    <FiUser />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
