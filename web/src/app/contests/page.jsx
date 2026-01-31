"use client";
import { useState, useEffect } from 'react';
import { fetchPublicContests, getRegistrationStatus, registerForContest } from '@/utils/api';
import { Calendar, Trophy, Lock, Unlock, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ContestsPage() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadContests();
    }, []);

    const loadContests = async () => {
        try {
            const res = await fetchPublicContests(); // Admin endpoint usually lists all, filter?
            // Assuming this endpoint returns user-viewable contests (status: upcoming/ongoing)
            setContests(res.data || []);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    return (
        <div className="container fade-in-up py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="gradient-text text-3xl md:text-5xl font-bold mb-2">Contests</h1>
                    <p className="text-gray-400">Compete with others and climb the global leaderboard.</p>
                </div>
                <div className="glass-panel px-5 py-3 flex items-center gap-3 border-purple-500/30">
                    <Trophy size={20} className="text-yellow-400" />
                    <span className="text-gray-300">Global Rank:</span>
                    <span className="font-mono font-bold text-white">#--</span>
                </div>
            </div>

            {loading && <div className="text-center py-20 text-gray-500 animate-pulse">Loading active contests...</div>}

            <div className="grid grid-cols-1 gap-6">
                {contests.map(contest => (
                    <ContestCard key={contest._id} contest={contest} />
                ))}
            </div>

            {!loading && contests.length === 0 && (
                <div className="glass-panel text-center py-20">
                    <Trophy size={48} className="mx-auto text-gray-600 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-400 mb-2">No active contests</h3>
                    <p className="text-gray-500">Check back later for upcoming events or practice in the Learning Hub.</p>
                </div>
            )}
        </div>
    );
}

function ContestCard({ contest }) {
    const [regStatus, setRegStatus] = useState(null); // 'registered', 'participated', null
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await getRegistrationStatus(contest._id);
            setRegStatus(res.data.status); // null or string
        } catch (e) { }
    };

    const handleRegister = async () => {
        if (!confirm('Register for this contest?')) return;
        setLoading(true);
        try {
            await registerForContest(contest._id);
            alert('Registered successfully!');
            checkStatus();
        } catch (e) {
            alert(e.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    const enterContest = () => {
        router.push(`/tests/${contest.testId}/instructions`);
    };

    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    const regStart = contest.registrationStartTime ? new Date(contest.registrationStartTime) : null;
    const regEnd = contest.registrationEndTime ? new Date(contest.registrationEndTime) : null;

    const isOngoing = now >= start && now <= end;
    const isUpcoming = now < start;
    const isEnded = now > end;

    // Registration Open Logic
    const isRegOpen = (!regStart || now >= regStart) && (!regEnd || now <= regEnd);

    return (
        <div className="glass-panel p-6 relative overflow-hidden group transition-all hover:border-purple-500/50">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        {isOngoing && <span className="bg-red-500/90 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-lg shadow-red-500/20 animate-pulse">LIVE</span>}
                        {isEnded && <span className="bg-gray-700 text-gray-300 text-[10px] uppercase font-bold px-2 py-1 rounded">ENDED</span>}
                        {isUpcoming && <span className="bg-blue-500/20 text-blue-400 text-[10px] uppercase font-bold px-2 py-1 rounded border border-blue-500/20">UPCOMING</span>}

                        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{contest.title}</h3>
                    </div>
                    <p className="text-gray-400 mb-5 max-w-2xl text-sm leading-relaxed">{contest.description}</p>

                    <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-purple-400" />
                            <span>{start.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        {/* Optional: Add Duration or Prize info here */}
                    </div>
                </div>

                <div className="md:text-right w-full md:w-auto min-w-[180px]">
                    {isEnded ? (
                        <button disabled className="bg-gray-800 text-gray-500 border border-gray-700 px-6 py-3 rounded-xl cursor-not-allowed w-full font-medium">Closed</button>
                    ) : (
                        <>
                            {regStatus === 'registered' || regStatus === 'participated' ? (
                                isOngoing ? (
                                    <button onClick={enterContest} className="btn-primary w-full animate-bounce-subtle">
                                        Enter Contest
                                    </button>
                                ) : (
                                    <button disabled className="bg-blue-900/20 text-blue-400 border border-blue-500/30 px-6 py-3 rounded-xl w-full flex items-center justify-center gap-2 font-medium">
                                        <CheckCircle size={18} /> Registered
                                    </button>
                                )
                            ) : (
                                isRegOpen ? (
                                    <button onClick={handleRegister} disabled={loading} className="btn-primary w-full">
                                        {loading ? 'Registering...' : 'Register Now'}
                                    </button>
                                ) : (
                                    <button disabled className="bg-gray-800 text-gray-500 border border-gray-700 px-6 py-3 rounded-xl cursor-not-allowed w-full flex items-center justify-center gap-2">
                                        <Lock size={16} /> Reg Closed
                                    </button>
                                )
                            )}
                        </>
                    )}

                    {regStatus && !isOngoing && !isEnded && (
                        <p className="text-xs text-green-400 mt-3 text-center font-medium">You are all set! 🚀</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper icon
function CheckCircle({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    )
}
