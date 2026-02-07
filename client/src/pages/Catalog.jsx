import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiStar, FiUser, FiClock, FiFilter } from 'react-icons/fi';

const Catalog = () => {
    // Mock Data for now, can be replaced with API call
    const [courses, setCourses] = useState([
        { id: 1, title: 'Introduction to React', instructor: 'John Doe', rating: 4.8, students: 120, image: 'https://placehold.co/600x400?text=React', duration: '5h', level: 'Beginner' },
        { id: 2, title: 'Advanced NodeJS', instructor: 'Jane Smith', rating: 4.9, students: 85, image: 'https://placehold.co/600x400?text=NodeJS', duration: '8h', level: 'Advanced' },
        { id: 3, title: 'UI/UX Design Principles', instructor: 'Bob Johnson', rating: 4.7, students: 200, image: 'https://placehold.co/600x400?text=UI/UX', duration: '6h', level: 'Intermediate' },
        { id: 4, title: 'Python for Data Science', instructor: 'Alice Williams', rating: 4.6, students: 150, image: 'https://placehold.co/600x400?text=Python', duration: '10h', level: 'Beginner' },
        { id: 5, title: 'Machine Learning Basics', instructor: 'Charlie Brown', rating: 4.9, students: 300, image: 'https://placehold.co/600x400?text=ML', duration: '12h', level: 'Advanced' },
        { id: 6, title: 'Cybersecurity Fundamentals', instructor: 'David Miller', rating: 4.5, students: 90, image: 'https://placehold.co/600x400?text=Security', duration: '4h', level: 'Beginner' }
    ]);

    // Try to fetch from server if running
    useEffect(() => {
        // Basic fetch
    }, []);

    return (
        <div className="pt-20 px-8 pb-8 bg-gray-50 min-h-screen ml-64">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Course Catalog</h2>
                    <p className="text-gray-500 mt-1">Explore thousands of courses from top experts</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                    <FiFilter className="mr-2" /> Filters
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="h-48 overflow-hidden relative">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                                {course.level}
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{course.category || 'Development'}</span>
                                <div className="flex items-center text-yellow-500 text-sm font-bold">
                                    <FiStar className="fill-current mr-1" /> {course.rating}
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">{course.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 flex items-center">
                                <FiUser className="mr-2" /> {course.instructor}
                            </p>

                            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                                <div className="flex items-center text-xs text-gray-400">
                                    <FiClock className="mr-1" /> {course.duration}
                                </div>
                                <button className="text-blue-600 font-semibold text-sm hover:underline">
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Catalog;
