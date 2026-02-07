import React from 'react';
import { FiBell, FiCheckCircle, FiInfo, FiAlertCircle, FiAward, FiStar } from 'react-icons/fi';

const Notifications = () => {
    const notifications = [
        {
            id: 1,
            title: "Welcome to EduFlow!",
            message: "Start your learning journey by exploring our latest courses in the catalog.",
            type: "info",
            time: "2 hours ago",
            read: false,
            icon: FiInfo,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            id: 2,
            title: "Course Completed: CRM Basics",
            message: "Congratulations! You've successfully completed the course. Your certificate is ready.",
            type: "success",
            time: "Yesterday",
            read: true,
            icon: FiAward,
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        },
        {
            id: 3,
            title: "New Achievement Unlocked",
            message: "You've earned the 'Quick Learner' badge for completing 3 lessons in one day.",
            type: "award",
            time: "2 days ago",
            read: true,
            icon: FiStar,
            color: "text-amber-500",
            bg: "bg-amber-50"
        }
    ];

    return (
        <div className="pt-24 px-8 pb-12 bg-[#F8F9FB] min-h-screen ml-64 font-sans text-[#333]">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight">Notifications</h1>
                        <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">Stay updated with your progress</p>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#6D4C6A] hover:underline mb-1">
                        Mark all as read
                    </button>
                </div>

                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-50">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div key={n.id} className={`p-8 hover:bg-gray-50/50 transition-all flex items-start space-x-6 ${!n.read ? 'bg-[#6D4C6A]/5' : ''}`}>
                                    <div className={`w-14 h-14 rounded-2xl ${n.bg} ${n.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                        <n.icon size={24} />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-lg font-black text-gray-800 tracking-tight">{n.title}</h4>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{n.time}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-2xl">{n.message}</p>
                                        {!n.read && (
                                            <div className="pt-2 flex items-center space-x-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#6D4C6A]"></div>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-[#6D4C6A]">New Notification</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-32 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                    <FiBell size={32} />
                                </div>
                                <h3 className="text-xl font-black text-gray-800">All caught up!</h3>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">No new notifications for you</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-8 bg-[#6D4C6A] rounded-[40px] p-12 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="relative z-10 space-y-4 max-w-xl">
                        <h3 className="text-3xl font-black tracking-tight">Notification Settings</h3>
                        <p className="text-white/60 font-medium leading-relaxed">Customize how and when you want to receive updates about your courses, achievements, and account activity.</p>
                        <button className="px-8 py-4 bg-white text-[#6D4C6A] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all shadow-xl shadow-purple-900/20">
                            Configure Preferences
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
