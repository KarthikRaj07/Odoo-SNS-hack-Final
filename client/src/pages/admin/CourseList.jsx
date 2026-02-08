import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiLayout, FiList, FiGrid, FiMoon, FiShare2, FiClock, FiFileText, FiEye, FiFilter, FiLayers, FiStar, FiChevronDown, FiX, FiMoreVertical, FiCheckCircle } from 'react-icons/fi';
import { getToken, getUser } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [creating, setCreating] = useState(false);
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

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!newCourseName.trim()) return;
        setCreating(true);
        try {
            const token = getToken();
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/courses`,
                { title: newCourseName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowCreateModal(false);
            setNewCourseName('');
            navigate(`/admin/course/edit/${res.data.id}`);
        } catch (error) {
            alert('Failed to create course');
        } finally {
            setCreating(false);
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
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 bg-gray-50 text-[#6D4C6A] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100 shadow-sm"
                    >
                        Learner View
                    </button>
                    <div className="w-10 h-10 bg-[#6D4C6A] rounded-full border-4 border-white shadow-sm overflow-hidden cursor-pointer" onClick={() => navigate('/settings')}>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getUser()?.email || 'admin'}`} alt="avatar" />
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
                                placeholder="Search courses..."
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
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-32">
                        <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center text-gray-200 mx-auto mb-6">
                            <FiFileText size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-800">No courses found</h3>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or create a new course.</p>
                    </div>
                ) : viewMode === 'kanban' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32 animate-fade-in-down">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="bg-white rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col relative group hover:shadow-2xl transition-all duration-500">
                                <div className="h-64 bg-gray-50 relative overflow-hidden">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-100">
                                            <FiFileText size={80} />
                                        </div>
                                    )}
                                    <div
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const token = getToken();
                                            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/courses/${course.id}`,
                                                { ...course, is_published: !course.is_published },
                                                { headers: { Authorization: `Bearer ${token}` } }
                                            );
                                            fetchCourses();
                                        }}
                                        className={`absolute top-6 right-6 py-2 px-6 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg cursor-pointer transition-all hover:scale-110 ${course.is_published ? 'bg-[#10B981]' : 'bg-[#6D4C6A]/60'}`}
                                    >
                                        {course.is_published ? 'Published' : 'Draft'}
                                    </div>
                                </div>

                                <div className="p-10">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {(course.tags || ['General']).map((tag, i) => (
                                            <span key={i} className="text-[8px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 px-2 py-1 rounded-md">{tag}</span>
                                        ))}
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-800 mb-4 line-clamp-2 min-h-[4rem] tracking-tight group-hover:text-[#6D4C6A] transition-colors leading-tight">
                                        {course.title}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><FiEye size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Views</p>
                                                <p className="font-black text-gray-800 tracking-tighter">{course.views_count || 0}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-purple-50 text-[#6D4C6A] rounded-xl flex items-center justify-center"><FiClock size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Lessons</p>
                                                <p className="font-black text-gray-800 tracking-tighter">{course.lessons_count || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex space-x-4">
                                        <button
                                            onClick={() => navigate(`/admin/course/edit/${course.id}`)}
                                            className="flex-1 py-4 bg-[#6D4C6A] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-50"
                                        >
                                            Edit Course
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
                ) : (
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden animate-fade-in-down">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] border-b border-gray-50">
                                    <th className="px-10 py-6">Course Name</th>
                                    <th className="px-6 py-6 text-center">Lessons</th>
                                    <th className="px-6 py-6 text-center">Views</th>
                                    <th className="px-6 py-6 text-center">Status</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCourses.map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-10 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                                                    {course.thumbnail_url ? <img src={course.thumbnail_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><FiFileText size={16} /></div>}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{course.title}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">{(course.tags || []).join(' • ')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-gray-400 text-sm">{course.lessons_count || 0}</td>
                                        <td className="px-6 py-5 text-center font-bold text-gray-400 text-sm">{course.views_count || 0}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${course.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-[#6D4C6A]'}`}>
                                                    {course.is_published ? 'Published' : 'Draft'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-5 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={async () => {
                                                        const token = getToken();
                                                        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/courses/${course.id}`,
                                                            { ...course, is_published: !course.is_published },
                                                            { headers: { Authorization: `Bearer ${token}` } }
                                                        );
                                                        fetchCourses();
                                                    }}
                                                    className={`p-2 transition-colors ${course.is_published ? 'text-emerald-500 hover:text-emerald-600' : 'text-gray-300 hover:text-[#6D4C6A]'}`}
                                                    title={course.is_published ? 'Unpublish' : 'Publish'}
                                                >
                                                    <FiCheckCircle size={16} />
                                                </button>
                                                <button onClick={() => navigate(`/admin/course/edit/${course.id}`)} className="p-2 text-gray-300 hover:text-[#6D4C6A] transition-colors"><FiEdit size={16} /></button>
                                                <button onClick={() => handleShare(course.id)} className="p-2 text-gray-300 hover:text-[#6D4C6A] transition-colors"><FiShare2 size={16} /></button>
                                                <button className="p-2 text-gray-300 hover:text-red-500 transition-colors"><FiTrash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => setShowCreateModal(true)}
                className="fixed bottom-12 right-12 w-20 h-20 bg-[#6D4C6A] text-white rounded-[28px] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group rotate-45"
            >
                <FiPlus size={32} className="-rotate-45" />
            </button>

            {/* Create Course Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2D1F2B]/60 backdrop-blur-md p-6">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 animate-scale-in">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Create New Course</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-300 hover:text-gray-600 transition-colors"><FiX size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateCourse} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-300">Course Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g: Master Odoo Basics"
                                    value={newCourseName}
                                    onChange={(e) => setNewCourseName(e.target.value)}
                                    className="w-full p-6 bg-gray-50 border border-transparent rounded-3xl font-bold text-gray-800 outline-none focus:bg-white focus:border-[#6D4C6A]/20 transition-all text-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creating || !newCourseName.trim()}
                                className="w-full py-6 bg-[#6D4C6A] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-100 disabled:opacity-50 flex items-center justify-center space-x-3"
                            >
                                <span>{creating ? 'Creating...' : 'Launch Course Builder'}</span>
                                {!creating && <FiCheckCircle />}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseList;
