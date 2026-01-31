"use client";
import { useEffect, useState } from 'react';
import { fetchUserProfile, fetchUserActivity, fetchCourses } from '@/utils/api';
import styles from './page.module.css';
import { Activity, Clock, Book, Trophy, ChevronRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const [stats, setStats] = useState({ problemsSolved: 0, testsTaken: 0, currentStreak: 0, xp: 0 });
    const [recentTests, setRecentTests] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileRes, activityRes, coursesRes] = await Promise.all([
                    fetchUserProfile(),
                    fetchUserActivity(),
                    fetchCourses() // Using this as proxy for progress for now
                ]);

                if (profileRes.data.stats) setStats(profileRes.data.stats);
                if (activityRes.data.recentTests) setRecentTests(activityRes.data.recentTests);
                if (coursesRes.data) setCourses(coursesRes.data.slice(0, 3)); // Top 3 courses

                setLoading(false);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="container min-h-screen flex items-center justify-center text-gray-500">Loading Dashboard...</div>;

    return (
        <main className={`container fade-in-up ${styles.container}`}>
            <h1 className={`gradient-text ${styles.title}`}>Dashboard</h1>
            <p className={styles.subtitle}>Welcome back, explorer.</p>

            <div className={styles.layout}>
                <div className={styles.mainColumn}>
                    {/* Stats Row */}
                    <div className={styles.statsRow}>
                        <StatCard title="Problems Solved" value={stats.problemsSolved} accent="var(--accent-primary)" icon={<Activity size={20} />} />
                        <StatCard title="Tests Taken" value={stats.testsTaken} accent="var(--accent-secondary)" icon={<Clock size={20} />} />
                        <StatCard title="XP Earned" value={stats.xp} accent="#8b5cf6" icon={<Trophy size={20} />} />
                    </div>

                    {/* Module Progress */}
                    <div className={`glass-panel ${styles.recentActivity}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Book size={20} /> Course Progress</h3>
                            <Link href="/learn" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {courses.map(course => (
                                <div key={course._id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{course.icon || '📚'}</span>
                                        <div>
                                            <h4 className="font-semibold">{course.title}</h4>
                                            <p className="text-xs text-gray-400">{course.levels?.length || 0} Levels • Start Learning</p>
                                        </div>
                                    </div>
                                    <Link href={`/learn/${course._id}`}>
                                        <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-gray-300">
                                            <PlayCircle size={18} />
                                        </button>
                                    </Link>
                                </div>
                            ))}
                            {courses.length === 0 && <p className="text-gray-500 text-sm">No enrolled courses yet.</p>}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className={`glass-panel ${styles.recentActivity} mt-6`}>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Clock size={20} /> Recent Tests</h3>
                        <div className="space-y-3">
                            {recentTests.map((attempt) => (
                                <div key={attempt._id} className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${attempt.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <div>
                                            <p className="font-medium text-sm">{attempt.testId?.title || 'Unknown Test'}</p>
                                            <p className="text-xs text-gray-500">{new Date(attempt.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">{attempt.score} Pts</p>
                                        <Link href={`/tests/${attempt.testId?._id}/result`} className="text-xs text-blue-400 hover:text-blue-300">
                                            View Results
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {recentTests.length === 0 && (
                                <div className={styles.emptyState}>
                                    No recent tests found. <Link href="/tests" className="text-blue-400">Take a test</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Recommended */}
                <div className={`glass-panel ${styles.sidebar}`}>
                    <h3>Recommended</h3>
                    <div className={styles.recommendedList}>
                        <RecommendedItem title="Array Basics" type="Topic" difficulty="Easy" />
                        <RecommendedItem title="Logic Building" type="Aptitude" difficulty="Medium" />
                        <RecommendedItem title="SQL Joins" type="Practice" difficulty="Hard" />
                    </div>
                </div>
            </div>
        </main>
    );
}

function StatCard({ title, value, accent, icon }) {
    return (
        <div className={`glass-panel ${styles.statCard}`}>
            <div className="flex justify-between items-start mb-2">
                <span className={styles.statTitle}>{title}</span>
                <span style={{ color: accent, opacity: 0.8 }}>{icon}</span>
            </div>
            <span className={styles.statValue} style={{ color: accent }}>{value}</span>
        </div>
    );
}

function RecommendedItem({ title, type, difficulty }) {
    const diffColor = difficulty === 'Easy' ? '#10b981' : difficulty === 'Medium' ? '#f59e0b' : '#ef4444';

    return (
        <div className={styles.recommendedItem}>
            <div className={styles.itemHeader}>
                <span className={styles.itemTitle}>{title}</span>
                <span className={styles.itemDifficulty} style={{ color: diffColor }}>{difficulty}</span>
            </div>
            <div className={styles.itemType}>{type}</div>
        </div>
    );
}
