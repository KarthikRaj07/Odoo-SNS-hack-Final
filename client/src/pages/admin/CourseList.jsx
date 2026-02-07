
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiLayout, FiList, FiGrid, FiMoon, FiShare2, FiClock, FiFileText, FiEye, FiFilter, FiLayers, FiStar, FiChevronDown } from 'react-icons/fi';
import { getToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = getToken();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShare = (id) => {
        const url = `${window.location.origin}/course/${id}`;
        navigator.clipboard.writeText(url);
        alert('Course link copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-[#333]">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-100 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-12">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/admin')}>
                        <div className="w-10 h-10 bg-[#6D4C6A] rounded-xl flex items-center justify-center text-white">
                            <FiFileText size={20} />
                        </div>
                        <span className="text-xl font-black text-gray-800 tracking-tight">EduFlow</span>
                    </div>

                    <nav className="flex space-x-8 h-full">
                        <button onClick={() => navigate('/admin/courses')} className="text-gray-800 font-black border-b-[3px] border-[#6D4C6A] h-20 px-2 flex items-center text-sm uppercase tracking-widest">Courses</button>
                        <button onClick={() => navigate('/admin/reports')} className="text-gray-400 font-bold hover:text-gray-600 transition-colors h-20 px-2 flex items-center text-sm uppercase tracking-widest">Reporting</button>
                        <button onClick={() => navigate('/admin')} className="text-gray-400 font-bold hover:text-gray-600 transition-colors h-20 px-2 flex items-center text-sm uppercase tracking-widest">Dashboard</button>
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
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                {/* Search and Action Bar */}
                <div className="flex items-center justify-between mb-12 bg-white p-3 rounded-[24px] border border-gray-100 shadow-sm">
                    <div className="flex items-center flex-1 space-x-6">
                        <div className="relative flex-1 max-w-md">
                            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-3 bg-gray-50/50 rounded-xl focus:outline-none text-gray-700 font-bold placeholder-gray-300 transition-all border border-transparent focus:bg-white focus:border-[#6D4C6A]/20"
                            />
                        </div>
                        <div className="h-8 w-[1px] bg-gray-100"></div>
                        <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-[#6D4C6A] transition-colors">
                                <FiFilter /> <span>Filter</span> <FiChevronDown />
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-[#6D4C6A] transition-colors">
                                <FiLayers /> <span>Group By</span> <FiChevronDown />
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-[#6D4C6A] transition-colors">
                                <FiStar /> <span>Favorites</span> <FiChevronDown />
                            </button>
                        </div>
                    </div>

                    <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100 ml-8">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-white text-[#6D4C6A] shadow-sm' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                            <FiGrid /> <span>Kanban</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-[#6D4C6A] shadow-sm' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                            <FiList /> <span>List</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-[#6D4C6A]/10 border-t-[#6D4C6A] rounded-full animate-spin"></div>
                        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-200">Loading catalog...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32 animate-fade-in-down">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="bg-white rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col relative group hover:shadow-2xl transition-all duration-500">
                                {/* Image Placeholder or Real */}
                                <div className="h-64 bg-gray-50 relative overflow-hidden">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-100">
                                            <FiFileText size={80} />
                                        </div>
                                    )}
                                    <div className={`absolute top-6 right-6 py-2 px-6 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${course.is_published ? 'bg-[#10B981]' : 'bg-[#6D4C6A]/40'}`}>
                                        {course.is_published ? 'Published' : 'Draft'}
                                    </div>
                                </div>

                                <div className="p-10">
                                    <h3 className="text-2xl font-black text-gray-800 mb-4 line-clamp-2 min-h-[4rem] tracking-tight group-hover:text-[#6D4C6A] transition-colors leading-tight">
                                        {course.title}
                                    </h3>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><FiEye size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Views</p>
                                                <p className="font-black text-gray-800 tracking-tighter">{course.views || 15}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-purple-50 text-[#6D4C6A] rounded-xl flex items-center justify-center"><FiClock size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Duration</p>
                                                <p className="font-black text-gray-800 tracking-tighter">04:30h</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="mt-10 flex space-x-4">
                                        <button
                                            onClick={() => navigate(`/admin/course/edit/${course.id}`)}
                                            className="flex-1 py-4 bg-[#6D4C6A] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleShare(course.id)}
                                            className="px-6 py-4 border-2 border-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-2xl transition-all"
                                        >
                                            <FiShare2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate('/admin/course/new')}
                className="fixed bottom-12 right-12 w-20 h-20 bg-[#6D4C6A] text-white rounded-[28px] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group rotate-45"
            >
                <FiPlus size={32} className="-rotate-45" />
            </button>
        </div>
    );
};

export default CourseList;
