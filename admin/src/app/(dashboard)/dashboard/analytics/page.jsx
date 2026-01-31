"use client";
import { useState, useEffect } from 'react';
import { fetchDashboardStats, fetchQuestionDifficulty, fetchLeaderboard } from '../../../../utils/api';
import { Users, ClipboardList, Trophy, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [difficultQuestions, setDifficultQuestions] = useState([]);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const [sIdx, lIdx, qIdx] = await Promise.all([
            fetchDashboardStats(),
            fetchLeaderboard(),
            fetchQuestionDifficulty()
        ]);
        setStats(sIdx.data);
        setLeaderboard(lIdx.data);
        setDifficultQuestions(qIdx.data);
    };

    if (!stats) return <div className="p-10 text-center text-gray-500">Loading metrics...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                    </div>
                </div>
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
                        <ClipboardList size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Active Tests</p>
                        <h3 className="text-2xl font-bold">{stats.activeTests}</h3>
                    </div>
                </div>
                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Attempts</p>
                        <h3 className="text-2xl font-bold">{stats.totalAttempts}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Leaderboard */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Top Performers</h3>
                        <Trophy size={16} className="text-yellow-500" />
                    </div>
                    <div className="space-y-3">
                        {leaderboard.map((u, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx < 3 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'}`}>
                                        {idx + 1}
                                    </span>
                                    <span>{u.name}</span>
                                </div>
                                <span className="font-mono text-purple-400">{u.stats.xp} XP</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hardest Questions */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                    <h3 className="font-bold text-lg mb-4">Question Improvement Needed</h3>
                    <p className="text-sm text-gray-500 mb-4">Questions with lowest accuracy (&gt;5 attempts)</p>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {difficultQuestions.map((q, idx) => (
                            <div key={idx} className="p-3 bg-gray-800 rounded-lg border-l-4 border-red-500">
                                <p className="text-sm mb-1 truncate">{q.text}</p>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>{q.difficulty}</span>
                                    <span className="text-red-400 font-bold">{q.calculatedAccuracy} Accuracy</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
