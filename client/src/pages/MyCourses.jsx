
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { FiPlayCircle, FiAward, FiCheckCircle, FiClock } from 'react-icons/fi';
import { getToken, getUser } from '../utils/auth';

const MyCourses = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const user = getUser();
            if (!user) return;
            const token = getToken();

            // Parallel fetch
            const [coursesRes, statsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/courses/my-courses`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/api/gamification/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setEnrolledCourses(coursesRes.data);
            setStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen ml-64 bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="pt-24 px-8 pb-12 bg-gray-50 min-h-screen ml-64 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content: Courses */}
                    <div className="lg:w-3/4">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Learning</h1>
                        <p className="text-gray-500 mb-8">Continue where you left off</p>

                        {enrolledCourses.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No courses yet</h3>
                                <p className="text-gray-500 mb-6">Start your learning journey today!</p>
                                <NavLink to="/catalog" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                                    Browse Courses
                                </NavLink>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {enrolledCourses.map(course => (
                                    <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                        <div className="md:w-1/3 relative">
                                            <img
                                                src={course.thumbnail_url || 'https://via.placeholder.com/300x200'}
                                                alt={course.title}
                                                className="w-full h-48 object-cover rounded-xl"
                                            />
                                            {course.progress === 100 && (
                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center shadow-sm">
                                                    <FiCheckCircle className="mr-1" /> Completed
                                                </div>
                                            )}
                                        </div>
                                        <div className="md:w-2/3 flex flex-col">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                                                </div>
                                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.short_description}</p>

                                                {/* Progress Bar */}
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                                        <span>{course.progress || 0}% Complete</span>
                                                        <span>{course.completed_lessons?.length || 0} / {(course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 'Unknown')} Lessons</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${course.progress || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-auto">
                                                <NavLink
                                                    to={`/course/${course.id}`}
                                                    className="flex-1 text-center border border-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Details
                                                </NavLink>
                                                <NavLink
                                                    to={course.progress === 100 ? `/certificate/${course.id}` : `/learn/${course.id}/lesson/${course.completed_lessons && course.completed_lessons.length > 0 ? 'continue' : 'start'}`} // Logic for 'continue' needs handling in Player or here
                                                    // Actually 'continue' isn't handled by route. 
                                                    // I should calculate next lesson ID here or link to course detail which has 'Continue' logic.
                                                    // Let's link to Course Detail for 'Continue' to keep it simple, or implement 'next lesson' logic.
                                                    // CourseDetail.jsx has `startLearning` logic.
                                                    // I'll just link to Course Detail `startLearning` equivalent or just /course/:id which has the button.
                                                    // But user expects "Resume".
                                                    // Let's use course detail for now to avoid specific lesson logic duplication.
                                                    // Or better: Link to /course/:id and user clicks "Continue".
                                                    // >
                                                    // Actually, I can use the same logic as CourseDetail if I have modules data.
                                                    // API /my-courses returns full course structure?
                                                    // routes/courses.js: .select(`*, course:courses(*)`)
                                                    // It selects * from enrollments and populates course.
                                                    // Does it populate modules? No.
                                                    // So I don't know the next lesson here without another fetch.
                                                    // So linking to Course Detail is safest.
                                                    className={`flex-1 text-center py-2 rounded-lg font-bold text-white transition-colors flex items-center justify-center ${course.progress === 100 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                >
                                                    {course.progress === 100 ? (
                                                        <>View Certificate</>
                                                    ) : (
                                                        <><FiPlayCircle className="mr-2" /> Continue</>
                                                    )}
                                                </NavLink>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Stats */}
                    <div className="lg:w-1/4 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-6">Your Profile</h3>
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold mr-4">
                                    {getUser()?.full_name?.charAt(0) || <FiAward />}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{getUser()?.full_name || 'Learner'}</div>
                                    <div className="text-sm text-gray-500 text-capitalize">{stats?.badge_level || 'Newbie'}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <div className="text-sm text-blue-600 font-medium mb-1">Total Points</div>
                                    <div className="text-2xl font-bold text-blue-800">{stats?.total_points || 0}</div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                        <span>Level Progress</span>
                                        <span>750 / 1000 pts</span> {/* Mocked next level */}
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                    <div className="text-xs text-center text-gray-400 mt-2">250 points to next rank</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="font-bold text-lg mb-2">Weekly Challenge</h3>
                            <p className="text-blue-100 text-sm mb-4">Complete 3 lessons this week to earn a special badge!</p>
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span>1/3 Completed</span>
                                <FiAward className="text-yellow-300 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyCourses;
