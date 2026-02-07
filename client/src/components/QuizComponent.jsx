
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { getToken } from '../utils/auth';

const QuizComponent = ({ lessonId, onComplete }) => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuiz();
    }, [lessonId]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            setSubmitted(false);
            setResult(null);
            setAnswers({});

            const token = getToken();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/quizzes/${lessonId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, option) => {
        if (submitted) return;
        setAnswers({ ...answers, [questionId]: option });
    };

    const handleSubmit = async () => {
        try {
            const token = getToken();
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/quizzes/${lessonId}/submit`, { answers }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(res.data);
            setSubmitted(true);

            if (res.data.passed && onComplete) {
                onComplete(res.data.pointsAwarded);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz');
        }
    };

    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[40px] shadow-sm animate-pulse">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl mb-4"></div>
            <div className="h-4 w-32 bg-gray-50 rounded"></div>
        </div>
    );

    if (questions.length === 0) return (
        <div className="p-20 text-center bg-white rounded-[40px]">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No questions available</p>
        </div>
    );

    // Bingo/Success Screen
    if (submitted && result?.passed) {
        return (
            <div className="bg-white p-12 rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.05)] border border-gray-50 text-center animate-bounce-in max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-yellow-100 rounded-[32px] flex items-center justify-center text-yellow-500 text-5xl mx-auto mb-8 shadow-inner">
                    ★
                </div>
                <h2 className="text-5xl font-black text-gray-800 mb-2 tracking-tighter">Bingo!</h2>
                <p className="text-lg font-bold text-gray-300 uppercase tracking-[0.2em] mb-8">Assessment Mastered</p>

                <div className="bg-[#6D4C6A] p-10 rounded-[40px] text-white space-y-4 mb-10 shadow-2xl shadow-purple-200">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-xs font-black uppercase tracking-widest opacity-60">Points Earned</span>
                        <span className="text-3xl font-black">{result.pointsAwarded || result.score}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-black uppercase tracking-widest opacity-60">Attempt Number</span>
                        <span className="text-xl font-bold">#{result.attemptNumber || 1}</span>
                    </div>
                </div>

                <p className="text-gray-400 font-medium leading-relaxed px-8 mb-10">
                    You have demonstrated exceptional understanding of the instructional material. Your points have been added to your profile treasury.
                </p>

                <button
                    onClick={() => onComplete && onComplete(result.pointsAwarded)}
                    className="w-full py-6 bg-gray-800 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-gray-900 transition-all shadow-xl shadow-gray-200"
                >
                    Continue to Next Lesson
                </button>
            </div>
        );
    }

    const currentQ = questions[currentStep];

    return (
        <div className="bg-white p-12 rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.05)] border border-gray-50 max-w-2xl mx-auto relative overflow-hidden">
            {/* Header info */}
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#F8F9FB] rounded-xl flex items-center justify-center text-[#6D4C6A] font-black shadow-sm">
                        {currentStep + 1}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Question {currentStep + 1} of {questions.length}</span>
                </div>
                {result && !result.passed && (
                    <div className="flex items-center text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full">
                        <FiXCircle size={14} className="mr-2" /> Wrong Answer. Try again!
                    </div>
                )}
            </div>

            <div className="animate-fade-in-down">
                <h3 className="text-3xl font-black text-gray-800 mb-10 tracking-tight leading-tight">
                    {currentQ.question}
                </h3>

                <div className="space-y-4">
                    {currentQ.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(currentQ.id, option)}
                            className={`w-full group flex items-center p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${answers[currentQ.id] === option
                                    ? 'border-[#6D4C6A] bg-[#6D4C6A]/5'
                                    : 'border-gray-50 hover:border-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-6 transition-all ${answers[currentQ.id] === option
                                    ? 'bg-[#6D4C6A] text-white'
                                    : 'bg-white border border-gray-100 text-gray-200 group-hover:text-gray-400'
                                }`}>
                                <span className="text-xs font-black">{String.fromCharCode(65 + idx)}</span>
                            </div>
                            <span className={`text-lg font-bold ${answers[currentQ.id] === option ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                {option}
                            </span>
                            {answers[currentQ.id] === option && (
                                <div className="absolute right-6 w-2 h-2 rounded-full bg-[#6D4C6A]"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-14 flex flex-col space-y-4">
                <button
                    onClick={handleNext}
                    disabled={!answers[currentQ.id]}
                    className="w-full py-6 bg-[#6D4C6A] text-white font-black uppercase tracking-[0.3em] text-xs rounded-[24px] hover:bg-[#5A3E57] transition-all shadow-2xl shadow-purple-200 disabled:opacity-30 disabled:shadow-none"
                >
                    {currentStep < questions.length - 1 ? 'Proceed to Next' : 'Complete Assessment'}
                </button>

                {submitted && !result.passed && (
                    <button
                        onClick={fetchQuiz}
                        className="w-full py-6 bg-gray-50 text-gray-400 font-black uppercase tracking-[0.3em] text-xs rounded-[24px] hover:bg-gray-100 hover:text-gray-600 transition-all"
                    >
                        Reset Quiz
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizComponent;
