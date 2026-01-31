"use client";
import { useEffect, useState } from 'react';
import { fetchUsers, fetchProblems, fetchTests } from '@/utils/api';
import styles from './page.module.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, problems: 0, tests: 0 });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const users = await fetchUsers();
                const problems = await fetchProblems();
                const tests = await fetchTests();

                setStats({
                    users: users.data.length,
                    problems: problems.data.length,
                    tests: tests.data.length
                });
            } catch (error) {
                console.error(error);
            }
        };
        loadStats();
    }, []);

    return (
        <div className={`fade-in-up ${styles.pageContainer}`}>
            <h1 className={styles.title}>Admin Overview</h1>
            <p className={styles.subtitle}>Platform statistics and quick actions.</p>

            <div className={styles.statsGrid}>
                <StatCard title="Total Users" value={stats.users} color="#3b82f6" />
                <StatCard title="Problems" value={stats.problems} color="#10b981" />
                <StatCard title="Tests Created" value={stats.tests} color="#f59e0b" />
                <StatCard title="Active Courses" value="2" color="#8b5cf6" />
            </div>
        </div>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div className={`glass-panel ${styles.statCard}`}>
            <div className={styles.statTitle}>{title}</div>
            <div className={styles.statValue} style={{ color: color }}>{value}</div>
        </div>
    );
}
