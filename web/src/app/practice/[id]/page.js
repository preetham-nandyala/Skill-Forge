"use client";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import CodeEditor from '@/components/CodeEditor';
import { fetchProblemById, submitCode } from '@/utils/api';
import { Play, Send, CheckCircle2, AlertCircle, Terminal, ChevronDown } from 'lucide-react';
import styles from './page.module.css';

export default function ProblemPage() {
    const params = useParams();
    const id = params.id;

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [output, setOutput] = useState(null);
    const [executing, setExecuting] = useState(false);

    useEffect(() => {
        if (!id) return;
        const loadProblem = async () => {
            try {
                const { data } = await fetchProblemById(id);
                setProblem(data);
                setCode(data.starterCode || '// Start coding here...');
            } catch (error) {
                console.error("Failed to load problem", error);
            } finally {
                setLoading(false);
            }
        };
        loadProblem();
    }, [id]);

    const handleRun = async () => {
        if (!problem) return;
        setExecuting(true);
        setOutput('Running code...');

        try {
            const { data } = await submitCode({
                problemId: problem._id,
                code,
                language
            });

            let result = `Status: ${data.status}\n`;
            result += `Time: ${data.executionTime}ms | Memory: ${data.memoryUsed}KB\n`;
            result += `Tests: ${data.passedTests}/${data.totalTests} Passed\n\n`;
            result += `Output:\n${data.output}`;

            setOutput(result);
        } catch (error) {
            setOutput('Error executing code: ' + (error.response?.data?.message || error.message));
        } finally {
            setExecuting(false);
        }
    };

    if (loading) return <div className="container fade-in-up" style={{ padding: '40px', textAlign: 'center' }}>Loading workspace...</div>;
    if (!problem) return <div className="container fade-in-up" style={{ padding: '40px', textAlign: 'center' }}>Problem not found.</div>;

    const difficultyClass = problem.difficulty === 'Easy' ? styles.difficultyEasy :
        problem.difficulty === 'Medium' ? styles.difficultyMedium :
            styles.difficultyHard;

    return (
        <main className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h2 className={styles.title}>{problem.title}</h2>
                    <span className={`${styles.difficulty} ${difficultyClass}`}>
                        {problem.difficulty}
                    </span>
                </div>

                <div className={styles.actions}>
                    <div className="relative">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className={styles.languageSelect}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                        </select>
                    </div>

                    <button
                        className={styles.runBtn}
                        onClick={handleRun}
                        disabled={executing}
                    >
                        <div className="flex items-center gap-2">
                            <Play size={16} />
                            {executing ? 'Running...' : 'Run'}
                        </div>
                    </button>

                    <button className={styles.submitBtn}>
                        <div className="flex items-center gap-2">
                            <Send size={16} />
                            Submit
                        </div>
                    </button>
                </div>
            </header>

            {/* Workspace */}
            <div className={styles.workspace}>
                {/* Left: Problem Description */}
                <div className={styles.leftPanel}>
                    <div className={styles.description}>
                        {problem.description}
                    </div>

                    <h3 className="text-lg font-bold text-white mt-8 mb-4">Examples</h3>
                    <div className="flex flex-col gap-4">
                        {problem.examples && problem.examples.map((ex, i) => (
                            <div key={i} className={styles.example}>
                                <div className="mb-2">
                                    <strong className={styles.exampleTitle}>Input:</strong>
                                    <span className={`ml-2 ${styles.codeBlock}`}>{ex.input}</span>
                                </div>
                                <div className="mb-2">
                                    <strong className={styles.exampleTitle}>Output:</strong>
                                    <span className={`ml-2 ${styles.codeBlock}`}>{ex.output}</span>
                                </div>
                                {ex.explanation && (
                                    <div>
                                        <strong className={styles.exampleTitle}>Explanation:</strong>
                                        <p className="mt-1 text-gray-400 text-sm">{ex.explanation}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Editor & Console */}
                <div className={styles.rightPanel}>
                    <div className={styles.editorContainer}>
                        <CodeEditor
                            language={language}
                            value={code}
                            onChange={(newValue) => setCode(newValue)}
                        />
                    </div>
                    <div className={styles.consoleContainer}>
                        <div className={styles.consoleHeader}>
                            <div className="flex items-center gap-2">
                                <Terminal size={16} />
                                Console
                            </div>
                            <span className="text-xs text-gray-500">Output Window</span>
                        </div>
                        <div className={styles.consoleContent}>
                            {output ? output : (
                                <div className="text-gray-500 italic">
                                    Run your code to see output here...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
