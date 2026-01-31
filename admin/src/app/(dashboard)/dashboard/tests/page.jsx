"use client";
import { useState, useEffect } from 'react';
import { fetchTests, createTest, updateTest, deleteTest, cloneTest, fetchQuestions, addQuestionsToTest, removeQuestionFromTest, reorderTestQuestions, fetchTestById } from '../../../../utils/api';
import { Plus, Search, Edit, Trash2, Copy, Move, ChevronRight, Check } from 'lucide-react';
import styles from './page.module.css';

export default function TestsPage() {
    const [tests, setTests] = useState([]);
    const [view, setView] = useState('list'); // 'list' | 'editor'
    const [currentTest, setCurrentTest] = useState(null);

    // Editor State
    const [testQuestions, setTestQuestions] = useState([]);
    const [bankQuestions, setBankQuestions] = useState([]);
    const [searchBank, setSearchBank] = useState('');

    // Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', duration: 30, type: 'Topic', passingScore: 50,
        startDate: '', endDate: '', showAnswers: true
    });

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {
        const res = await fetchTests();
        setTests(res.data);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        await createTest(formData);
        setIsCreateOpen(false);
        setFormData({ title: '', description: '', duration: 30, type: 'Topic', passingScore: 50, startDate: '', endDate: '', showAnswers: true });
        loadTests();
    };

    const handleClone = async (id) => {
        if (confirm('Clone this test?')) {
            await cloneTest(id);
            loadTests();
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this test?')) {
            await deleteTest(id);
            loadTests();
        }
    };

    // --- EDITOR LOGIC ---
    const openEditor = async (testId) => {
        try {
            const res = await fetchTestById(testId);
            setCurrentTest(res.data);
            setTestQuestions(res.data.questions || []);
            setView('editor');
            loadBank(); // Initial load
        } catch (e) { alert('Error loading test details'); }
    };

    const loadBank = async () => {
        const res = await fetchQuestions({ keyword: searchBank });
        setBankQuestions(res.data);
    };

    useEffect(() => {
        if (view === 'editor') {
            const delay = setTimeout(loadBank, 500);
            return () => clearTimeout(delay);
        }
    }, [searchBank, view]);

    const addToTest = async (qId) => {
        await addQuestionsToTest(currentTest._id, [qId]);
        const res = await fetchTestById(currentTest._id);
        setTestQuestions(res.data.questions);
    };

    const removeFromTest = async (qId) => {
        await removeQuestionFromTest(currentTest._id, qId);
        const res = await fetchTestById(currentTest._id);
        setTestQuestions(res.data.questions);
    };

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'Easy': return '#22c55e';
            case 'Medium': return '#eab308';
            case 'Hard': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    return (
        <div className={styles.pageContainer}>
            {view === 'list' && (
                <>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Test Builder</h1>
                        <button onClick={() => setIsCreateOpen(true)} className={styles.submitBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={18} /> New Test
                        </button>
                    </div>
                    <div className={styles.grid}>
                        {tests.map(test => (
                            <div key={test._id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.cardTitle}>{test.title}</h3>
                                    <div className={styles.cardMeta}>{test.type} • {test.duration} mins</div>
                                </div>
                                <div className={styles.cardActions}>
                                    <button onClick={() => openEditor(test._id)} className={styles.editBtn}>
                                        Edit / Questions <ChevronRight size={16} />
                                    </button>
                                    <div className={styles.iconActions}>
                                        <button onClick={() => handleClone(test._id)} className={styles.iconBtn}><Copy size={16} /></button>
                                        <button onClick={() => handleDelete(test._id)} className={`${styles.iconBtn} ${styles.delete}`}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {isCreateOpen && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <h2 className={styles.modalTitle}>Create Test</h2>
                                <form onSubmit={handleCreate} className={styles.form}>
                                    <input placeholder="Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="Topic">Topic Test</option>
                                        <option value="Mock">Mock Test</option>
                                        <option value="Company">Company Test</option>
                                        <option value="Contest">Contest</option>
                                    </select>
                                    <div className={styles.formRow}>
                                        <input type="number" placeholder="Duration (mins)" required value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                                        <input type="number" placeholder="Passing Score" value={formData.passingScore} onChange={e => setFormData({ ...formData, passingScore: e.target.value })} />
                                    </div>

                                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Scheduling (Optional)</h3>
                                    <div className={styles.formRow}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Start Date</label>
                                            <input type="datetime-local" value={formData.startDate || ''} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>End Date</label>
                                            <input type="datetime-local" value={formData.endDate || ''} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input type="checkbox" id="showAnswers" style={{ width: 'auto' }} checked={formData.showAnswers !== false} onChange={e => setFormData({ ...formData, showAnswers: e.target.checked })} />
                                        <label htmlFor="showAnswers" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Show answers after submission</label>
                                    </div>

                                    <div className={styles.modalActions}>
                                        <button type="button" onClick={() => setIsCreateOpen(false)} className={styles.cancelBtn}>Cancel</button>
                                        <button type="submit" className={styles.submitBtn}>Create</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}

            {view === 'editor' && currentTest && (
                <div className={styles.editorContainer}>
                    <div className={styles.editorHeader}>
                        <button onClick={() => setView('list')} className={styles.backBtn}>← Back</button>
                        <h1 className={styles.title}>Editing: {currentTest.title}</h1>
                    </div>

                    <div className={styles.editorGrid}>
                        <div className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <span>Questions in Test ({testQuestions.length})</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Drag to reorder</span>
                            </div>
                            <div className={styles.panelContent}>
                                {testQuestions.map((tq, idx) => (
                                    <div key={tq._id} className={styles.questionItem}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                width: '24px', height: '24px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                borderRadius: '4px', fontSize: '0.75rem'
                                            }}>{idx + 1}</span>
                                            <div>
                                                <p style={{ fontWeight: 500, margin: 0 }}>{tq.questionId.text.substring(0, 60)}...</p>
                                                <div className={styles.qMeta}>
                                                    <span>{tq.questionId.type}</span>
                                                    <span>{tq.questionId.difficulty}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromTest(tq.questionId._id)} style={{ color: '#f87171', border: 'none', background: 'none', cursor: 'pointer' }}>Remove</button>
                                    </div>
                                ))}
                                {testQuestions.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No questions added yet. Select from the bank →</div>}
                            </div>
                        </div>

                        <div className={styles.panel}>
                            <div className={styles.panelHeader} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                                <span>Question Bank</span>
                                <input
                                    placeholder="Search questions..."
                                    value={searchBank}
                                    onChange={e => setSearchBank(e.target.value)}
                                    style={{ fontSize: '0.9rem' }}
                                />
                            </div>
                            <div className={styles.panelContent}>
                                {bankQuestions
                                    .filter(bq => !testQuestions.some(tq => tq.questionId._id === bq._id))
                                    .map(q => (
                                        <div key={q._id} className={styles.questionItem} style={{ cursor: 'pointer' }} onClick={() => addToTest(q._id)}>
                                            <div style={{ width: '100%' }}>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', lineHeight: '1.4' }}>{q.text.substring(0, 80)}...</p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span className={styles.difficultyTag} style={{ color: getDifficultyColor(q.difficulty), background: `${getDifficultyColor(q.difficulty)}20` }}>
                                                        {q.difficulty}
                                                    </span>
                                                    <Plus size={14} style={{ opacity: 0.5 }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
