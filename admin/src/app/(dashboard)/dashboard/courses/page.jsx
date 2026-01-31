"use client";
import { useState, useEffect } from 'react';
import { fetchCourses, createCourse, addLevel, addModule, addTopic, addContent } from '../../../../utils/api';
import { Folder, FileText, ChevronRight, ChevronDown, Plus, Layout } from 'lucide-react';
import styles from './page.module.css';

const CourseItem = ({ course, refresh }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={styles.courseItem}>
            <div
                className={styles.courseHeader}
                onClick={() => setExpanded(!expanded)}
            >
                <div className={styles.courseTitle}>
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span style={{ fontSize: '1.2rem' }}>{course.icon}</span>
                    <h3 style={{ margin: 0 }}>{course.title}</h3>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>({course.subjectId})</span>
                </div>
                <button className={styles.addLevelBtn}>
                    + Level
                </button>
            </div>

            {expanded && (
                <div className={styles.courseContent} style={{ borderLeft: `2px solid ${course.color || '#8b5cf6'}` }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{course.description}</p>
                    {course.levels.map(level => (
                        <LevelItem key={level._id} level={level} />
                    ))}
                    {course.levels.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No levels yet.</p>}
                </div>
            )}
        </div>
    );
};

const LevelItem = ({ level }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={styles.levelItem}>
            <div className={styles.levelHeader} onClick={() => setExpanded(!expanded)}>
                <span>Level {level.number}: {level.title}</span>
                <span style={{ fontSize: '0.75rem' }}>+ Module</span>
            </div>
            {expanded && (
                <div className={styles.moduleList}>
                    {level.modules.map(module => (
                        <ModuleItem key={module._id} module={module} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ModuleItem = ({ module }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className={styles.moduleItem}>
            <div className={styles.moduleHeader} onClick={() => setExpanded(!expanded)}>
                <Folder size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>{module.title}</span>
            </div>
            {expanded && (
                <div className={styles.topicList}>
                    {module.topics.map(topic => (
                        <div key={topic._id} className={styles.topicItem}>
                            <FileText size={12} /> {topic.title}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}


export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '', subjectId: '', description: '', icon: '🎓', color: '#8b5cf6'
    });

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const res = await fetchCourses();
        setCourses(res.data);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createCourse(formData);
            setShowCreateModal(false);
            setFormData({ title: '', subjectId: '', description: '', icon: '🎓', color: '#8b5cf6' });
            load();
        } catch (error) {
            alert('Error creating course');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Course Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Structure: Course → Level → Module → Topic → Content</p>
                </div>
                <button className={styles.newCourseBtn} onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} /> New Course
                </button>
            </div>

            <div className={styles.hierarchy}>
                {courses.map(c => (
                    <CourseItem key={c._id} course={c} refresh={load} />
                ))}
            </div>

            {showCreateModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 style={{ marginBottom: '16px', fontWeight: 700 }}>New Course</h2>
                        <form onSubmit={handleCreate} className={styles.form}>
                            <input
                                placeholder="Course Title"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                style={{ background: '#27272a', border: '1px solid #3f3f46', padding: '8px', color: 'white', borderRadius: '6px' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input
                                    placeholder="Subject ID (e.g. react-101)"
                                    required
                                    value={formData.subjectId}
                                    onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                                    style={{ background: '#27272a', border: '1px solid #3f3f46', padding: '8px', color: 'white', borderRadius: '6px' }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        placeholder="Icon"
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        style={{ background: '#27272a', border: '1px solid #3f3f46', padding: '8px', color: 'white', borderRadius: '6px', width: '60px', textAlign: 'center' }}
                                    />
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        style={{ background: 'none', border: 'none', height: '40px', width: '100%' }}
                                    />
                                </div>
                            </div>
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                style={{ background: '#27272a', border: '1px solid #3f3f46', padding: '8px', color: 'white', borderRadius: '6px', minHeight: '80px' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', color: '#a1a1aa', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" className={styles.newCourseBtn}>Create Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
