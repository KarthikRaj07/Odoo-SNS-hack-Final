
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiUserPlus, FiMail, FiTrash2, FiUser } from 'react-icons/fi';
import { getToken } from '../../utils/auth';

const AttendeesModal = ({ courseId, onClose }) => {
    const [attendees, setAttendees] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('attendees');
    const [message, setMessage] = useState({ subject: '', body: '' });

    useEffect(() => {
        fetchAttendees();
    }, [courseId]);

    const fetchAttendees = async () => {
        try {
            const token = getToken();
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/courses/${courseId}/attendees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendees(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching attendees:', err);
            setError('Failed to load attendees');
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail) return;

        try {
            setInviting(true);
            setError('');
            const token = getToken();
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/courses/${courseId}/invite`, {
                email: inviteEmail
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setInviteEmail('');
            alert('User invited successfully!');
            fetchAttendees();
        } catch (err) {
            console.error('Error inviting user:', err);
            setError(err.response?.data?.error || 'Failed to invite user');
        } finally {
            setInviting(false);
        }

    };

    const handleSendMessage = async () => {
        if (!message.subject || !message.body) {
            alert('Please fill in subject and message');
            return;
        }

        try {
            setInviting(true);
            const token = getToken();
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/courses/${courseId}/contact`, message, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Message sent to ${res.data.recipientCount} attendees!`);
            setMessage({ subject: '', body: '' });
            setActiveTab('attendees');
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message');
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <FiUserPlus className="mr-2" /> Manage Attendees
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 px-6">
                    <button
                        onClick={() => setActiveTab('attendees')}
                        className={`mr-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'attendees' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Attendees List
                    </button>
                    <button
                        onClick={() => setActiveTab('message')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'message' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Send Message
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'attendees' ? (
                        <>
                            {/* Invite Form */}
                            <div className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Invite User</h3>
                                <form onSubmit={handleInvite} className="flex gap-4">
                                    <div className="relative flex-1">
                                        <FiMail className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="Enter user email address..."
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={inviting}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 whitespace-nowrap"
                                    >
                                        {inviting ? 'Inviting...' : 'Invite'}
                                    </button>
                                </form>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </div>

                            {/* Attendees List */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider flex justify-between items-center">
                                    Enrolled Users
                                    <span className="text-gray-500 text-xs font-normal">{attendees.length} users</span>
                                </h3>

                                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                                    {loading ? (
                                        <div className="text-center py-8 text-gray-400">Loading...</div>
                                    ) : attendees.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                                            No attendees yet. Invite someone!
                                        </div>
                                    ) : (
                                        attendees.map((att) => (
                                            <div key={att.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                                                        {att.user?.full_name?.charAt(0) || <FiUser />}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800">{att.user?.full_name || 'Unknown User'}</div>
                                                        <div className="text-xs text-gray-500">{att.user?.email}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Enrolled: {new Date(att.enrolled_at || Date.now()).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    placeholder="Message subject..."
                                    value={message.subject}
                                    onChange={e => setMessage({ ...message, subject: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    rows="6"
                                    placeholder="Type your message to all attendees..."
                                    value={message.body}
                                    onChange={e => setMessage({ ...message, body: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSendMessage}
                                    disabled={inviting}
                                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md disabled:opacity-70 flex items-center"
                                >
                                    <FiMail className="mr-2" /> {inviting ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendeesModal;
