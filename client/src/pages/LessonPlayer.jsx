
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMenu, FiChevronLeft, FiChevronRight, FiCheckCircle, FiCircle, FiPlayCircle, FiFileText, FiAward, FiLink } from 'react-icons/fi';
import { getToken, getUser } from '../utils/auth';
import QuizComponent from '../components/QuizComponent';
import PointsPopup from '../components/PointsPopup';

const LessonPlayer = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showPointsPopup, setShowPointsPopup] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);

    const fetchCourseAndProgress = async () => {
        try {
            const user = getUser();
            if (!user) {
                navigate('/login');
                return;
            }
            const token = getToken();

            // 1. Fetch Course Details
            const courseRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`);
            setCourse(courseRes.data);

            // 2. Fetch User Progress (Enrolled Courses)
            const myCoursesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/my-courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const enrollment = myCoursesRes.data.find(e => e.id === courseId || e.course_id === courseId);
            if (enrollment && enrollment.completed_lessons) {
                setCompletedLessons(enrollment.completed_lessons);
            }

            // 3. Find current lesson
            const allLessons = courseRes.data.modules.flatMap(m => m.lessons || []);
            const lesson = allLessons.find(l => l.id === lessonId);
            setCurrentLesson(lesson);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching course data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseAndProgress();
    }, [courseId, lessonId]);

    const handleLessonComplete = async () => {
        if (completedLessons.includes(lessonId)) return;

        try {
            const token = getToken();
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setCompletedLessons([...completedLessons, lessonId]);
                if (res.data.points_awarded) {
                    setEarnedPoints(res.data.points_awarded);
                    setShowPointsPopup(true);
                }
            }
        } catch (error) {
            console.error('Error completing lesson:', error);
        }
    };

    const handleCourseComplete = async () => {
        try {
            const token = getToken();
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/enrollments/${courseId}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                alert(`Congratulations! You've earned the ${res.data.badge_level} badge!`);
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error completing course:', error);
        }
    };

    const isCourseCompleted = () => {
        if (!course) return false;
        const allLessons = course.modules.flatMap(m => m.lessons || []);
        return allLessons.every(l => completedLessons.includes(l.id));
    };

    if (loading) return <div className="min-h-screen bg-[#0F070E] flex items-center justify-center"><div className="w-12 h-12 border-t-2 border-purple-500 rounded-full animate-spin"></div></div>;

    return (
        <div className="flex h-screen bg-[#0F070E] font-sans selection:bg-purple-500/30">
            {showPointsPopup && <PointsPopup points={earnedPoints} onClose={() => setShowPointsPopup(false)} />}

            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-96' : 'w-0'} bg-[#1E111C] border-r border-gray-800 transition-all duration-300 flex flex-col overflow-hidden z-40`}>
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-black text-white tracking-tight truncate">{course?.title}</h2>
                    <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                        <FiMenu size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {course?.modules?.map((module, idx) => (
                        <div key={module.id} className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2">Section {idx + 1}: {module.title}</h3>
                            <div className="space-y-1">
                                {module.lessons?.map((lesson) => {
                                    const isCompleted = completedLessons.includes(lesson.id);
                                    const isActive = lesson.id === parseInt(lessonId);
                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => navigate(`/learn/${courseId}/lesson/${lesson.id}`)}
                                            className={`w-full flex items-center p-3 rounded-2xl text-sm transition-all group ${isActive ? 'bg-[#6D4C6A] text-white shadow-xl shadow-purple-900/20' : 'hover:bg-white/5 text-gray-400'}`}
                                        >
                                            <div className={`mr-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isCompleted ? 'bg-blue-500/10 text-blue-400' : isActive ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-600 group-hover:bg-gray-700'}`}>
                                                {isCompleted ? <FiCheckCircle size={14} className="stroke-[3px]" /> : (lesson.type === 'video' ? <FiPlayCircle size={14} /> : <FiFileText size={14} />)}
                                            </div>
                                            <span className={`truncate text-left flex-1 font-bold ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{lesson.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={() => navigate(`/course/${courseId}`)} className="text-sm text-gray-400 hover:text-white flex items-center">
                        <FiChevronLeft className="mr-1" /> Back to Course Home
                    </button>
                    {isCourseCompleted() && (
                        <button
                            onClick={handleCourseComplete}
                            className="mt-4 w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center animate-pulse"
                        >
                            <FiAward className="mr-2" /> Get Certificate
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative">
                {!sidebarOpen && (
                    <button onClick={() => setSidebarOpen(true)} className="absolute top-4 left-4 z-50 bg-[#1E111C] p-2 rounded-xl shadow-xl text-white border border-gray-800 hover:bg-[#6D4C6A] transition-all">
                        <FiMenu />
                    </button>
                )}

                <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
                    <div className="max-w-4xl w-full">
                        {/* Renderer */}
                        {(() => {
                            const getEmbedUrl = (url) => {
                                if (!url) return "";
                                if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
                                if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
                                return url;
                            };

                            if (currentLesson?.type === 'video') {
                                const isBase64 = currentLesson.content_url?.startsWith('data:video');
                                return (
                                    <div className="aspect-w-16 aspect-h-9 bg-black rounded-[40px] overflow-hidden shadow-2xl mb-8 border border-[#6D4C6A]/20 flex items-center justify-center">
                                        {isBase64 ? (
                                            <video src={currentLesson.content_url} controls className="w-full h-full max-h-[600px] object-contain" />
                                        ) : (
                                            <iframe
                                                src={getEmbedUrl(currentLesson.content_url)}
                                                title={currentLesson.title}
                                                className="w-full h-full min-h-[500px]"
                                                frameBorder="0"
                                                allowFullScreen
                                            ></iframe>
                                        )}
                                    </div>
                                );
                            }

                            if (currentLesson?.type === 'quiz') {
                                return (
                                    <div className="mb-8">
                                        <QuizComponent lessonId={currentLesson.id} onComplete={handleLessonComplete} />
                                    </div>
                                );
                            }

                            if (currentLesson?.type === 'document' || currentLesson?.type === 'pdf' || currentLesson?.type === 'html') {
                                const isExternal = currentLesson.content_url && (currentLesson.content_url.startsWith('http') || currentLesson.content_url.startsWith('https')) && !currentLesson.content_url.toLowerCase().endsWith('.pdf');

                                if (isExternal) {
                                    return (
                                        <div className="bg-[#1E111C] p-12 rounded-[40px] shadow-xl min-h-[400px] mb-8 border border-[#6D4C6A]/20 flex flex-col items-center justify-center text-center">
                                            <div className="w-20 h-20 bg-[#6D4C6A] rounded-[30px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-purple-900/40">
                                                <FiFileText size={32} />
                                            </div>
                                            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">{currentLesson?.title}</h2>
                                            <a href={currentLesson.content_url} target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-white text-[#6D4C6A] rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-50 transition-all shadow-xl">
                                                Open External Content
                                            </a>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="mb-8 h-[800px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-700">
                                        <iframe src={currentLesson.content_url} title={currentLesson.title} className="w-full h-full border-none"></iframe>
                                    </div>
                                );
                            }

                            if (currentLesson?.type === 'image') {
                                return (
                                    <div className="mb-8 rounded-[40px] overflow-hidden shadow-2xl bg-[#1E111C] p-8 flex flex-col items-center">
                                        <img src={currentLesson.content_url} alt={currentLesson.title} className="max-w-full max-h-[70vh] object-contain rounded-2xl" />
                                        <h2 className="text-2xl font-black text-white mt-8 tracking-tight">{currentLesson?.title}</h2>
                                    </div>
                                );
                            }

                            if (currentLesson?.type === 'link') {
                                return (
                                    <div className="bg-[#1E111C] p-12 rounded-[40px] shadow-xl min-h-[400px] mb-8 border border-[#6D4C6A]/20 flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 bg-[#6D4C6A] rounded-[30px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-purple-900/40">
                                            <FiLink size={32} />
                                        </div>
                                        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">{currentLesson?.title}</h2>
                                        <a href={currentLesson.content_url} target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-white text-[#6D4C6A] rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-50 transition-all shadow-xl">
                                            Open Link
                                        </a>
                                    </div>
                                );
                            }

                            return (
                                <div className="bg-[#1E111C] p-12 rounded-[40px] shadow-xl min-h-[400px] mb-8 border border-[#6D4C6A]/10 text-white">
                                    <h1 className="text-3xl font-black mb-6">{currentLesson?.title}</h1>
                                    <div className="text-gray-400 leading-relaxed font-medium">{currentLesson?.text_content || 'No content provided.'}</div>
                                </div>
                            );
                        })()}

                        {/* Attachments Section */}
                        {currentLesson?.attachments && currentLesson.attachments.length > 0 && (
                            <div className="mb-8 bg-[#1E111C] p-8 rounded-[32px] border border-gray-800">
                                <h3 className="text-lg font-black text-white mb-6 flex items-center tracking-tight">
                                    <FiFileText className="mr-3 text-[#6D4C6A]" /> Attachments
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentLesson.attachments.map((att, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl group hover:bg-white/10 transition-all border border-transparent hover:border-[#6D4C6A]/30">
                                            <span className="text-sm font-bold text-gray-300 truncate mr-4">{att.name}</span>
                                            <a
                                                href={att.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#6D4C6A] hover:text-white text-[10px] font-black uppercase tracking-widest bg-white py-2 px-4 rounded-xl transition-all"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Download Lesson Material Button */}
                        {currentLesson?.allow_download && currentLesson?.content_url && (
                            <div className="mb-8">
                                <a
                                    href={currentLesson.content_url}
                                    download
                                    className="inline-flex items-center px-8 py-4 bg-white/5 border border-gray-800 text-gray-400 rounded-2xl font-bold text-sm hover:bg-white/10 hover:text-white transition-all group"
                                >
                                    <FiFileText size={18} className="mr-3 group-hover:text-[#6D4C6A]" /> Download Lesson Content
                                </a>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-12 bg-[#1E111C] p-6 rounded-[32px] border border-gray-800">
                            <button
                                onClick={() => {
                                    const allLessons = course.modules.flatMap(m => m.lessons || []);
                                    const idx = allLessons.findIndex(l => l.id === lessonId);
                                    if (idx > 0) navigate(`/learn/${courseId}/lesson/${allLessons[idx - 1].id}`);
                                }}
                                className="text-gray-400 font-bold hover:text-white transition-colors flex items-center"
                            >
                                <FiChevronLeft className="mr-2" /> Previous
                            </button>

                            <button
                                onClick={handleLessonComplete}
                                className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center ${completedLessons.includes(lessonId) ? 'bg-green-500/10 text-green-500 cursor-default' : 'bg-[#6D4C6A] text-white hover:bg-[#5A3E57] shadow-xl shadow-purple-900/20'}`}
                            >
                                {completedLessons.includes(lessonId) ? 'Completed' : 'Mark as Complete'} <FiChevronRight className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonPlayer;
