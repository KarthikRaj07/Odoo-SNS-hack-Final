import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiSave, FiVideo, FiFileText, FiImage, FiHelpCircle, FiAward, FiCode, FiFile, FiLink, FiPlus, FiClock, FiChevronRight, FiUploadCloud, FiCheckCircle, FiTrash2, FiEdit2, FiType, FiDownload } from 'react-icons/fi';
import { getToken } from '../../utils/auth';

const LessonEditor = ({ isOpen, onClose, onSave, initialData }) => {
    const [activeType, setActiveType] = useState('video');
    const [activeTab, setActiveTab] = useState('content');
    const [formData, setFormData] = useState({
        title: '',
        tags: ['Basic'],
        duration: '00:00:00',
        is_free: true,
        content_url: '',
        text_content: '',
        attachments: [],
        allow_download: true,
    });
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const types = [
        { id: 'video', label: 'Video', icon: FiVideo },
        { id: 'document', label: 'Document', icon: FiFileText },
        { id: 'image', label: 'Image', icon: FiImage },
        { id: 'quiz', label: 'Quiz', icon: FiHelpCircle },
        { id: 'pdf', label: 'PDF', icon: FiFile },
        { id: 'link', label: 'Link', icon: FiLink },
    ];

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                tags: initialData.tags || ['Basic'],
                duration: initialData.duration || '00:00:00',
                is_free: initialData.is_free !== undefined ? initialData.is_free : true,
                content_url: initialData.content_url || '',
                text_content: initialData.text_content || '',
                attachments: initialData.attachments || [],
                allow_download: initialData.settings?.allow_download !== undefined ? initialData.settings.allow_download : true,
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
                text_content: '',
                attachments: [],
                allow_download: true,
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

    const tabs = [
        { id: 'content', label: 'Content' },
        { id: 'description', label: 'Description' },
        { id: 'attachments', label: 'Attachments' }
    ];

    if (activeType === 'quiz') {
        tabs.splice(1, 0, { id: 'quiz_builder', label: 'Quiz Builder' });
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2D1F2B]/60 backdrop-blur-md p-6 font-sans">
            <div className="bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] w-full max-w-6xl h-[90vh] overflow-hidden flex animate-bounce-in">
                {/* Left Sidebar */}
                <div className="w-[280px] bg-[#F8F9FB] border-r border-gray-100 flex flex-col p-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-8 ml-2">Lesson Type</h3>
                    <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {types.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setActiveType(type.id)}
                                className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all group ${activeType === type.id ? 'bg-white shadow-sm text-[#6D4C6A]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                            >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${activeType === type.id ? 'bg-[#6D4C6A] text-white' : 'bg-white text-gray-300 group-hover:text-gray-400 border border-gray-50'}`}>
                                    <type.icon size={16} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${activeType === type.id ? 'text-gray-800' : ''}`}>{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-12 pb-0 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start mb-12">
                            <div className="flex-1 max-w-xl space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6D4C6A]/60 ml-1">Lesson Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter lesson title..."
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full text-3xl font-black bg-transparent border-b-2 border-gray-50 focus:border-[#6D4C6A] outline-none py-2 placeholder-gray-100 text-gray-800 transition-all"
                                    />
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_free}
                                                onChange={() => setFormData({ ...formData, is_free: !formData.is_free })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                                        </label>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Preview (Free)</span>
                                    </div>
                                    {(activeType === 'document' || activeType === 'image' || activeType === 'pdf') && (
                                        <div className="flex items-center space-x-4">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.allow_download}
                                                    onChange={() => setFormData({ ...formData, allow_download: !formData.allow_download })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6D4C6A]"></div>
                                            </label>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Allow Download</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={onClose} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-300 hover:text-gray-600 transition-all">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-50 mb-10 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative border-b-[3px] ${activeTab === tab.id ? 'border-[#6D4C6A] text-gray-800' : 'border-transparent text-gray-300 hover:text-gray-400'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Contents */}
                        <div className="min-h-[400px] animate-fade-in-down pb-20">
                            {activeTab === 'content' && (
                                <div className="space-y-8 max-w-3xl">
                                    {(activeType === 'document' || activeType === 'image' || activeType === 'pdf') ? (
                                        <div
                                            onClick={() => document.getElementById('lesson-file-upload').click()}
                                            className="w-full h-[340px] border-4 border-dashed border-gray-50 rounded-[40px] flex flex-col items-center justify-center bg-gray-50/20 group cursor-pointer hover:border-[#6D4C6A]/20 transition-all overflow-hidden relative"
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
                                            {formData.content_url && formData.content_url.startsWith('data:') ? (
                                                <div className="flex flex-col items-center p-8">
                                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-6">
                                                        <FiCheckCircle size={40} />
                                                    </div>
                                                    <span className="text-lg font-black text-gray-800">File attached successfully</span>
                                                    <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest truncate max-w-xs">{formData.content_url.substring(0, 50)}...</span>
                                                    <button onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, content_url: '' }); }} className="mt-8 px-6 py-2.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Remove file</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center text-gray-200 group-hover:text-[#6D4C6A] group-hover:scale-110 transition-all mb-8 border border-gray-50">
                                                        <FiUploadCloud size={44} />
                                                    </div>
                                                    <h4 className="text-2xl font-black text-gray-800 mb-2">Upload your content</h4>
                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Max file size: 100MB</p>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 ml-1">Resource URL (Video / External Link)</label>
                                                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-3xl overflow-hidden focus-within:bg-white focus-within:border-[#6D4C6A]/20 transition-all">
                                                    <div className="w-16 h-16 flex items-center justify-center text-gray-300">
                                                        <FiLink size={20} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="https://..."
                                                        value={formData.content_url || ''}
                                                        onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                                                        className="flex-1 bg-transparent py-4 text-gray-700 font-bold outline-none border-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 ml-1">Duration</label>
                                                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-3xl overflow-hidden focus-within:bg-white focus-within:border-[#6D4C6A]/20 transition-all">
                                                    <div className="w-16 h-16 flex items-center justify-center text-gray-300">
                                                        <FiClock size={20} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="HH:MM:SS"
                                                        value={formData.duration || ''}
                                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                        className="flex-1 bg-transparent py-4 text-gray-700 font-bold outline-none border-none tabular-nums"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'description' && (
                                <div className="space-y-6 max-w-4xl">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-1">Lesson Storyboard / Description</label>
                                    <textarea
                                        rows="12"
                                        placeholder="Explain the lesson content, add instructions, or a brief transcript..."
                                        value={formData.text_content || ''}
                                        onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                                        className="w-full bg-gray-50/50 rounded-[40px] p-10 outline-none border border-gray-100 focus:border-[#6D4C6A]/20 transition-all font-medium text-gray-600 leading-relaxed text-lg"
                                    />
                                </div>
                            )}

                            {activeTab === 'quiz_builder' && (
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center bg-gray-50/50 p-6 rounded-[32px] border border-gray-50">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-800">Quiz Question Bank</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage interactive assessment items</p>
                                        </div>
                                        <button
                                            onClick={addQuestion}
                                            className="flex items-center space-x-3 px-8 py-4 bg-[#6D4C6A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-100"
                                        >
                                            <FiPlus /> <span>New Question</span>
                                        </button>
                                    </div>

                                    {quizQuestions.length === 0 ? (
                                        <div className="p-20 border-2 border-dashed border-gray-50 rounded-[40px] text-center bg-white">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-200">
                                                <FiHelpCircle size={32} />
                                            </div>
                                            <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-[10px]">No assessment items defined yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {quizQuestions.map((q, qIndex) => (
                                                <div key={q.id || qIndex} className="p-10 bg-white shadow-sm rounded-[40px] border border-gray-100 space-y-8 relative group hover:shadow-xl transition-all">
                                                    <button
                                                        onClick={() => removeQuestion(qIndex)}
                                                        className="absolute top-8 right-8 text-gray-200 hover:text-red-500 transition-colors p-2"
                                                    >
                                                        <FiTrash2 size={20} />
                                                    </button>

                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 ml-1">Question {qIndex + 1}</label>
                                                        <div className="flex items-center space-x-4 border-b-2 border-gray-50 focus-within:border-[#6D4C6A] transition-all pb-2">
                                                            <FiType className="text-gray-200" />
                                                            <input
                                                                type="text"
                                                                value={q.question}
                                                                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                                                placeholder="e.g: What is the main benefit of CRM?"
                                                                className="w-full text-xl font-bold bg-transparent outline-none py-2 placeholder-gray-100 text-gray-800"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-8">
                                                        {q.options.map((opt, oIndex) => (
                                                            <div key={oIndex} className="space-y-3">
                                                                <div className="flex items-center justify-between px-1">
                                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Option {oIndex + 1}</label>
                                                                    <button
                                                                        onClick={() => updateQuestion(qIndex, 'correct_answer', opt)}
                                                                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all ${q.correct_answer === opt && opt !== '' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                                                    >
                                                                        {q.correct_answer === opt && opt !== '' ? 'Correct Answer' : 'Mark as Correct'}
                                                                    </button>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={opt}
                                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                    className="w-full p-6 bg-gray-50/50 rounded-2xl border border-gray-100 outline-none focus:bg-white focus:border-[#6D4C6A]/20 transition-all font-bold text-gray-700 text-sm"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center space-x-6 pt-6 border-t border-gray-50">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-[#6D4C6A]">
                                                                <FiAward size={14} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Awarded Points:</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={q.points}
                                                            onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                                                            className="w-24 bg-gray-50 rounded-xl px-4 py-2 text-sm font-black text-[#6D4C6A] outline-none border border-transparent focus:border-[#6D4C6A]/20 focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'attachments' && (
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center bg-gray-50/50 p-8 rounded-[40px] border border-gray-50">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-800">Learning Resources</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Additional handouts, links, and guides</p>
                                        </div>
                                        <button
                                            onClick={() => document.getElementById('attachment-upload').click()}
                                            className="flex items-center space-x-3 px-8 py-4 bg-[#6D4C6A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#5A3E57] transition-all shadow-xl shadow-purple-100"
                                        >
                                            <FiPlus /> <span>Attach File</span>
                                        </button>
                                        <input
                                            id="attachment-upload"
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const newAttachment = {
                                                            name: file.name,
                                                            url: reader.result
                                                        };
                                                        setFormData({
                                                            ...formData,
                                                            attachments: [...(formData.attachments || []), newAttachment]
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </div>

                                    {(!formData.attachments || formData.attachments.length === 0) ? (
                                        <div className="p-24 border-2 border-dashed border-gray-50 rounded-[40px] text-center bg-white">
                                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 text-gray-200">
                                                <FiFile size={40} />
                                            </div>
                                            <p className="text-gray-300 font-extrabold uppercase tracking-[0.2em] text-[10px]">No additional resources attached.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {formData.attachments.map((att, index) => (
                                                <div key={index} className="p-8 bg-white border border-gray-100 rounded-[32px] flex items-center justify-between group hover:shadow-xl transition-all border-l-[6px] border-l-[#6D4C6A]">
                                                    <div className="flex items-center space-x-6">
                                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#6D4C6A] group-hover:text-white transition-all">
                                                            <FiFileText size={24} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-gray-800 truncate max-w-[220px]">{att.name}</span>
                                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Ready for download</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const updated = [...formData.attachments];
                                                            updated.splice(index, 1);
                                                            setFormData({ ...formData, attachments: updated });
                                                        }}
                                                        className="w-10 h-10 rounded-xl bg-red-50 text-red-300 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-12 pt-8 border-t border-gray-100 flex justify-between items-center bg-white">
                        <button onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-gray-800 transition-colors">Cancel changes</button>
                        <button
                            onClick={() => {
                                if (!formData.title) {
                                    alert('Lesson title is required!');
                                    return;
                                }
                                let backendType = activeType;
                                if (['pdf', 'link', 'html', 'certification'].includes(activeType)) {
                                    backendType = 'document';
                                }
                                onSave({
                                    ...formData,
                                    type: backendType,
                                    questions: quizQuestions,
                                    settings: { allow_download: formData.allow_download }
                                });
                            }}
                            className="px-12 py-5 bg-[#6D4C6A] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-[#5A3E57] transition-all flex items-center space-x-4 shadow-2xl shadow-purple-200"
                        >
                            <div className="flex flex-col items-start leading-none opacity-60">
                                <span className="text-[8px] mb-1">Lesson Mode</span>
                                <span className="uppercase">{activeType}</span>
                            </div>
                            <div className="h-6 w-[1px] bg-white/20"></div>
                            <span className="flex items-center space-x-2">
                                <span>Save Changes</span>
                                <FiChevronRight size={16} />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonEditor;
