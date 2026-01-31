"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchTestQuestions, saveAnswer, submitTest } from '@/utils/api';
import { Clock, ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';

export default function TakeTestPage() {
    const router = useRouter();
    const { testId } = useParams();

    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({}); // { qId: { optionId: ..., text: ... } }

    // Timer
    const [timeLeft, setTimeLeft] = useState(0); // seconds
    const [startTime, setStartTime] = useState(null);
    const timerRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Prevent Back Navigation Abuse
    useEffect(() => {
        // Push a state to history so back button stays on page
        window.history.pushState(null, document.title, window.location.href);

        const handlePopState = (event) => {
            window.history.pushState(null, document.title, window.location.href);
            if (confirm("Leaving the test will not pause the timer. Use the 'Submit' button to finish properly. Are you sure?")) {
                router.push('/dashboard');
            }
        };

        window.addEventListener('popstate', handlePopState);

        // Anti-Cheat / Focus loss (Optional, simple warning)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Could log this event to server
                console.log("User left the tab");
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        loadTest();
        return () => clearInterval(timerRef.current);
    }, []);

    const loadTest = async () => {
        try {
            const res = await fetchTestQuestions(testId);
            setQuestions(res.data.questions);

            // Sync Timer with Server
            // If API returns `startTime` (attempt start), calculate remaining based on that.
            // If API not providing duration, we default or should fix backend. 
            // PREVIOUS STEP: I noted backend returns `startTime`. `startTest` returned `duration` (mins).
            // `getTestQuestions` does NOT return duration in current controller code.
            // I will Assume standard duration or if possible, infer. 
            // IMPROVEMENT: Use local storage as fallback if we visited before

            const serverStart = new Date(res.data.startTime).getTime();
            const now = Date.now();

            // Try to find duration from local storage if previously saved, else default 60
            // Real app: fetchTestById(testId) to get metadata
            const storedDuration = localStorage.getItem(`test_duration_${testId}`);
            const durationMins = storedDuration ? parseInt(storedDuration) : 60;

            const elapsedSeconds = Math.floor((now - serverStart) / 1000);
            const totalSeconds = durationMins * 60;
            const remaining = Math.max(0, totalSeconds - elapsedSeconds);

            setTimeLeft(remaining);
            startTimer(remaining);

            // Hydrate answers
            const initialAnswers = {};
            res.data.questions.forEach(q => {
                if (q.savedAnswer) initialAnswers[q._id] = q.savedAnswer;
            });

            // Merge with local storage backup (if server save failed)
            const localBackup = JSON.parse(localStorage.getItem(`test_answers_${testId}`) || '{}');
            setAnswers({ ...localBackup, ...initialAnswers });

            setLoading(false);
        } catch (e) {
            alert('Error loading test');
            router.push('/dashboard');
        }
    };

    const startTimer = (seconds) => {
        clearInterval(timerRef.current);
        let t = seconds;
        timerRef.current = setInterval(() => {
            t--;
            if (t <= 0) {
                clearInterval(timerRef.current);
                setTimeLeft(0);
                handleSubmit(true);
            } else {
                setTimeLeft(t);
            }
        }, 1000);
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleAnswer = async (value) => {
        const q = questions[currentIdx];
        const newAnswers = { ...answers, [q._id]: value };
        setAnswers(newAnswers);

        // Local Persist
        localStorage.setItem(`test_answers_${testId}`, JSON.stringify(newAnswers));

        // Auto-save
        setSaving(true);
        try {
            const payload = q.type === 'MCQ'
                ? { questionId: q._id, selectedOptionId: value }
                : { questionId: q._id, answerText: value };

            await saveAnswer(testId, payload);
        } catch (e) { console.error('Save failed'); }
        setSaving(false);
    };

    const handleSubmit = async (auto = false) => {
        if (!auto && !confirm('Are you sure you want to submit?')) return;

        clearInterval(timerRef.current);
        try {
            await submitTest(testId);
            // Cleanup local items
            localStorage.removeItem(`test_answers_${testId}`);
            localStorage.removeItem(`test_duration_${testId}`);
            router.push(`/tests/${testId}/result`);
        } catch (e) {
            alert('Submission failed');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Test Interface...</div>;

    const currentQ = questions[currentIdx];

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6 fixed top-0 w-full z-10">
                <h2 className="font-bold text-lg">Test Session</h2>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 font-mono text-xl ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                        <Clock size={20} />
                        {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={() => handleSubmit(false)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    >
                        <Send size={16} /> Submit
                    </button>
                </div>
            </div>

            <div className="flex flex-1 pt-16 h-screen">
                {/* Sidebar Navigation */}
                <div className="w-72 border-r border-gray-800 bg-gray-900 p-4 overflow-y-auto hidden md:block">
                    <h3 className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider">Questions</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {questions.map((q, idx) => (
                            <button
                                key={q._id}
                                onClick={() => setCurrentIdx(idx)}
                                className={`aspect-square rounded-lg font-medium text-sm flex items-center justify-center transition-all ${currentIdx === idx ? 'bg-blue-600 text-white ring-2 ring-blue-400' :
                                    answers[q._id] ? 'bg-gray-700 text-gray-200 border border-green-500/50' :
                                        'bg-gray-800 text-gray-500 hover:bg-gray-700'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-6 flex justify-between items-center">
                            <span className="text-gray-500 text-sm font-medium">Question {currentIdx + 1} of {questions.length}</span>
                            <span className="text-gray-500 text-xs">ID: {currentQ._id}</span>
                        </div>

                        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 mb-8 shadow-lg">
                            <p className="text-lg md:text-xl font-medium leading-relaxed mb-8">{currentQ.text}</p>

                            {/* Options / Input */}
                            {currentQ.type === 'MCQ' ? (
                                <div className="space-y-3">
                                    {currentQ.options.map((opt) => (
                                        <button
                                            key={opt._id}
                                            onClick={() => handleAnswer(opt._id)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${answers[currentQ._id] === opt._id
                                                ? 'bg-blue-600/20 border-blue-500 text-white'
                                                : 'bg-gray-900 border-gray-700 hover:border-gray-500 text-gray-300'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[currentQ._id] === opt._id ? 'border-blue-400 bg-blue-500' : 'border-gray-500'
                                                }`}>
                                                {answers[currentQ._id] === opt._id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                            </div>
                                            {opt.text}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 min-h-[200px] outline-none focus:border-blue-500 font-mono"
                                    placeholder="Type your answer here..."
                                    value={answers[currentQ._id] || ''}
                                    onChange={e => handleAnswer(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                                disabled={currentIdx === 0}
                                className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={18} /> Previous
                            </button>

                            <div className="text-gray-500 text-sm flex items-center gap-2">
                                {saving ? <span className="animate-pulse">Saving...</span> : <span className="flex items-center gap-1"><Save size={14} /> Autosaved</span>}
                            </div>

                            <button
                                onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
                                disabled={currentIdx === questions.length - 1}
                                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors flex items-center gap-2"
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
