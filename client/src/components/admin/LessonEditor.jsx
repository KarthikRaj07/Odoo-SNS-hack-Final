
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiSave, FiVideo, FiFileText, FiImage, FiHelpCircle, FiAward, FiCode, FiFile, FiLink, FiPlus, FiClock, FiChevronRight, FiUploadCloud, FiCheckCircle, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { getToken } from '../../utils/auth';

const LessonEditor = ({ isOpen, onClose, onSave, initialData }) => {
    const [activeType, setActiveType] = useState('video');
    const [activeTab, setActiveTab] = useState('lesson_content');
    const [formData, setFormData] = useState({
        title: '',
        tags: ['Basic'],
        duration: '00:00:00',
        is_free: true,
        content_url: '',
    });
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const types = [
        { id: 'certification', label: 'Internal Certification', icon: FiAward },
        { id: 'quiz', label: 'Quiz', icon: FiHelpCircle },
        { id: 'video', label: 'Video', icon: FiVideo },
        { id: 'html', label: 'HTML', icon: FiCode },
        { id: 'document', label: 'Document', icon: FiFileText },
        { id: 'pdf', label: 'PDF', icon: FiFile },
        { id: 'link', label: 'Link', icon: FiLink },
        { id: 'image', label: 'Image', icon: FiImage },
    ];

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                tags: initialData.tags || ['Basic'],
                duration: initialData.duration || '00:00:00',
                is_free: initialData.is_free !== undefined ? initialData.is_free : true,
                content_url: initialData.content_url || '',
            });
            setActiveType(initialData.type || 'video');

            if (initialData.type === 'quiz' || initialData.id) {
                fetchQuizQuestions(initialData.id);
            }
        } else {
            setFormData({
                title: '',
                tags: ['Basic'],
                duration: '00:00:00',
                is_free: true,
                content_url: '',
            });
            setQuizQuestions([]);
            setActiveType('video');
        }
    }, [initialData, isOpen]);

    const fetchQuizQuestions = async (lessonId) => {
        if (!lessonId) return;
        setLoadingQuestions(true);
        try {
            const token = getToken();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/quizzes/${lessonId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizQuestions(res.data || []);
        } catch (error) {
            console.error('Error fetching quiz questions:', error);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const addQuestion = () => {
        setQuizQuestions([...quizQuestions, {
            id: Date.now(),
            question: '',
            options: ['', '', '', ''],
            correct_answer: '',
            points: 10
        }]);
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...quizQuestions];
        updated[index][field] = value;
        setQuizQuestions(updated);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const updated = [...quizQuestions];
        updated[qIndex].options[oIndex] = value;
        setQuizQuestions(updated);
    };

    const removeQuestion = (index) => {
        const updated = [...quizQuestions];
        updated.splice(index, 1);
        setQuizQuestions(updated);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2D1F2B]/60 backdrop-blur-md p-6">
            <div className="bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] w-full max-w-6xl h-[85vh] overflow-hidden flex animate-bounce-in">
                {/* Left Sidebar */}
                <div className="w-[320px] bg-[#F8F9FB] border-r border-gray-100 flex flex-col p-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-8 ml-2">Content Type</h3>
                    <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {types.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setActiveType(type.id)}
                                className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all group ${activeType === type.id ? 'bg-white shadow-sm text-[#6D4C6A]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeType === type.id ? 'bg-[#6D4C6A] text-white' : 'bg-white text-gray-300 group-hover:text-gray-400 border border-gray-50'}`}>
                                    <type.icon size={18} />
                                </div>
                                <span className={`text-sm font-black uppercase tracking-widest ${activeType === type.id ? 'text-gray-800' : ''}`}>{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-12 pb-0 flex-1 overflow-y-auto">
                        <div className="flex justify-between items-start mb-12">
                            <div className="flex-1 max-w-xl space-y-8">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6D4C6A]/60">Lesson Title</span>
                                    <input
                                        type="text"
                                        placeholder="Lesson Name"
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full text-4xl font-black bg-transparent border-b-2 border-gray-50 focus:border-[#6D4C6A] outline-none py-2 placeholder-gray-100 text-gray-800 transition-all"
                                    />
                                </div>

                                <div className="flex space-x-12">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Duration</label>
                                        <div className="flex items-center space-x-2 text-gray-600 font-bold border-b border-gray-50 pb-2">
                                            <FiClock size={14} className="text-[#6D4C6A]" />
                                            <input
                                                type="text"
                                                value={formData.duration || ''}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                className="bg-transparent outline-none w-24 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Tags</label>
                                        <div className="flex items-center space-x-2 border-b border-gray-50 pb-2">
                                            {formData.tags?.map((tag, i) => (
                                                <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 px-2 py-1 rounded-md">{tag}</span>
                                            ))}
                                            <FiPlus size={14} className="text-gray-200 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 pt-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_free}
                                            onChange={() => setFormData({ ...formData, is_free: !formData.is_free })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                                    </label>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Allow Preview (Free)</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-300 hover:text-gray-600 transition-all">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Content Tabs */}
                        <div className="flex border-b border-gray-50 mb-10">
                            {['Lesson Content', 'Quiz Editor'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '_'))}
                                    className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.toLowerCase().replace(' ', '_') ? 'text-gray-800' : 'text-gray-300 hover:text-gray-400'}`}
                                >
                                    {tab}
                                    {activeTab === tab.toLowerCase().replace(' ', '_') && (
                                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#6D4C6A]"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Contents */}
                        <div className="min-h-[300px] animate-fade-in-down pb-20">
                            {activeTab === 'lesson_content' && (
                                <div className="space-y-8">
                                    <div
                                        onClick={() => document.getElementById('lesson-file-upload').click()}
                                        className="w-full h-[300px] border-4 border-dashed border-gray-50 rounded-[40px] flex flex-col items-center justify-center bg-gray-50/20 group cursor-pointer hover:border-[#6D4C6A]/20 transition-all overflow-hidden relative"
                                    >
                                        <input
                                            id="lesson-file-upload"
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setFormData({ ...formData, content_url: reader.result });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        {formData.content_url && (formData.content_url.startsWith('data:') || activeType === 'video' && formData.content_url) ? (
                                            <div className="flex flex-col items-center p-8">
                                                <div className="w-16 h-16 bg-[#10B981] text-white rounded-2xl flex items-center justify-center mb-4">
                                                    <FiCheckCircle size={32} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">File attached successfully</span>
                                                <span className="text-[10px] text-gray-400 font-medium mt-2 max-w-xs truncate">{formData.content_url}</span>
                                                <button onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, content_url: '' }); }} className="mt-4 text-xs font-bold text-red-500 hover:underline">Remove file</button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 bg-white rounded-[30px] shadow-sm flex items-center justify-center text-gray-200 group-hover:text-[#6D4C6A] group-hover:scale-110 transition-all mb-6">
                                                    <FiUploadCloud size={40} />
                                                </div>
                                                <h4 className="text-xl font-black text-gray-800 mb-2">Upload your file</h4>
                                                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Supports MP4, MOV, PDF, JPG up to 100MB</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="h-[1px] bg-gray-50 flex-1"></div>
                                        <span className="px-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-200">OR</span>
                                        <div className="h-[1px] bg-gray-50 flex-1"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">External URL / Media Link</label>
                                        <input
                                            type="text"
                                            placeholder="https://youtube.com/watch?v=..."
                                            value={formData.content_url || ''}
                                            onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                                            className="w-full p-6 bg-white border border-gray-100 rounded-3xl font-medium text-gray-600 outline-none focus:border-[#6D4C6A]/30 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'quiz_editor' && (
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-black text-gray-800">Quiz Questions</h3>
                                        <button
                                            onClick={addQuestion}
                                            className="flex items-center space-x-2 px-6 py-3 bg-gray-50 text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
                                        >
                                            <FiPlus /> <span>Add Question</span>
                                        </button>
                                    </div>

                                    {quizQuestions.length === 0 ? (
                                        <div className="p-20 border-2 border-dashed border-gray-50 rounded-[40px] text-center">
                                            <FiHelpCircle size={48} className="mx-auto text-gray-100 mb-6" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No questions yet. Click "Add Question" to begin.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {quizQuestions.map((q, qIndex) => (
                                                <div key={q.id || qIndex} className="p-8 bg-gray-50/50 rounded-[40px] border border-gray-50 space-y-6 relative group">
                                                    <button
                                                        onClick={() => removeQuestion(qIndex)}
                                                        className="absolute top-8 right-8 text-gray-200 hover:text-red-500 transition-colors"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Question {qIndex + 1}</label>
                                                        <input
                                                            type="text"
                                                            value={q.question}
                                                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                                            placeholder="State your question..."
                                                            className="w-full text-lg font-bold bg-transparent border-b border-gray-200 focus:border-[#6D4C6A] outline-none py-2"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        {q.options.map((opt, oIndex) => (
                                                            <div key={oIndex} className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Option {oIndex + 1}</label>
                                                                    <button
                                                                        onClick={() => updateQuestion(qIndex, 'correct_answer', opt)}
                                                                        className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded ${q.correct_answer === opt && opt !== '' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                                                                    >
                                                                        {q.correct_answer === opt && opt !== '' ? 'Correct' : 'Mark Correct'}
                                                                    </button>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={opt}
                                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                    className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none focus:border-[#6D4C6A]/20 transition-all font-medium text-sm"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Points:</span>
                                                        <input
                                                            type="number"
                                                            value={q.points}
                                                            onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                                                            className="w-20 bg-white rounded-lg border border-gray-100 p-2 text-sm font-bold text-[#6D4C6A]"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-12 pt-6 border-t border-gray-50 flex justify-between items-center bg-white">
                        <button onClick={onClose} className="text-sm font-black uppercase tracking-widest text-gray-300 hover:text-gray-800 transition-colors">Discard changes</button>
                        <button
                            onClick={() => {
                                if (!formData.title) {
                                    alert('Lesson title is required!');
                                    return;
                                }
                                // Map unsupported frontend types to supported backend types
                                let backendType = activeType;
                                if (['pdf', 'link', 'html', 'certification'].includes(activeType)) {
                                    backendType = 'document';
                                }
                                onSave({ ...formData, type: backendType, questions: quizQuestions });
                            }}
                            className="px-12 py-5 bg-[#6D4C6A] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-[#5A3E57] transition-all flex items-center space-x-3 shadow-2xl shadow-purple-200"
                        >
                            <div className="flex flex-col items-start leading-tight mr-2">
                                <span className="opacity-50 text-[8px]">Type: {activeType}</span>
                                <span>Save Content</span>
                            </div>
                            <FiChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonEditor;
