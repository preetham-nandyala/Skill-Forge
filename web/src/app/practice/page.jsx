"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchProblems } from '@/utils/api';
import { FileText, CheckCircle2, Circle, Search, Filter, Hash, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function PracticeList() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadProblems = async () => {
            try {
                const { data } = await fetchProblems();
                setProblems(data);
            } catch (error) {
                console.error("Failed to fetch problems", error);
            } finally {
                setLoading(false);
            }
        };
        loadProblems();
    }, []);

    const filteredProblems = problems.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`fade-in-up ${styles.container}`}>
            {/* Header Section */}
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={styles.iconWrapper}>
                        <Hash size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className={styles.title}>Problem List</h1>
                        <p className={styles.subtitle}>Curated algorithms for interviews & competitive programming</p>
                    </div>
                </div>

                <div className={styles.controls}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Problem Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th className={`${styles.th} w-16 text-center`}>Status</th>
                            <th className={styles.th}>Title</th>
                            <th className={`${styles.th} w-32`}>Difficulty</th>
                            <th className={`${styles.th} w-32`}>Acceptance</th>
                            <th className={`${styles.th} w-24 text-center`}>Action</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {loading ? (
                            <tr className={styles.loadingRow}>
                                <td colSpan="5">
                                    Loading problems...
                                </td>
                            </tr>
                        ) : filteredProblems.length === 0 ? (
                            <tr className={styles.loadingRow}>
                                <td colSpan="5">
                                    No problems found matching "{searchTerm}"
                                </td>
                            </tr>
                        ) : (
                            filteredProblems.map((problem) => (
                                <tr key={problem._id}>
                                    <td className={`${styles.td} text-center`}>
                                        <div className={styles.status}>
                                            {/* Placeholder for solved status logic */}
                                            <Circle size={16} className={styles.unsolved} />
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <Link href={`/practice/${problem._id}`} className={styles.problemTitleLink}>
                                            {problem.title}
                                        </Link>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={`${styles.difficulty} ${problem.difficulty === 'Easy' ? styles.easy :
                                                problem.difficulty === 'Medium' ? styles.medium :
                                                    styles.hard
                                            }`}>
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        {problem.acceptanceRate || '—'}%
                                    </td>
                                    <td className={`${styles.td} text-center`}>
                                        <Link href={`/practice/${problem._id}`}>
                                            <button className={styles.actionBtn} aria-label="Solve Problem">
                                                <ArrowRight size={18} />
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
