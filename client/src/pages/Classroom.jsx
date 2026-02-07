import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { FiSend, FiVideo, FiMic, FiPhoneOff, FiMonitor, FiUsers, FiMessageCircle } from 'react-icons/fi';

const Classroom = () => {
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeTab, setActiveTab] = useState('chat');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Mock Room ID
    const roomId = "class-101";
    const user = "John Doe"; // In real app, from auth

    useEffect(() => {
        if (!socket) return;

        // Join room
        socket.emit('join_classroom', { roomId, username: user });

        // Listen for messages
        socket.on('message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off('message');
        };
    }, [socket, roomId, user]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('send_message', { roomId, user, text: newMessage });
        setNewMessage('');
    };

    return (
        <div className="pt-16 pl-64 h-screen bg-gray-900 flex text-white overflow-hidden">

            {/* Main Content Area - Video/Whiteboard */}
            <div className="flex-1 flex flex-col relative">
                {/* Header */}
                <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                            Live: Advanced React Patterns
                        </h2>
                        <p className="text-xs text-gray-400">Instructor: Jane Smith</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="px-3 py-1 bg-gray-700 rounded-full text-xs flex items-center">
                            <FiUsers className="mr-2" /> 24 Students
                        </div>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                        {/* Instructor Video (Dominant) */}
                        <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 shadow-xl group">
                            <img src="https://placehold.co/800x600/333/999?text=Instructor+Feed" className="w-full h-full object-cover" alt="Instructor" />
                            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-sm font-medium backdrop-blur-sm">
                                Jane Smith (Instructor)
                            </div>
                            <div className="absolute top-4 right-4 bg-red-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                Live
                            </div>
                        </div>

                        {/* Student 1 */}
                        <div className="bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 shadow-md">
                            <img src="https://placehold.co/400x300/444/FFF?text=Student+1" className="w-full h-full object-cover" alt="Student" />
                            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-xs backdrop-blur-sm">
                                Alice
                            </div>
                        </div>

                        {/* Student 2 */}
                        <div className="bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 shadow-md">
                            <img src="https://placehold.co/400x300/444/FFF?text=Student+2" className="w-full h-full object-cover" alt="Student" />
                            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-xs backdrop-blur-sm">
                                Bob
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="h-20 bg-gray-800 border-t border-gray-700 flex items-center justify-center space-x-6">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                    >
                        <FiMic className="text-xl" />
                    </button>
                    <button
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                    >
                        <FiVideo className="text-xl" />
                    </button>
                    <button className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors">
                        <FiPhoneOff className="text-xl" />
                    </button>
                    <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
                        <FiMonitor className="text-xl" />
                    </button>
                    <button
                        className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors md:hidden"
                        onClick={() => setActiveTab(activeTab === 'chat' ? 'video' : 'chat')}
                    >
                        <FiMessageCircle className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Sidebar - Chat / Participants */}
            <div className={`w-80 bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300 absolute right-0 bottom-0 top-16 md:relative ${activeTab === 'chat' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                <div className="flex border-b border-gray-700">
                    <button
                        className={`flex-1 py-4 text-sm font-medium ${activeTab === 'chat' ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        Chat
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-medium ${activeTab === 'participants' ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('participants')}
                    >
                        Participants (24)
                    </button>
                </div>

                {activeTab === 'chat' && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col ${msg.user === user ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.user === user ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                        <p className="font-bold text-xs mb-1 opacity-70">{msg.user}</p>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-700">
                            <form onSubmit={sendMessage} className="relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="w-full bg-gray-900 border border-gray-600 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 p-1.5 hover:bg-gray-800 rounded-full transition-colors">
                                    <FiSend />
                                </button>
                            </form>
                        </div>
                    </>
                )}

                {activeTab === 'participants' && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {/* Mock Participants */}
                        {['Jane Smith (Host)', 'John Doe (You)', 'Alice', 'Bob', 'Charlie', 'David'].map((p, i) => (
                            <div key={i} className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">
                                    {p.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-200">{p}</p>
                                    {i === 0 && <span className="text-xs text-blue-400">Instructor</span>}
                                </div>
                                <div className="text-gray-500">
                                    {i % 3 === 0 ? <FiMic /> : <FiPhoneOff />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Classroom;
