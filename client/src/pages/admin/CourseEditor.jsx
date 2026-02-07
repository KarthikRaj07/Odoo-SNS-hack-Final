
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiChevronDown, FiChevronUp, FiVideo, FiFileText, FiHelpCircle, FiImage, FiSettings, FiAlignLeft, FiList, FiMoon, FiEye, FiMoreVertical, FiEdit2, FiX } from 'react-icons/fi';
import { getToken, getUser } from '../../utils/auth';
import LessonEditor from '../../components/admin/LessonEditor';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;
    const [activeTab, setActiveTab] = useState('info');
    const [course, setCourse] = useState({
        title: '',
        description: '',
        price: 0,
        thumbnail_url: '',
        is_published: false,
        tags: ['Sales', 'CRM'],
        responsible: 'Course Owner Name',
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
            setCourse(res.data);
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
            alert('Settings saved');
        } catch (err) {
            alert('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const handleAddContent = () => {
        if (isNew) {
            alert('Please save the course info first!');
            return;
        }
        setEditingLesson(null);
        setShowLessonEditor(true);
    };

    const handleSaveLesson = async (lessonData) => {
        if (isNew || !id) {
            alert('Please save the course details first before adding lessons.');
            return;
        }
        try {
            const token = getToken();
            const { questions, ...lessonFields } = lessonData;
            let moduleId;
            let lessonId;

            // Get or create first module
            if (modules.length === 0) {
                const mRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/modules`,
                    { course_id: id, title: 'Main Module', order_index: 0 },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                moduleId = mRes.data.id;
            } else {
                // Use the first module, or create one if somehow the state is invalid
                moduleId = modules[0]?.id;
                if (!moduleId) {
                    const mRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/modules`,
                        { course_id: id, title: 'Main Module', order_index: 0 },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    moduleId = mRes.data.id;
                }
            }

            if (editingLesson) {
                lessonId = editingLesson.id;
                const validUpdateData = {
                    title: lessonFields.title,
                    type: lessonFields.type,
                    content_url: lessonFields.content_url,
                    text_content: lessonFields.text_content,
                    is_free: lessonFields.is_free,
                    settings: lessonFields.settings
                };
                await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/lessons/${lessonId}`, validUpdateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                if (!moduleId) {
                    throw new Error('Could not determine or create a module for this course.');
                }

                // Filter only valid database columns
                const validLessonData = {
                    title: lessonFields.title,
                    type: lessonFields.type,
                    content_url: lessonFields.content_url,
                    text_content: lessonFields.text_content,
                    is_free: lessonFields.is_free,
                    module_id: moduleId,
                    order_index: modules.flatMap(m => m.lessons || []).length
                };

                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/lessons`, validLessonData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                lessonId = res.data.id;
            }

            // Sync questions if any
            if (questions) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/lessons/${lessonId}/questions`,
                    { questions },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // Refresh data
            fetchCourseData();
            setShowLessonEditor(false);
            setEditingLesson(null);
        } catch (error) {
            console.error('Error saving lesson:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Failed to save lesson';
            alert(`Failed to save lesson: ${errorMsg}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-[#333]">
            {/* Main Header */}
            <header className="bg-white border-b border-gray-100 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-12">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/admin')}>
                        <div className="w-10 h-10 bg-[#6D4C6A] rounded-xl flex items-center justify-center text-white">
                            <FiFileText size={20} />
                        </div>
                        <span className="text-xl font-black text-gray-800 tracking-tight">EduFlow</span>
                    </div>
                    <nav className="flex space-x-8 h-full">
                        <button onClick={() => navigate('/admin/courses')} className="text-gray-400 font-medium hover:text-gray-600 transition-colors h-20 px-2 flex items-center">Courses</button>
                        <button className="text-gray-400 font-medium hover:text-gray-600 transition-colors h-20 px-2 flex items-center">Reporting</button>
                        <button className="text-gray-400 font-medium hover:text-gray-600 transition-colors h-20 px-2 flex items-center">Settings</button>
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
                    <button className="text-gray-400 hover:text-gray-600">
                        <FiMoon size={20} />
                    </button>
                </div>
            </header>

            {/* Permission Warning */}
            {userRole !== 'admin' && userRole !== 'instructor' && (
                <div className="bg-red-500 text-white px-12 py-3 text-center text-sm font-bold animate-pulse">
                    WARNING: You are logged in as a {userRole}. You do not have permission to save changes. Please log in as an Admin.
                </div>
            )}

            {/* Action Bar */}
            <div className="bg-white/80 backdrop-blur-md px-12 py-5 flex items-center justify-between sticky top-20 z-40 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/admin/course/new')} className="px-6 py-3 bg-[#6D4C6A] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-[#5A3E57] transition-all flex items-center space-x-2 shadow-lg shadow-purple-100">
                        <FiPlus /> <span>Create New</span>
                    </button>
                    <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
                    <button className="px-6 py-3 bg-white border border-gray-200 text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-gray-50 transition-all">
                        Message Students
                    </button>
                    <button className="px-6 py-3 bg-white border border-gray-200 text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-gray-50 transition-all">
                        Manage Enrollment
                    </button>
                </div>

                <div className="flex items-center space-x-10">
                    <div className="flex items-center space-x-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Published</p>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={course.is_published}
                                onChange={() => setCourse({ ...course, is_published: !course.is_published })}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                        </label>
                    </div>
                    <div className="h-6 w-[1px] bg-gray-100"></div>
                    <button
                        onClick={() => navigate(`/course/${id}`)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-[#6D4C6A] transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#6D4C6A]/10 transition-colors">
                            <FiEye size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest pt-0.5">Student View</span>
                    </button>
                    <div className="h-6 w-[1px] bg-gray-100 mx-2"></div>
                    <button
                        onClick={handleSaveCourse}
                        disabled={saving}
                        className="px-8 py-3 bg-[#6D4C6A] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-100 disabled:opacity-50 flex items-center space-x-2"
                    >
                        <FiSave /> <span>{saving ? 'Saving...' : 'Save settings'}</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Discard
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <main className="flex-1 p-8 max-w-6xl mx-auto w-full pb-32">
                <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-50 p-12 relative overflow-hidden">
                    {/* Header Details */}
                    <div className="flex justify-between items-start mb-12">
                        <div className="flex-1 max-w-2xl space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-1">Course Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g: Basics of Odoo CRM"
                                    value={course.title || ''}
                                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                    className="w-full text-4xl font-bold bg-transparent border-b-2 border-gray-100 focus:border-[#6D4C6A] outline-none py-2 placeholder-gray-100 text-gray-800 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-1">Tags</label>
                                <div className="flex items-center flex-wrap gap-2 border-b-2 border-gray-100 py-3">
                                    {course.tags.map((tag, i) => (
                                        <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
                                            {tag} <FiX className="ml-2 cursor-pointer text-gray-400 hover:text-red-500" />
                                        </span>
                                    ))}
                                    <input placeholder="Add tag..." className="outline-none bg-transparent text-sm ml-2 placeholder-gray-200" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-1">Responsible</label>
                                <input
                                    type="text"
                                    placeholder="Course Owner Name"
                                    value={course.responsible || ''}
                                    onChange={(e) => setCourse({ ...course, responsible: e.target.value })}
                                    className="w-full text-lg font-medium bg-transparent border-b-2 border-gray-100 focus:border-[#6D4C6A] outline-none py-2 placeholder-gray-100 text-gray-600 transition-all"
                                />
                            </div>
                        </div>

                        {/* Banner Upload Area */}
                        <div className="ml-12">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-4 block text-right">Course Banner</label>
                            <div
                                onClick={() => document.getElementById('banner-upload').click()}
                                className="w-[340px] h-[200px] border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center bg-gray-50/50 group cursor-pointer hover:border-[#6D4C6A]/30 transition-all relative overflow-hidden"
                            >
                                <input
                                    id="banner-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            // Mock upload: in a real app, you'd upload to Supabase/S3 here
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setCourse({ ...course, thumbnail_url: reader.result });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 group-hover:text-[#6D4C6A] transition-colors mb-4">
                                            <FiImage size={24} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-gray-500 transition-colors">Click to upload image</span>
                                    </>
                                )}
                                {course.thumbnail_url && (
                                    <div className="absolute top-4 right-4 flex space-x-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); document.getElementById('banner-upload').click(); }}
                                            className="p-2 bg-white/90 rounded-lg text-gray-500 hover:text-[#6D4C6A] shadow-sm"
                                        >
                                            <FiEdit2 size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCourse({ ...course, thumbnail_url: '' }); }}
                                            className="p-2 bg-white/90 rounded-lg text-gray-500 hover:text-red-500 shadow-sm"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 mb-10 overflow-x-auto">
                        {['Course Info', 'Content'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase().includes('info') ? 'info' : 'content')}
                                className={`px-8 py-5 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === (tab.toLowerCase().includes('info') ? 'info' : 'content') ? 'text-gray-800' : 'text-gray-300 hover:text-gray-400'}`}
                            >
                                {tab}
                                {activeTab === (tab.toLowerCase().includes('info') ? 'info' : 'content') && (
                                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#6D4C6A]"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {activeTab === 'info' && (
                            <div className="animate-fade-in-down p-4 space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-1">Full Description</label>
                                    <textarea
                                        rows="10"
                                        className="w-full bg-gray-50/30 rounded-3xl p-8 outline-none border border-gray-100 focus:border-[#6D4C6A]/20 transition-all font-medium text-gray-600 leading-relaxed"
                                        placeholder="Write compelling course description..."
                                        value={course.description || ''}
                                        onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-1">Price ($)</label>
                                        <input
                                            type="number"
                                            value={course.price || 0}
                                            onChange={(e) => setCourse({ ...course, price: e.target.value })}
                                            className="w-full text-xl font-bold bg-transparent border-b-2 border-gray-100 focus:border-[#6D4C6A] outline-none py-2 placeholder-gray-100 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-1">Visibility</label>
                                        <select
                                            value={course.visibility || 'everyone'}
                                            onChange={(e) => setCourse({ ...course, visibility: e.target.value })}
                                            className="w-full text-lg font-bold bg-transparent border-b-2 border-gray-100 focus:border-[#6D4C6A] outline-none py-2 transition-all"
                                        >
                                            <option value="everyone">Everyone</option>
                                            <option value="signed_in">Signed In Users</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div className="animate-fade-in-down">
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                                    <div className="col-span-8">Content Title</div>
                                    <div className="col-span-3">Category</div>
                                    <div className="col-span-1 text-center">Actions</div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    {modules.flatMap(m => m.lessons || []).length === 0 ? (
                                        <div className="py-20 text-center border-2 border-dashed border-gray-50 rounded-[32px] bg-gray-50/20">
                                            <p className="text-gray-300 font-bold uppercase tracking-widest text-xs">No content yet</p>
                                        </div>
                                    ) : (
                                        modules.flatMap(m => m.lessons || []).map((lesson, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-6 bg-white border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition-all items-center group">
                                                <div className="col-span-8 flex items-center space-x-4">
                                                    <span className="text-sm font-bold text-gray-800">{lesson.title}</span>
                                                </div>
                                                <div className="col-span-3 flex items-center space-x-2">
                                                    <div className={`w-2 h-2 rounded-full ${lesson.type === 'video' ? 'bg-blue-400' : lesson.type === 'quiz' ? 'bg-orange-400' : 'bg-purple-400'}`}></div>
                                                    <span className="text-xs font-bold text-gray-400 capitalize">{lesson.type}</span>
                                                </div>
                                                <div className="col-span-1 text-center flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const token = getToken();
                                                                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/lessons/${lesson.id}`, {
                                                                    headers: { Authorization: `Bearer ${token}` }
                                                                });
                                                                setEditingLesson(res.data);
                                                                setShowLessonEditor(true);
                                                            } catch (err) {
                                                                alert('Error loading lesson details');
                                                            }
                                                        }}
                                                        className="text-gray-300 hover:text-[#6D4C6A] p-2 transition-colors"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="mt-12 flex justify-center">
                                    <button
                                        onClick={handleAddContent}
                                        className="px-8 py-4 bg-[#6D4C6A] text-white font-bold rounded-2xl hover:bg-[#5A3E57] transition-all flex items-center space-x-3 shadow-xl shadow-purple-50"
                                    >
                                        <FiPlus /> <span>Add Content</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Best Practice Tip Card */}
                    <div className="mt-20 p-8 bg-[#F8F9FB] rounded-[32px] border border-gray-100 flex items-start space-x-6 relative group">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-gray-50 flex items-center justify-center text-[#6D4C6A] transform group-hover:rotate-12 transition-transform">
                            <FiImage size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-gray-800 mb-2">Educational Best Practice</h4>
                            <p className="text-xs font-medium text-gray-400 leading-relaxed">
                                When designing <span className="text-[#6D4C6A] font-bold">{course.title || 'Course'}</span> assessments, ensure alignment between learning objectives and evaluation methods. Use the 'Add Assessment Module' tool to incorporate diverse formats like reflective journals, objective quizzes, or peer-reviewed project submissions.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Lesson Editor Modal */}
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
