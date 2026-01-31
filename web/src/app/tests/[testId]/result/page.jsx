"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchTestResults } from '@/utils/api';
import { CheckCircle, XCircle, Clock, Award, BarChart2 } from 'lucide-react';

export default function ResultPage() {
    const { testId } = useParams();
    const router = useRouter();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchTestResults(testId);
                setResult(res.data);
            } catch (e) {
                // If 404, maybe results not ready or hidden
            }
        };
        load();
    }, [testId]);

    if (!result) return <div className="min-h-screen flex items-center justify-center">Loading Results...</div>;

    const { attempt, answers, showDetails } = result;
    const isPass = attempt.score >= (attempt.testId?.passingScore || 50); // Assumption if not in populate

    return (
        <div className="min-h-screen p-8 bg-gray-950 flex justify-center">
            <div className="max-w-4xl w-full">
                <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-2 ${isPass ? 'bg-green-500' : 'bg-red-500'}`}></div>

                    <h1 className="text-3xl font-bold mb-2">Test Completed</h1>
                    <p className="text-gray-400 mb-8">Here is a summary of your performance</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-900 p-4 rounded-2xl">
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Score</p>
                            <p className={`text-3xl font-bold ${isPass ? 'text-green-400' : 'text-red-400'}`}>{attempt.score}</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-2xl">
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Accuracy</p>
                            <p className="text-3xl font-bold text-blue-400">{attempt.accuracy}%</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-2xl">
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Time</p>
                            <p className="text-3xl font-bold text-yellow-400">{Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-2xl">
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Status</p>
                            <p className="text-xl font-bold text-gray-300 capitalize">{attempt.status}</p>
                        </div>
                    </div>

                    <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Return to Dashboard</button>
                </div>

                {showDetails ? (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold mb-4">Question Review</h3>
                        {answers.map((ans, idx) => (
                            <div key={idx} className="bg-gray-800/50 border border-gray-700 p-5 rounded-xl">
                                <div className="flex gap-4">
                                    <div className={`mt-1 flex-shrink-0 ${ans.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                        {ans.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-lg mb-3">{ans.questionId.text}</p>

                                        {/* Simple Options Display for MCQ */}
                                        {ans.questionId.type === 'MCQ' && (
                                            <div className="space-y-2">
                                                {ans.questionId.options.map(opt => {
                                                    const isSelected = ans.selectedOptionId === opt._id;
                                                    const isActualCorrect = opt.isCorrect;

                                                    let style = "bg-gray-900 border-gray-700 text-gray-400";
                                                    if (isActualCorrect) style = "bg-green-900/30 border-green-500/50 text-green-300";
                                                    else if (isSelected && !isActualCorrect) style = "bg-red-900/30 border-red-500/50 text-red-300";

                                                    return (
                                                        <div key={opt._id} className={`p-3 rounded-lg border text-sm flex justify-between ${style}`}>
                                                            <span>{opt.text}</span>
                                                            {isSelected && <span className="text-xs font-bold uppercase">Your Answer</span>}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-gray-800/30 border border-dashed border-gray-700 rounded-xl">
                        <Lock size={32} className="mx-auto mb-2 text-gray-500" />
                        <p className="text-gray-400">Detailed answers are hidden for this test.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
