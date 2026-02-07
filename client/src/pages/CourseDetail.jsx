
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiClock, FiBook, FiUser, FiCheckCircle, FiPlayCircle, FiLock, FiAward, FiArrowLeft, FiSearch, FiMoreVertical, FiPlay, FiFileText, FiHelpCircle, FiChevronRight, FiCheck } from 'react-icons/fi';
import { getToken, getUser } from '../utils/auth';
import { supabase } from '../supabase';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [progress, setProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourseDetail();
    }, [id]);

    const fetchCourseDetail = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${id}`);
            setCourse(res.data);

            const user = getUser();
            if (user) {
                const token = getToken();
                const myCoursesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/my-courses`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const enrollment = myCoursesRes.data.find(c => c.id === res.data.id);
                if (enrollment) {
                    setIsEnrolled(true);
                    setProgress(enrollment.progress || 0);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching course:', error);
            setLoading(false);
        }
    };

    const lessonsList = useMemo(() => {
        if (!course || !course.modules) return [];
        return course.modules.flatMap(m => (m.lessons || []).map(l => ({ ...l, moduleTitle: m.title })));
    }, [course]);

    const filteredLessons = lessonsList.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = useMemo(() => {
        const total = lessonsList.length;
        const done = Math.round((progress / 100) * total);
        return { total, done, left: total - done };
    }, [lessonsList, progress]);

    const startLearning = () => {
        if (lessonsList.length > 0) {
            // Find the first uncompleted lesson
            const nextLesson = lessonsList[stats.done] || lessonsList[0];
            navigate(`/learn/${course.id}/lesson/${nextLesson.id}`);
        } else {
            alert('This course has no lessons yet.');
        }
    };

    const handleEnroll = async () => {
        const user = getUser();
        if (!user) return navigate('/login');
        try {
            setEnrolling(true);
            const token = getToken();
            await axios.post(`${import.meta.env.VITE_API_URL}/api/courses/${id}/enroll`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEnrolled(true);
            setEnrolling(false);
            fetchCourseDetail();
        } catch (error) {
            console.error('Error enrolling:', error);
            setEnrolling(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6D4C6A]"></div>
        </div>
    );

    if (!course) return <div className="p-20 text-center font-black text-gray-200 uppercase tracking-widest">Course not found</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-[#333]">
            {/* Nav Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-12 h-20 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-12">
                    <Link to="/catalog" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#6D4C6A] rounded-xl flex items-center justify-center text-white">
                            <FiAward size={20} />
                        </div>
                        <span className="text-xl font-black text-gray-800 tracking-tight">EduFlow</span>
                    </Link>
                    <nav className="flex space-x-8 h-full">
                        <Link to="/catalog" className="text-gray-400 font-bold hover:text-gray-800 transition-colors py-7 border-b-[3px] border-transparent">Browse</Link>
                        <Link to="/courses" className="text-gray-800 font-bold py-7 border-b-[3px] border-[#6D4C6A]">My Learning</Link>
                    </nav>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Learner</p>
                        <p className="text-sm font-black text-gray-800">{getUser()?.full_name || 'Alex Johnson'}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#6D4C6A] rounded-full border-4 border-white shadow-sm overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getUser()?.email || 'learner'}`} alt="avatar" />
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-12 space-y-12 pb-32">
                {/* Hero Section */}
                <div className="relative h-[480px] rounded-[48px] overflow-hidden shadow-2xl flex items-center group">
                    <div className="absolute inset-0">
                        <img
                            src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'}
                            className="w-full h-full object-cover grayscale brightness-50 group-hover:scale-105 transition-transform duration-1000"
                            alt="hero"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#2D1F2B]/90 to-transparent"></div>
                    </div>

                    <div className="relative px-16 flex-1 flex flex-col md:flex-row items-center gap-16">
                        {/* Course Card Preview */}
                        <div className="w-[180px] h-[180px] bg-white/10 backdrop-blur-xl rounded-[40px] border border-white/20 p-6 flex items-center justify-center shadow-2xl">
                            <div className="w-full h-full bg-[#6D4C6A] rounded-[30px] flex items-center justify-center text-white/50">
                                <FiAward size={48} />
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                Professional Certification
                            </span>
                            <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
                                {course.title}
                            </h1>
                            <p className="text-white/60 text-lg max-w-2xl leading-relaxed font-medium">
                                {course.description || "Mastering the architecture and delivery of modern digital education environments."}
                            </p>
                        </div>
                    </div>

                    {/* Progress Sidebar Widget */}
                    <div className="hidden lg:block absolute right-12 top-12 bottom-12 w-[320px] bg-white rounded-[40px] shadow-2xl p-10 flex flex-col justify-between border border-gray-50">
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1">Current Progress</p>
                                    <h3 className="text-4xl font-black text-gray-800 tracking-tighter">{progress}% <span className="text-lg text-gray-400 font-bold tabular-nums">Complete</span></h3>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl text-gray-300">
                                    <FiAward size={20} />
                                </div>
                            </div>

                            <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#6D4C6A] rounded-full transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <div className="text-center p-4 bg-gray-50 rounded-3xl">
                                    <p className="text-lg font-black text-gray-800">{stats.total}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mt-1">Lessons</p>
                                </div>
                                <div className="text-center p-4 bg-emerald-50 text-emerald-600 rounded-3xl">
                                    <p className="text-lg font-black">{stats.done}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mt-1">Done</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 text-[#6D4C6A] rounded-3xl">
                                    <p className="text-lg font-black">{stats.left}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-plum-300 mt-1">Left</p>
                                </div>
                            </div>
                        </div>

                        {!isEnrolled ? (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="w-full py-5 bg-[#6D4C6A] text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-200 disabled:opacity-50"
                            >
                                {enrolling ? "Enrolling..." : "Enroll Now"}
                            </button>
                        ) : (
                            <button
                                onClick={startLearning}
                                className="w-full py-5 bg-[#6D4C6A] text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-200 flex items-center justify-center space-x-3"
                            >
                                <span>{progress === 0 ? "Start Course" : "Resume"}</span>
                                <FiChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Info */}
                <div className="bg-white rounded-[48px] shadow-[0_20px_80px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
                    <div className="flex border-b border-gray-50">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-12 py-8 flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'overview' ? 'text-gray-800' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                            <FiFileText size={16} /> <span>Course Overview</span>
                            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#6D4C6A]"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-12 py-8 flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'reviews' ? 'text-gray-800' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                            <FiHelpCircle size={16} /> <span>Ratings and Reviews</span>
                            {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#6D4C6A]"></div>}
                        </button>
                    </div>

                    <div className="p-16">
                        {activeTab === 'overview' ? (
                            <div className="animate-fade-in-down">
                                <div className="flex justify-between items-center mb-12">
                                    <div>
                                        <h2 className="text-4xl font-black text-gray-800 tracking-tight mb-2">Curriculum Roadmap</h2>
                                        <p className="text-gray-400 font-bold text-sm tracking-tight capitalize">Track your path through {course.title}</p>
                                    </div>
                                    <div className="relative w-80">
                                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input
                                            type="text"
                                            placeholder="Search lessons..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-[#6D4C6A]/20 outline-none font-bold text-sm placeholder-gray-300 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {filteredLessons.map((lesson, i) => {
                                        const lessonProgressIdx = lessonsList.findIndex(l => l.id === lesson.id);
                                        const isDone = lessonProgressIdx < stats.done;
                                        const isCurrent = lessonProgressIdx === stats.done;
                                        const isLocked = lessonProgressIdx > stats.done && !isEnrolled;

                                        return (
                                            <div
                                                key={lesson.id}
                                                onClick={() => isEnrolled && !isLocked && navigate(`/learn/${course.id}/lesson/${lesson.id}`)}
                                                className={`group flex items-center justify-between p-8 rounded-[32px] border transition-all cursor-pointer ${isCurrent ? 'bg-purple-50/30 border-[#6D4C6A]/10 shadow-xl shadow-[#6D4C6A]/5 transform scale-[1.02]' : 'bg-white border-transparent hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center space-x-8">
                                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isDone ? 'bg-emerald-50 text-emerald-500' : isCurrent ? 'bg-[#6D4C6A] text-white' : 'bg-gray-50 text-gray-200'}`}>
                                                        {isDone ? <FiCheck size={24} /> : isLocked ? <FiLock size={20} /> : <div className="w-2.5 h-2.5 rounded-full bg-current opacity-30"></div>}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black text-gray-800 mb-1 group-hover:text-[#6D4C6A] transition-colors">{lesson.title}</h4>
                                                        <div className="flex items-center space-x-4 text-xs font-black uppercase tracking-widest text-gray-300">
                                                            <div className="flex items-center space-x-2">
                                                                {lesson.type === 'video' ? <FiPlay size={12} /> : lesson.type === 'quiz' ? <FiHelpCircle size={12} /> : <FiFileText size={12} />}
                                                                <span className="capitalize">{lesson.type}</span>
                                                            </div>
                                                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                            <div className="flex items-center space-x-2">
                                                                <FiClock size={12} />
                                                                <span>{lesson.duration || '15 mins'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-6">
                                                    {isCurrent && (
                                                        <button className="px-6 py-2.5 bg-[#6D4C6A] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-plum-200">
                                                            Resume
                                                        </button>
                                                    )}
                                                    <FiMoreVertical size={20} className="text-gray-100 group-hover:text-gray-300 transition-colors" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in-down py-10 text-center">
                                <FiHelpCircle size={48} className="mx-auto text-gray-100 mb-6" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Ratings and Reviews Coming Soon</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="py-16 px-12 border-t border-gray-100 bg-white flex flex-col items-center">
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-[#6D4C6A] rounded-lg flex items-center justify-center text-white">
                        <FiAward size={16} />
                    </div>
                    <span className="text-lg font-black text-gray-800 tracking-tight">EduFlow Learning</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">© 2024 Innovative Elearning Ecosystem. All Rights Reserved.</p>
            </footer>

            {/* Help Widget */}
            <button className="fixed bottom-12 right-12 w-16 h-16 bg-[#2D1F2B] text-white rounded-[24px] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
                <FiPlayCircle size={28} className="opacity-50 group-hover:opacity-100" />
            </button>
        </div>
    );
};

export default CourseDetail;
