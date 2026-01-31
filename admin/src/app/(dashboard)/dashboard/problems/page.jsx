"use client";
import { useEffect, useState } from 'react';
import { fetchProblems, createProblem } from '@/utils/api';
import styles from './page.module.css';

export default function ProblemsPage() {
    const [problems, setProblems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', difficulty: 'Easy', tags: '', starterCode: '', solutionCode: '',
        testCases: []
    });

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        const { data } = await fetchProblems();
        setProblems(data);
    };

    const addTestCase = () => {
        setFormData({
            ...formData,
            testCases: [...formData.testCases, { input: '', output: '', isHidden: false }]
        });
    };

    const updateTestCase = (index, field, value) => {
        const newCases = [...formData.testCases];
        newCases[index][field] = value;
        setFormData({ ...formData, testCases: newCases });
    };

    const removeTestCase = (index) => {
        const newCases = formData.testCases.filter((_, i) => i !== index);
        setFormData({ ...formData, testCases: newCases });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const tagsArray = formData.tags.includes(',') ? formData.tags.split(',').map(t => t.trim()) : (formData.tags ? [formData.tags] : []);
            await createProblem({ ...formData, tags: tagsArray });
            setShowModal(false);
            loadProblems();
            setFormData({ title: '', description: '', difficulty: 'Easy', tags: '', starterCode: '', solutionCode: '', testCases: [] });
        } catch (error) {
            alert('Failed to create problem');
        }
    };

    return (
        <div className={`fade-in-up ${styles.pageContainer}`}>
            <div className={styles.header}>
                <h1>Coding Problems</h1>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Problem</button>
            </div>

            <div className={`glass-panel ${styles.list}`}>
                {problems.map(problem => (
                    <div key={problem._id} className={styles.listItem}>
                        <div>
                            <div className={styles.itemTitle}>{problem.title}</div>
                            <div className={styles.itemMeta}>
                                <span className={styles.difficultyTag} style={{
                                    color: problem.difficulty === 'Easy' ? '#10b981' : problem.difficulty === 'Medium' ? '#f59e0b' : '#ef4444',
                                }}>{problem.difficulty}</span>
                                {problem.tags.join(', ')}
                            </div>
                        </div>
                        <button className={`glass-btn ${styles.editBtn}`}>Edit</button>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={`glass-panel ${styles.modal}`}>
                        <h2 className={styles.modalTitle}>Add Coding Problem</h2>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGrid}>
                                <input className={`glass-btn ${styles.input}`} placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                <select className={`glass-btn ${styles.input}`} value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                            <textarea className={`glass-btn ${styles.input}`} rows={3} placeholder="Description (Markdown supported)" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                            <input className={`glass-btn ${styles.input}`} placeholder="Tags (comma separated)" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />

                            <div className={styles.codeGrid}>
                                <textarea className={`glass-btn ${styles.input} ${styles.codeArea}`} rows={6} placeholder="Starter Code" value={formData.starterCode} onChange={e => setFormData({ ...formData, starterCode: e.target.value })} />
                                <textarea className={`glass-btn ${styles.input} ${styles.codeArea}`} rows={6} placeholder="Solution Code (Hidden)" value={formData.solutionCode} onChange={e => setFormData({ ...formData, solutionCode: e.target.value })} />
                            </div>

                            <div className={styles.testCasesSection}>
                                <div className={styles.sectionHeader}>
                                    <h3>Test Cases</h3>
                                    <button type="button" onClick={addTestCase} className="text-xs bg-gray-700 px-2 py-1 rounded">+ Add Case</button>
                                </div>
                                {formData.testCases.map((tc, idx) => (
                                    <div key={idx} className={styles.testCaseRow}>
                                        <input className={styles.testInput} placeholder="Input" value={tc.input} onChange={e => updateTestCase(idx, 'input', e.target.value)} />
                                        <input className={styles.testInput} placeholder="Output" value={tc.output} onChange={e => updateTestCase(idx, 'output', e.target.value)} />
                                        <label className={styles.checkboxLabel}>
                                            <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestCase(idx, 'isHidden', e.target.checked)} />
                                            Hide
                                        </label>
                                        <button type="button" onClick={() => removeTestCase(idx)} className="text-red-400">x</button>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" className="glass-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create Problem</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
