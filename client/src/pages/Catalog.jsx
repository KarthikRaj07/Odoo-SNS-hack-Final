
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { FiSearch, FiFilter, FiUser } from 'react-icons/fi';

const Catalog = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('all');
    const [allTags, setAllTags] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setCourses(res.data);

            // Extract unique tags
            const tags = new Set();
            res.data.forEach(c => c.tags?.forEach(t => tags.add(t)));
            setAllTags(Array.from(tags));

            setLoading(false);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = selectedTag === 'all' || (course.tags && course.tags.includes(selectedTag));
        return matchesSearch && matchesTag;
    });

    return (
        <div className="pt-24 px-8 pb-12 bg-gray-50 min-h-screen ml-64 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Course Catalog</h1>
                        <p className="text-gray-500 mt-2">Discover new skills and advance your career</p>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all"
                            />
                        </div>
                        <button className="flex items-center justify-center bg-white px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 font-medium transition-colors shadow-sm">
                            <FiFilter className="mr-2" /> Filter
                        </button>
                    </div>
                </div>

                {/* Tag Filters */}
                {!loading && allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        <button
                            onClick={() => setSelectedTag('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTag === 'all'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            All Categories
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTag === tag
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}

                {/* Course Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
                                <div className="relative overflow-hidden h-48">
                                    <img
                                        src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                                        alt={course.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
                                        {course.access_rule === 'invitation' ? 'Invite Only' :
                                            course.access_rule === 'payment' ? `$${course.price}` : 'Free'}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex gap-2 mb-3">
                                        {(course.tags || []).map((tag, idx) => (
                                            <span key={idx} className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                        {course.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                        {course.short_description || course.description}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center text-sm text-gray-600">
                                            {course.instructor?.avatar_url ? (
                                                <img src={course.instructor.avatar_url} alt="" className="w-8 h-8 rounded-full mr-2 object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-gray-500">
                                                    <FiUser size={14} />
                                                </div>
                                            )}
                                            <span className="font-medium truncate max-w-[100px]">{course.instructor?.full_name || 'Instructor'}</span>
                                        </div>

                                        <NavLink
                                            to={`/course/${course.id}`}
                                            className="text-blue-600 font-bold text-sm hover:text-blue-700 hover:underline"
                                        >
                                            View Details →
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredCourses.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <FiSearch className="text-gray-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">No courses found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Catalog;
