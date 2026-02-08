import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiChevronDown, FiChevronUp, FiVideo, FiFileText, FiHelpCircle, FiImage, FiSettings, FiAlignLeft, FiList, FiMoon, FiEye, FiMoreVertical, FiEdit2, FiX, FiGlobe, FiDollarSign, FiUsers, FiLink, FiCheckCircle, FiClock, FiAward } from 'react-icons/fi';
import { getToken, getUser } from '../../utils/auth';
import LessonEditor from '../../components/admin/LessonEditor';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;
    const [activeTab, setActiveTab] = useState('content');
    const [course, setCourse] = useState({
        title: '',
        description: '',
        price: 0,
        thumbnail_url: '',
        is_published: false,
        tags: ['Sales', 'CRM'],
        responsible: getUser()?.name || 'Instructor',
        visibility: 'everyone',
        access_rule: 'free',
        website: '',
    });
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [showLessonEditor, setShowLessonEditor] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [userRole, setUserRole] = useState(getUser()?.role || 'learner');

    const fetchCourseData = async () => {
        try {
            const token = getToken();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourse(prev => ({ ...prev, ...res.data }));
            setModules(res.data.modules || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching course:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isNew) fetchCourseData();
        const user = getUser();
        if (user) setUserRole(user.role);
    }, [id]);

    const handleSaveCourse = async () => {
        if (course.is_published && !course.website) {
            alert('Website field is mandatory for published courses!');
            setActiveTab('options');
            return;
        }

        try {
            setSaving(true);
            const token = getToken();
            let courseId = id;
            if (isNew) {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/courses`, course, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                courseId = res.data.id;
                // Auto create a default module for new courses
                await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/modules`,
                    { course_id: courseId, title: 'Main Module', order_index: 0 },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                navigate(`/admin/course/edit/${courseId}`, { replace: true });
            } else {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/courses/${id}`, course, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            alert('Course settings synchronized successfully!');
        } catch (err) {
            alert('Failed to save course settings');
        } finally {
            setSaving(false);
        }
    };

    const handleAddContent = () => {
        if (isNew) {
            alert('Please save the course title first!');
            return;
        }
        setEditingLesson(null);
        setShowLessonEditor(true);
    };

    const handleSaveLesson = async (lessonData) => {
        if (isNew || !id) return;
        try {
            const token = getToken();
            const { questions, ...lessonFields } = lessonData;
            let moduleId = modules[0]?.id;

            if (!moduleId) {
                const mRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/modules`,
                    { course_id: id, title: 'Main Module', order_index: 0 },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                moduleId = mRes.data.id;
            }

            if (editingLesson) {
                const validUpdateData = {
                    title: lessonFields.title,
                    type: lessonFields.type,
                    content_url: lessonFields.content_url,
                    text_content: lessonFields.text_content,
                    is_free: lessonFields.is_free,
                    settings: lessonFields.settings,
                    attachments: lessonFields.attachments,
                    duration: lessonFields.duration,
                    allow_download: lessonFields.allow_download
                };
                await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/lessons/${editingLesson.id}`, validUpdateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                const validLessonData = {
                    title: lessonFields.title,
                    type: lessonFields.type,
                    content_url: lessonFields.content_url,
                    text_content: lessonFields.text_content,
                    is_free: lessonFields.is_free,
                    module_id: moduleId,
                    attachments: lessonFields.attachments,
                    duration: lessonFields.duration,
                    allow_download: lessonFields.allow_download,
                    order_index: modules.flatMap(m => m.lessons || []).length
                };
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/lessons`, validLessonData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (questions) {
                    await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/lessons/${res.data.id}/questions`, { questions }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            }
            fetchCourseData();
            setShowLessonEditor(false);
            setEditingLesson(null);
        } catch (error) {
            alert('Error saving lesson content');
        }
    };

    const tabs = [
        { id: 'content', label: 'Content', icon: FiList },
        { id: 'description', label: 'Description', icon: FiAlignLeft },
        { id: 'options', label: 'Options', icon: FiSettings },
        { id: 'quiz', label: 'Quiz', icon: FiHelpCircle },
    ];

    const lessons = modules.flatMap(m => m.lessons || []);
    const quizzes = lessons.filter(l => l.type === 'quiz');

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-[#333]">
            {/* Nav Header */}
            <header className="bg-white border-b border-gray-100 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-12">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/admin')}>
                        <div className="w-10 h-10 bg-[#6D4C6A] rounded-xl flex items-center justify-center text-white">
                            <FiFileText size={20} />
                        </div>
                        <span className="text-xl font-black text-gray-800 tracking-tight tracking-tighter">EduFlow</span>
                    </div>
                    <nav className="flex space-x-8">
                        <button onClick={() => navigate('/admin/courses')} className="text-gray-400 font-bold hover:text-gray-800 transition-colors text-[10px] uppercase tracking-widest">Courses</button>
                        <button onClick={() => navigate('/admin/reports')} className="text-gray-400 font-bold hover:text-gray-800 transition-colors text-[10px] uppercase tracking-widest">Reporting</button>
                    </nav>
                </div>
                <div className="flex items-center space-x-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 bg-gray-50 text-[#6D4C6A] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100 shadow-sm"
                    >
                        Learner View
                    </button>
                    <button
                        onClick={handleSaveCourse}
                        disabled={saving}
                        className="px-8 py-3 bg-[#6D4C6A] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-100 disabled:opacity-50 flex items-center space-x-3"
                    >
                        <FiSave /> <span>{saving ? 'Syncing...' : 'Save Settings'}</span>
                    </button>
                    <button onClick={() => navigate('/admin/courses')} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-gray-600 transition-all">
                        <FiX size={20} />
                    </button>
                </div>
            </header>

            {/* Permission Warning */}
            {userRole !== 'admin' && userRole !== 'instructor' && (
                <div className="bg-red-500 text-white px-12 py-3 text-center text-sm font-black animate-pulse uppercase tracking-[0.2em]">
                    Permission Denied: Changes will not be persisted
                </div>
            )}

            {/* Course Backdrop & Overlay Info */}
            <div className="relative h-[240px] bg-[#6D4C6A] overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#6D4C6A]/60 to-[#F8F9FB]"></div>

                <main className="max-w-7xl mx-auto px-12 relative h-full flex flex-col justify-end pb-12">
                    <div className="flex items-end justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-widest">Course ID: {id?.substring(0, 8) || 'Draft'}</span>
                                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${course.is_published ? 'bg-[#10B981] text-white shadow-[#10B981]/20 shadow-lg' : 'bg-white/20 text-white'}`}>
                                    {course.is_published ? 'Published' : 'Draft Mode'}
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="Edit Course Title..."
                                value={course.title || ''}
                                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                className="bg-transparent text-5xl font-black text-white hover:bg-white/5 focus:bg-white/10 outline-none p-4 rounded-2xl w-full border-none transition-all placeholder-white/20"
                            />
                        </div>

                        <div className="flex flex-col items-end space-y-4">
                            <div
                                onClick={() => document.getElementById('banner-upload').click()}
                                className="w-[180px] h-[100px] border-2 border-dashed border-white/30 rounded-3xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 cursor-pointer transition-all overflow-hidden relative shadow-2xl"
                            >
                                <input id="banner-upload" type="file" className="hidden" accept="image/*" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setCourse({ ...course, thumbnail_url: reader.result });
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className="text-white/60 flex flex-col items-center">
                                        <FiImage size={24} className="mb-2" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Upload Banner</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Content Tabs Nav */}
            <div className="max-w-7xl mx-auto w-full px-12 -mt-6 z-10">
                <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 flex p-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-3 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === tab.id ? 'bg-[#6D4C6A] text-white shadow-xl shadow-purple-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Tab View */}
            <main className="flex-1 p-12 max-w-7xl mx-auto w-full pb-32">
                <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 p-12 min-h-[500px]">

                    {activeTab === 'content' && (
                        <div className="animate-fade-in-down space-y-10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Curriculum Builder</h3>
                                <button
                                    onClick={handleAddContent}
                                    className="flex items-center space-x-3 px-8 py-4 bg-[#6D4C6A] text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-50"
                                >
                                    <FiPlus /> <span>Add Lesson</span>
                                </button>
                            </div>

                            {lessons.length === 0 ? (
                                <div className="py-32 text-center border-4 border-dashed border-gray-50 rounded-[40px] bg-gray-50/20">
                                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-50 flex items-center justify-center mx-auto mb-6 text-gray-200">
                                        <FiList size={32} />
                                    </div>
                                    <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-[10px]">Your curriculum is empty. Start adding lessons!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {lessons.map((lesson, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-8 bg-white border border-gray-50 rounded-[32px] hover:shadow-2xl hover:border-[#6D4C6A]/10 transition-all group">
                                            <div className="flex items-center space-x-8">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#6D4C6A] group-hover:text-white transition-all">
                                                    {lesson.type === 'video' ? <FiVideo size={24} /> : lesson.type === 'quiz' ? <FiHelpCircle size={24} /> : <FiFileText size={24} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-gray-800 leading-tight mb-1">{lesson.title}</h4>
                                                    <div className="flex items-center space-x-6">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#6D4C6A] bg-[#6D4C6A]/5 px-3 py-1 rounded-lg capitalize">{lesson.type}</span>
                                                        {lesson.is_free && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg">Free Preview</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => {
                                                        setEditingLesson(lesson);
                                                        setShowLessonEditor(true);
                                                    }}
                                                    className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#6D4C6A] hover:text-white flex items-center justify-center transition-all"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all">
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'description' && (
                        <div className="animate-fade-in-down space-y-8 max-w-4xl mx-auto">
                            <div className="bg-purple-50 p-8 rounded-[32px] border border-[#6D4C6A]/10 flex items-start space-x-6">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#6D4C6A] shadow-sm">
                                    <FiAlignLeft size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-[#6D4C6A] uppercase tracking-widest mb-1">Course Storyboard</h4>
                                    <p className="text-xs font-bold text-gray-500">Provide an exhaustive description, curriculum highlights, and what students will achieve.</p>
                                </div>
                            </div>
                            <textarea
                                rows="15"
                                placeholder="Describe the journey..."
                                value={course.description || ''}
                                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                className="w-full bg-gray-50/50 rounded-[40px] p-12 outline-none border border-gray-100 focus:border-[#6D4C6A]/20 focus:bg-white transition-all font-medium text-gray-600 leading-[2] text-xl font-serif"
                            />
                        </div>
                    )}

                    {activeTab === 'quiz' && (
                        <div className="animate-fade-in-down space-y-10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Assessments Gallery</h3>
                            </div>
                            {quizzes.length === 0 ? (
                                <div className="py-32 text-center border-4 border-dashed border-gray-50 rounded-[40px]">
                                    <FiHelpCircle size={48} className="mx-auto text-gray-100 mb-6" />
                                    <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-[10px]">No quizzes found in this course modules.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {quizzes.map((q, i) => (
                                        <div key={i} className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-sm hover:shadow-2xl transition-all border-l-[10px] border-l-orange-400 group">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <FiAward size={24} />
                                                </div>
                                                <FiMoreVertical className="text-gray-200" />
                                            </div>
                                            <h4 className="text-lg font-black text-gray-800 mb-2 truncate">{q.title}</h4>
                                            <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest text-gray-300">
                                                <div className="flex items-center space-x-2"><FiCheckCircle /> <span>{q.quiz_questions?.length || 0} Items</span></div>
                                                <div className="flex items-center space-x-2"><FiClock /> <span>{q.duration || '15 Min'}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'options' && (
                        <div className="animate-fade-in-down space-y-12 max-w-4xl mx-auto pb-12">
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#6D4C6A] flex items-center space-x-3">
                                        <FiGlobe /> <span>Access & Visibility</span>
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400"><FiUsers size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-800">Visibility</p>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Who can see this course</p>
                                                </div>
                                            </div>
                                            <select
                                                value={course.visibility || 'everyone'}
                                                onChange={(e) => setCourse({ ...course, visibility: e.target.value })}
                                                className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none shadow-sm focus:ring-2 ring-[#6D4C6A]/20"
                                            >
                                                <option value="everyone">Public</option>
                                                <option value="signed_in">Members Only</option>
                                            </select>
                                        </div>

                                        <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400"><FiCheckCircle size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-800">Publishing Status</p>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Visibility in catalog</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setCourse({ ...course, is_published: !course.is_published })}
                                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${course.is_published ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white border border-gray-100 text-gray-400'}`}
                                            >
                                                {course.is_published ? 'Published' : 'Draft'}
                                            </button>
                                        </div>

                                        <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400"><FiAward size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-800">Access Rule</p>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Availability type</p>
                                                </div>
                                            </div>
                                            <select
                                                value={course.access_rule || 'free'}
                                                onChange={(e) => setCourse({ ...course, access_rule: e.target.value })}
                                                className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none shadow-sm focus:ring-2 ring-[#6D4C6A]/20"
                                            >
                                                <option value="free">Free</option>
                                                <option value="paid">Paid</option>
                                                <option value="request">On Request</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#6D4C6A] flex items-center space-x-3">
                                        <FiDollarSign /> <span>Financial Details</span>
                                    </h4>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 ml-1">Enrolment Price ($)</label>
                                        <input
                                            type="number"
                                            value={course.price || 0}
                                            onChange={(e) => setCourse({ ...course, price: e.target.value })}
                                            className="w-full bg-gray-50/50 border border-gray-100 rounded-3xl p-6 text-2xl font-black text-gray-800 outline-none focus:bg-white focus:border-[#6D4C6A]/30 transition-all font-sans"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-gray-50 flex flex-col space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#6D4C6A] flex items-center space-x-3">
                                    <FiGlobe /> <span>Publication Meta</span>
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 ml-1">Company Website URL</label>
                                        {course.is_published && !course.website && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100 mb-2">Required Field *</span>}
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-8 flex items-center text-gray-300 group-focus-within:text-[#6D4C6A] transition-colors">
                                            <FiLink />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="e.g: www.odoo-erp.com"
                                            value={course.website || ''}
                                            onChange={(e) => setCourse({ ...course, website: e.target.value })}
                                            className="w-full bg-gray-50/50 border border-gray-100 rounded-[32px] p-8 pl-16 text-lg font-bold text-gray-800 outline-none focus:bg-white focus:border-[#6D4C6A]/30 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Editor Modal */}
            <LessonEditor
                isOpen={showLessonEditor}
                onClose={() => setShowLessonEditor(false)}
                onSave={handleSaveLesson}
                initialData={editingLesson}
            />
        </div>
    );
};

export default CourseEditor;
