"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { startTest } from '@/utils/api';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TestInstructions() {
    const router = useRouter();
    const { testId } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await startTest(testId);
            // Save duration for timer sync in next page
            if (res.data.duration) {
                localStorage.setItem(`test_duration_${testId}`, res.data.duration);
            }
            router.push(`/tests/${testId}/take`);
        } catch (err) {
            // Check if we are resuming an existing attempt
            if (err.response?.status === 400 && err.response?.data?.attempt) {
                // Resuming...
                // If attempt is timed-out, show error
                if (err.response.data.attempt.status === 'timed-out') {
                    setError("This test attempt has expired.");
                } else {
                    // Active attempt, proceed
                    router.push(`/tests/${testId}/take`);
                }
            } else if (err.response?.data?.attempt) {
                // Some other resume case
                router.push(`/tests/${testId}/take`);
            } else {
                setError(err.response?.data?.message || 'Failed to start test');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
                <h1 className="text-3xl font-bold mb-6">Test Instructions</h1>

                <div className="space-y-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-500/20 p-2 rounded text-blue-400 mt-1">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Timed Assessment</h3>
                            <p className="text-gray-400">The timer starts as soon as you click "Start Test". It cannot be paused.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-yellow-500/20 p-2 rounded text-yellow-400 mt-1">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Auto-Submission</h3>
                            <p className="text-gray-400">The test will automatically submit when the timer expires. Save your answers frequently.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-green-500/20 p-2 rounded text-green-400 mt-1">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Browser Rules</h3>
                            <p className="text-gray-400">Do not refresh or close the window excessively. Your session state is saved but full reloads are risky.</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-xl hover:bg-gray-700 text-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStart}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Starting...' : 'Start Test Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}
