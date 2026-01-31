"use client";
import { useState, useEffect } from 'react';
import { fetchCourses } from '@/utils/api';
import { Book, PlayCircle, ChevronRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function LearnPage() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchCourses();
                setCourses(res.data || []);
            } catch (e) {
                console.error("Failed to load courses", e);
            }
        };
        load();
    }, []);

    return (
        <div className={`fade-in-up ${styles.container}`}>
            <div className={styles.header}>
                <h1 className={styles.title}>Learning Paths</h1>
                <p className={styles.subtitle}>
                    Structured modules designed to guide you from basics to advanced proficiency.
                </p>
            </div>

            <div className={styles.grid}>
                {courses.map(course => (
                    <Link href={`/learn/${course._id}`} key={course._id} style={{ textDecoration: 'none' }}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper}>
                                    {course.icon || '🎓'}
                                </div>
                                <div className={styles.arrowIcon}>
                                    <ChevronRight size={24} />
                                </div>
                            </div>

                            <h3 className={styles.cardTitle}>{course.title}</h3>
                            <p className={styles.cardDescription}>
                                {course.description || "Master this topic with comprehensive reading materials and practice sets."}
                            </p>

                            <div className={styles.cardFooter}>
                                <div className={styles.metaItem}>
                                    <Book size={16} className="text-indigo-400" />
                                    {course.levels?.length || 0} Levels
                                </div>
                                {/* Optional: Progress bar or other stats can go here */}
                            </div>
                        </div>
                    </Link>
                ))}

                {courses.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Loading courses...
                    </div>
                )}
            </div>
        </div>
    );
}
