import React from 'react';
import { FiMessageSquare, FiSend, FiUser, FiSearch, FiMoreVertical } from 'react-icons/fi';

const Messages = () => {
    const contacts = [
        { id: 1, name: "Dr. Sarah Chen", role: "Instructor", lastMsg: "See you in class tomorrow!", time: "10:30 AM", unread: 2, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
        { id: 2, name: "Marcus Wright", role: "Student", lastMsg: "Did you finish the assignment?", time: "Yesterday", unread: 0, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" },
        { id: 3, name: "Support Team", role: "Help Desk", lastMsg: "Ticket #4532 has been updated.", time: "Mon", unread: 0, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Support" },
    ];

    return (
        <div className="pt-24 px-8 pb-12 bg-[#F8F9FB] min-h-screen ml-64 font-sans text-[#333]">
            <div className="max-w-6xl mx-auto h-[calc(100vh-160px)] flex bg-white rounded-[48px] shadow-2xl border border-gray-100 overflow-hidden">
                {/* Contacts List */}
                <div className="w-[380px] border-r border-gray-50 flex flex-col">
                    <div className="p-8 border-b border-gray-50">
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-6">Messages</h1>
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-[#6D4C6A]/20 outline-none font-bold text-xs placeholder-gray-300 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                        {contacts.map(c => (
                            <div key={c.id} className="p-6 hover:bg-gray-50 cursor-pointer transition-all flex items-center space-x-4 relative group">
                                <div className="w-14 h-14 rounded-[20px] bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm border-2 border-white group-hover:scale-105 transition-transform">
                                    <img src={c.avatar} alt={c.name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-black text-gray-800 text-sm truncate">{c.name}</h4>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{c.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium truncate">{c.lastMsg}</p>
                                </div>
                                {c.unread > 0 && (
                                    <div className="w-5 h-5 bg-[#6D4C6A] rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-purple-200">
                                        {c.unread}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area Placeholder */}
                <div className="flex-1 bg-[#FDFEFE] flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden">
                                <img src={contacts[0].avatar} alt="" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-800">{contacts[0].name}</h4>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Online</span>
                                </div>
                            </div>
                        </div>
                        <button className="p-4 text-gray-300 hover:text-gray-600 rounded-2xl hover:bg-gray-50 transition-all">
                            <FiMoreVertical size={20} />
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-20 text-center">
                        <div className="max-w-md space-y-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto text-gray-200">
                                <FiMessageSquare size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Select a conversation</h3>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed">Choose a chat from the sidebar to start messaging your instructors or classmates.</p>
                        </div>
                    </div>

                    <div className="p-8 bg-white border-t border-gray-50">
                        <div className="flex items-center space-x-4">
                            <input
                                type="text"
                                placeholder="Write your message..."
                                className="flex-1 p-6 bg-gray-50 rounded-[32px] border border-transparent focus:bg-white focus:border-[#6D4C6A]/20 outline-none font-medium text-sm transition-all"
                            />
                            <button className="w-16 h-16 bg-[#6D4C6A] text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-purple-100 hover:bg-[#5A3E57] hover:scale-105 active:scale-95 transition-all">
                                <FiSend size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;
