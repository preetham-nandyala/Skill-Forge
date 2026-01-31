"use client";
import { useState } from 'react';
import styles from './page.module.css';
import { Clock, FileText, CheckCircle } from 'lucide-react';

const tests = [
    { id: 1, title: 'React.js Proficiency', type: 'Subject', subject: 'React.js', level: 'Level 1', questions: 20, time: '30m' },
    { id: 2, title: 'Advanced Java Concepts', type: 'Subject', subject: 'Java', level: 'Level 3', questions: 45, time: '60m' },
    { id: 3, title: 'Logical Reasoning Alpha', type: 'Aptitude', subject: 'General', level: 'Level 1', questions: 30, time: '45m' },
    { id: 4, title: 'Full Stack Challenge', type: 'Subject', subject: 'MERN', level: 'Level 2', questions: 40, time: '50m' },
    { id: 5, title: 'Data Structures Sprint', type: 'Coding', subject: 'DSA', level: 'Level 2', questions: 3, time: '90m' },
];

export default function TestsPage() {
    const [filter, setFilter] = useState('All');

    const filteredTests = filter === 'All' ? tests : tests.filter(t => t.type === filter);

    return (
        <div className={`fade-in-up ${styles.container}`}>
            <div className={styles.header}>
                <h1 className={styles.title}>Test Center</h1>
                <p className={styles.subtitle}>
                    Assess your skills with adaptive tests and aptitude challenges designed to simulate real-world interviews.
                </p>

                {/* Filter Tabs */}
                <div className={styles.filterTabs}>
                    {['All', 'Subject', 'Aptitude', 'Coding'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`${styles.filterBtn} ${filter === tab ? styles.activeFilter : ''}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.grid}>
                {filteredTests.map((test) => (
                    <TestCard key={test.id} test={test} />
                ))}
            </div>
        </div>
    );
}

function TestCard({ test }) {
    const color = test.type === 'Subject' ? '#61DAFB' : test.type === 'Aptitude' ? '#A855F7' : '#F29111';

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.typeTag} style={{ color: color, borderColor: `${color}30` }}>
                    {test.type}
                </span>
                <span className={styles.levelTag}>
                    {test.level}
                </span>
            </div>

            <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{test.title}</h3>
                <div className={styles.cardMeta}>
                    {test.subject} • Assessment
                </div>

                <div className={styles.statsRow}>
                    <span className={styles.stat}><Clock size={14} /> {test.time}</span>
                    <span className={styles.stat}><FileText size={14} /> {test.questions} Qs</span>
                </div>
            </div>

            <button className={styles.startBtn}>
                Start Assessment
            </button>
        </div>
    );
}
