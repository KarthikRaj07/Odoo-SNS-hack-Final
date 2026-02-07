
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiSearch, FiFilter, FiUser, FiClock, FiCheckCircle, FiBookOpen } from 'react-icons/fi';

const ReportingDashboard = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [visibleColumns, setVisibleColumns] = useState({
        participantName: true,
        enrolledDate: true,
        startDate: true,
        timeSpent: true,
        completionPercentage: true,
        completedDate: true,
        status: true
    });
    const [stats, setStats] = useState({
        totalParticipants: 0,
        yetToStart: 0,
        inProgress: 0,
        completed: 0
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        fetchReportData();
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const token = getToken();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const url = selectedCourse === 'all'
                ? `${import.meta.env.VITE_API_URL}/api/admin/reports/all`
                : `${import.meta.env.VITE_API_URL}/api/admin/reports/${selectedCourse}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = res.data;
            setReportData(data);

            // Calculate Stats
            const newStats = {
                totalParticipants: data.length,
                yetToStart: data.filter(d => d.progress === 0).length,
                inProgress: data.filter(d => d.progress > 0 && d.progress < 100).length,
                completed: data.filter(d => d.progress === 100).length
            };
            setStats(newStats);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching report:', error);
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!reportData.length) return;

        const headers = ['Participant', 'Email', 'Course', 'Progress', 'Status', 'Enrolled Date'];
        const csvContent = [
            headers.join(','),
            ...reportData.map(row => [
                `"${row.user?.full_name || 'Unknown'}"`,
                `"${row.user?.email || ''}"`,
                `"${row.course?.title || ''}"`,
                `${row.progress}`,
                `"${row.progress === 100 ? 'Completed' : row.progress > 0 ? 'In Progress' : 'Yet to Start'}"`,
                `"${new Date(row.enrolled_at).toLocaleDateString()}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `learner_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-[#333]">
            {/* Admin Header */}
            <header className="bg-white border-b border-gray-100 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center space-x-12">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/admin')}>
                        <div className="w-10 h-10 bg-[#6D4C6A] rounded-xl flex items-center justify-center text-white">
                            <FiBookOpen size={20} />
                        </div>
                        <span className="text-xl font-black text-gray-800 tracking-tight">EduFlow</span>
                    </div>
                    <nav className="flex space-x-8 h-full font-medium">
                        <button onClick={() => navigate('/admin/courses')} className="text-gray-400 hover:text-gray-800 transition-colors h-20 px-2 flex items-center">Courses</button>
                        <button onClick={() => navigate('/admin/reports')} className="text-gray-800 border-b-[3px] border-[#6D4C6A] h-20 px-2 flex items-center">Reporting</button>
                        <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-800 transition-colors h-20 px-2 flex items-center">Dashboard</button>
                    </nav>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Learner Progress</h1>
                        <p className="text-gray-400 mt-1 font-medium">Track comprehensive analytics for your courses</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="bg-white border border-gray-200 text-gray-800 px-6 py-2.5 rounded-xl flex items-center hover:bg-gray-50 shadow-sm transition-all font-bold text-sm"
                        >
                            <FiDownload className="mr-2" /> Export CSV
                        </button>
                        <select
                            value={selectedCourse}
                            onChange={e => setSelectedCourse(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-800 font-bold py-2.5 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D4C6A]/20 shadow-sm text-sm"
                        >
                            <option value="all">All Courses</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        <div className="relative group">
                            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl flex items-center hover:bg-gray-50 shadow-sm transition-all">
                                <FiFilter className="mr-2" /> Columns
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg p-3 hidden group-hover:block z-10">
                                {Object.keys(visibleColumns).map(col => (
                                    <label key={col} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[col]}
                                            onChange={() => setVisibleColumns({ ...visibleColumns, [col]: !visibleColumns[col] })}
                                            className="mr-2 rounded text-[#6D4C6A] focus:ring-[#6D4C6A]"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{col.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div
                        onClick={() => setFilterStatus('all')}
                        className={`bg-white p-6 rounded-[32px] shadow-sm border cursor-pointer transition-all ${filterStatus === 'all' ? 'border-[#6D4C6A] ring-4 ring-[#6D4C6A]/5' : 'border-gray-50 hover:border-gray-200'}`}
                    >
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Total Participants</p>
                        <h3 className="text-3xl font-black text-gray-800 tracking-tighter">{stats.totalParticipants}</h3>
                    </div>
                    <div
                        onClick={() => setFilterStatus('yetToStart')}
                        className={`bg-white p-6 rounded-[32px] shadow-sm border cursor-pointer transition-all ${filterStatus === 'yetToStart' ? 'border-[#6D4C6A] ring-4 ring-[#6D4C6A]/5' : 'border-gray-50 hover:border-gray-200'}`}
                    >
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Yet to Start</p>
                        <h3 className="text-3xl font-black text-gray-300 tracking-tighter">{stats.yetToStart}</h3>
                    </div>
                    <div
                        onClick={() => setFilterStatus('inProgress')}
                        className={`bg-white p-6 rounded-[32px] shadow-sm border cursor-pointer transition-all ${filterStatus === 'inProgress' ? 'border-[#6D4C6A] ring-4 ring-[#6D4C6A]/5' : 'border-gray-50 hover:border-gray-200'}`}
                    >
                        <p className="text-[#6D4C6A] text-[10px] font-black uppercase tracking-wider mb-2 font-black">In Progress</p>
                        <h3 className="text-3xl font-black text-[#6D4C6A] tracking-tighter">{stats.inProgress}</h3>
                    </div>
                    <div
                        onClick={() => setFilterStatus('completed')}
                        className={`bg-white p-6 rounded-[32px] shadow-sm border cursor-pointer transition-all ${filterStatus === 'completed' ? 'border-[#6D4C6A] ring-4 ring-[#6D4C6A]/5' : 'border-gray-50 hover:border-gray-200'}`}
                    >
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-wider mb-2 font-black">Completed</p>
                        <h3 className="text-3xl font-black text-emerald-500 tracking-tighter">{stats.completed}</h3>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
                    <div className="px-10 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Search learners..."
                                className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D4C6A]/20 w-80 font-bold placeholder-gray-200 shadow-sm"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-gray-300 font-black uppercase tracking-[0.3em] text-xs">Syncing reports...</div>
                    ) : reportData.length === 0 ? (
                        <div className="p-20 text-center text-gray-300 font-black uppercase tracking-[0.3em] text-xs">No records found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] border-b border-gray-50">
                                        {visibleColumns.participantName && <th className="px-10 py-6">Participant Name</th>}
                                        {visibleColumns.enrolledDate && <th className="px-6 py-6">Enrolled</th>}
                                        {visibleColumns.startDate && <th className="px-6 py-6">Started</th>}
                                        {visibleColumns.timeSpent && <th className="px-6 py-6">Time Spent</th>}
                                        {visibleColumns.completionPercentage && <th className="px-6 py-6 text-center">Completion</th>}
                                        {visibleColumns.status && <th className="px-10 py-6">Status</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {reportData.filter(row => {
                                        if (filterStatus === 'all') return true;
                                        if (filterStatus === 'yetToStart') return row.status === 'yet_to_start' || (row.progress === 0);
                                        if (filterStatus === 'inProgress') return row.status === 'in_progress' || (row.progress > 0 && row.progress < 100);
                                        if (filterStatus === 'completed') return row.status === 'completed' || (row.progress === 100);
                                        return true;
                                    }).map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/30 transition-colors group">
                                            {visibleColumns.participantName && (
                                                <td className="px-10 py-5 font-bold text-gray-800 flex items-center">
                                                    <div className="h-10 w-10 rounded-xl bg-gray-50 text-[#6D4C6A] flex items-center justify-center mr-4 text-xs font-black shadow-sm group-hover:bg-white transition-all border border-gray-100">
                                                        {row.user?.full_name?.charAt(0) || <FiUser />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="tracking-tight leading-tight">{row.user?.full_name || 'Learner'}</span>
                                                        <span className="text-[10px] font-medium text-gray-300">{row.user?.email}</span>
                                                    </div>
                                                </td>
                                            )}
                                            {visibleColumns.enrolledDate && (
                                                <td className="px-6 py-5 text-gray-400 font-medium">
                                                    {row.enrolled_at ? new Date(row.enrolled_at).toLocaleDateString() : '-'}
                                                </td>
                                            )}
                                            {visibleColumns.startDate && (
                                                <td className="px-6 py-5 text-gray-400 font-medium">
                                                    {row.start_date ? new Date(row.start_date).toLocaleDateString() : '-'}
                                                </td>
                                            )}
                                            {visibleColumns.timeSpent && (
                                                <td className="px-6 py-5 text-gray-400 font-medium whitespace-nowrap">
                                                    {Math.floor((row.time_spent || 0) / 60)}h {(row.time_spent || 0) % 60}m
                                                </td>
                                            )}
                                            {visibleColumns.completionPercentage && (
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-24 bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden shadow-inner">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${row.progress === 100 ? 'bg-emerald-400' : 'bg-[#6D4C6A]'}`}
                                                                style={{ width: `${row.progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-800 tracking-widest">{Math.round(row.progress)}%</span>
                                                    </div>
                                                </td>
                                            )}
                                            {visibleColumns.status && (
                                                <td className="px-10 py-5">
                                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit inline-block
                                                        ${row.progress === 100 ? 'bg-emerald-50 text-emerald-600' :
                                                            row.progress > 0 ? 'bg-indigo-50 text-[#6D4C6A]' :
                                                                'bg-gray-50 text-gray-300'}`}>
                                                        {row.progress === 100 ? 'Completed' : row.progress > 0 ? 'In Progress' : 'Yet to Start'}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ReportingDashboard;
