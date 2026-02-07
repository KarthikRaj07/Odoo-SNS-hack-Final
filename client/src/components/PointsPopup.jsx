import React, { useEffect } from 'react';
import { FiAward, FiStar, FiX } from 'react-icons/fi';

const PointsPopup = ({ points, onClose, newBadge, nextRankProgress }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto close after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] px-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/30 rounded-2xl p-8 shadow-2xl relative max-w-sm w-full transform scale-100 animate-bounce-in text-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <FiX size={24} />
                </button>

                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
                    <FiAward className="text-4xl text-white" />
                </div>

                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-2">
                    +{points} Points!
                </h3>
                <p className="text-gray-300 font-medium mb-6">
                    Excellent work! Keep it up!
                </p>

                {newBadge && (
                    <div className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">New Badge Unlocked</p>
                        <p className="text-xl font-bold text-white flex items-center justify-center gap-2">
                            <FiStar className="text-yellow-400 fill-current" />
                            {newBadge}
                        </p>
                    </div>
                )}

                {nextRankProgress && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Progress to Next Rank</span>
                            <span>{nextRankProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                                style={{ width: `${nextRankProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PointsPopup;
