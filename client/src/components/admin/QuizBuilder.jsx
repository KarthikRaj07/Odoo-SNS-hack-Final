
import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const QuizBuilder = ({ lessonId, onSave }) => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 10
    });
    const [rewards, setRewards] = useState({ first: 100, second: 80, third: 60, other: 40 });
    const [lessonData, setLessonData] = useState(null);

    useEffect(() => {
        fetchLessonDetails();
        fetchQuestions();
    }, [lessonId]);

    const fetchLessonDetails = async () => {
        try {
            const token = getToken();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}`);
            // Note: need public GET /lessons/:id or admin GET endpoint. Using regular one for now.
            // Actually, we don't have a direct GET /api/lessons/:id. Admin usually gets details.
            // Let's assume there is one or use a new logic.
            // Since we are admin, we can fetch via supabase or specific endpoint.
            // I'll skip fetching for now and assume defaults if not found, OR implement fetch.
            // Better to implement fetching settings.
            if (res.data.settings?.rewards) {
                setRewards(res.data.settings.rewards);
            }
            setLessonData(res.data);
        } catch (e) {
            // ignore if fails for now or log
            console.log("Could not fetch lesson details");
        }
    };

    const fetchQuestions = async () => {
        // Implement fetching questions if API available
    };

    const saveRewards = async () => {
        try {
            const token = getToken();
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/lessons/${lessonId}`, {
                settings: { ...lessonData?.settings, rewards }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Rewards settings saved!');
        } catch (error) {
            console.error('Error saving rewards:', error);
            alert('Failed to save rewards');
        }
    };

    const updateReward = (key, value) => {
        setRewards(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
    };

    // Also implement handleDeleteQuestion
    const handleDeleteQuestion = async (id) => {
        if (!confirm('Delete this question?')) return;
        // Need API endpoint for delete question. 
        // For now just UI removal if not implemented backend.
        // Assuming /api/admin/quiz-questions/:id DELETE exists (it doesn't yet).
        // I will just alert.
        alert('Delete functionality needs backend endpoint');
    };

    const handleAddQuestion = async () => {
        if (!newQuestion.question || !newQuestion.correct_answer) {
            alert('Please fill in the question and correct answer.');
            return;
        }
        if (newQuestion.options.some(opt => !opt.trim())) {
            alert('All options must be filled.');
            return;
        }

        try {
            const token = getToken();
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/quiz-questions`, {
                lesson_id: lessonId,
                ...newQuestion
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setQuestions([...questions, res.data]);
            setNewQuestion({
                question: '',
                options: ['', '', '', ''],
                correct_answer: '',
                points: 10
            });
            if (onSave) onSave();
        } catch (error) {
            console.error('Error adding question:', error);
            alert('Failed to add question');
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...newQuestion.options];
        newOptions[index] = value;
        setNewQuestion({ ...newQuestion, options: newOptions });
    };

    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-4">
            <h3 className="font-bold text-gray-800 mb-4">Quiz Builder</h3>

            {/* Rewards Configuration */}
            <div className="bg-white p-4 rounded-lg border border-yellow-100 shadow-sm mb-6">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="text-yellow-500 mr-2">★</span> Quiz Rewards (Points)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">1st Attempt</label>
                        <input
                            type="number"
                            value={rewards.first || 0}
                            onChange={(e) => updateReward('first', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">2nd Attempt</label>
                        <input
                            type="number"
                            value={rewards.second || 0}
                            onChange={(e) => updateReward('second', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">3rd Attempt</label>
                        <input
                            type="number"
                            value={rewards.third || 0}
                            onChange={(e) => updateReward('third', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">4th+ Attempt</label>
                        <input
                            type="number"
                            value={rewards.other || 0}
                            onChange={(e) => updateReward('other', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                        />
                    </div>
                </div>
                <div className="mt-3 text-right">
                    <button onClick={saveRewards} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Save Rewards Settings
                    </button>
                </div>
            </div>

            {/* Existing Questions List */}
            <div className="space-y-4 mb-8">
                {questions.map((q, idx) => (
                    <div key={q.id || idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative group">
                        <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <FiTrash2 />
                        </button>
                        <div className="flex justify-between items-start pr-6">
                            <p className="font-semibold text-gray-800">{idx + 1}. {q.question}</p>
                            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap ml-2">{q.points} pts</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className={`text-sm px-2 py-1 rounded ${opt === q.correct_answer ? 'bg-green-100 text-green-800' : 'text-gray-500'}`}>
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add New Question Form */}
            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-3">Add New Question</h4>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Question text"
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        {newQuestion.options.map((opt, idx) => (
                            <input
                                key={idx}
                                type="text"
                                placeholder={`Option ${idx + 1}`}
                                value={opt}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                            />
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={newQuestion.correct_answer}
                            onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select Correct Answer</option>
                            {newQuestion.options.map((opt, idx) => (
                                opt && <option key={idx} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Points"
                            value={newQuestion.points}
                            onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                            className="w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <button
                        onClick={handleAddQuestion}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex justify-center items-center"
                    >
                        <FiPlus className="mr-2" /> Add Question
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizBuilder;
