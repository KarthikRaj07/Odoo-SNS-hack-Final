
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken, getUser } from '../utils/auth';
import { FiDownload, FiAward, FiShare2 } from 'react-icons/fi';
// import html2canvas from 'html2canvas'; // If we want to capture as image
// import jsPDF from 'jspdf'; // If we want PDF download

const Certificate = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const certificateRef = useRef(null);

    useEffect(() => {
        fetchCertificateData();
    }, [courseId]);

    const fetchCertificateData = async () => {
        try {
            const user = getUser();
            if (!user) {
                navigate('/login');
                return;
            }
            const token = getToken();
            const courseRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`);

            // Verify progress? 
            // In a real app, we check if certificate exists in backend.
            // Let's assume we trust the link for now or add a fast check.

            setData({
                course: courseRes.data,
                user: {
                    name: user.full_name || user.email,
                    email: user.email
                },
                date: new Date().toLocaleDateString() // Ideally fetch issued_at
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching certificate:', error);
            setLoading(false);
        }
    };

    const handleDownload = () => {
        alert("Download functionality would generate a PDF here using html2canvas/jspdf.");
        // const input = certificateRef.current;
        // html2canvas(input).then((canvas) => { ... });
        window.print();
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!data) return <div className="p-8 text-center">Certificate not available.</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8 font-serif">
            <div className="mb-8 flex gap-4 no-print">
                <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="bg-white text-gray-700 px-4 py-2 rounded-lg font-sans font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Back to Course
                </button>
                <button
                    onClick={handleDownload}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-sans font-medium hover:bg-blue-700 transition-colors shadow-md flex items-center"
                >
                    <FiDownload className="mr-2" /> Download / Print
                </button>
            </div>

            <div
                ref={certificateRef}
                className="bg-white w-full max-w-5xl aspect-[1.414/1] shadow-2xl relative p-12 border-[16px] border-double border-gray-200 flex flex-col items-center text-center justify-between"
                style={{ backgroundImage: 'radial-gradient(circle at center, #fff 50%, #fefefe 100%)' }}
            >
                {/* Decorative Pattern corners */}
                <div className="absolute top-4 left-4 w-24 h-24 border-t-4 border-l-4 border-yellow-500/50"></div>
                <div className="absolute top-4 right-4 w-24 h-24 border-t-4 border-r-4 border-yellow-500/50"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 border-b-4 border-l-4 border-yellow-500/50"></div>
                <div className="absolute bottom-4 right-4 w-24 h-24 border-b-4 border-r-4 border-yellow-500/50"></div>

                <div className="mt-12">
                    <FiAward className="text-6xl text-yellow-500 mx-auto mb-6" />
                    <h1 className="text-6xl font-black text-gray-800 tracking-wider uppercase mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Certificate</h1>
                    <span className="text-2xl text-gray-500 uppercase tracking-widest font-light">of Completion</span>
                </div>

                <div className="flex-1 flex flex-col justify-center w-full">
                    <p className="text-xl text-gray-600 italic mb-2">This is to certify that</p>
                    <h2 className="text-5xl font-bold text-blue-900 mb-2 border-b-2 border-gray-200 pb-4 mx-auto w-2/3">{data.user.name}</h2>
                    <p className="text-xl text-gray-600 italic mt-8 mb-2">has successfully completed the course</p>
                    <h3 className="text-4xl font-bold text-gray-800 mb-8">{data.course.title}</h3>
                </div>

                <div className="flex justify-between w-full px-16 items-end mt-12">
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-800 border-t border-gray-400 pt-2 px-8">{data.date}</div>
                        <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">Date</p>
                    </div>
                    <div className="text-center">
                        <div className="w-24 h-24 relative mx-auto mb-2 opacity-80">
                            {/* Seal placeholder */}
                            <div className="absolute inset-0 border-4 border-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-yellow-600 transform -rotate-12">OFFICIAL<br />SEAL</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-800 border-t border-gray-400 pt-2 px-8 font-signature is-signature">LearnSphere Inc.</div>
                        <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">Platform Director</p>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Great+Vibes&display=swap');
                .font-signature {
                    font-family: 'Great Vibes', cursive;
                    font-size: 1.5em;
                }
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                    .shadow-2xl { shadow: none; }
                }
            `}</style>
        </div>
    );
};

export default Certificate;
