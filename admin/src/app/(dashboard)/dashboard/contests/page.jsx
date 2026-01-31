"use client";
import { useState, useEffect } from 'react';
import { fetchContests, createContest, updateContest, deleteContest, fetchTests } from '../../../../utils/api';
import { Plus, Calendar, Trophy, Trash2, Edit } from 'lucide-react';

export default function ContestsPage() {
    const [contests, setContests] = useState([]);
    const [tests, setTests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ contestId: '', title: '', description: '', testId: '', startTime: '', endTime: '', registrationStartTime: '', registrationEndTime: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [cData, tData] = await Promise.all([fetchContests(), fetchTests()]);
        setContests(cData.data);
        setTests(tData.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateContest(editingId, formData);
            } else {
                await createContest(formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ title: '', description: '', testId: '', startTime: '', endTime: '', registrationStartTime: '', registrationEndTime: '' });
            loadData();
        } catch (error) {
            alert('Failed to save contest');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this contest?')) {
            await deleteContest(id);
            loadData();
        }
    };

    const openEdit = (contest) => {
        setEditingId(contest._id);
        setFormData({
            title: contest.title,
            description: contest.description,
            testId: contest.testId?._id || contest.testId, // Handle population
            startTime: contest.startTime.slice(0, 16),
            endTime: contest.endTime.slice(0, 16),
            registrationStartTime: contest.registrationStartTime?.slice(0, 16) || '',
            registrationEndTime: contest.registrationEndTime?.slice(0, 16) || ''
        });
        setIsModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Contest Scheduler</h1>
                    <p className="text-gray-400">Manage competitive programming events</p>
                </div>
                <button
                    onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} /> Create Contest
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contests.map(contest => (
                    <div key={contest._id} className="bg-gray-800/50 border border-gray-700 p-5 rounded-xl hover:border-purple-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-purple-500/10 p-3 rounded-lg text-purple-400">
                                <Trophy size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(contest)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDelete(contest._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{contest.title}</h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{contest.description}</p>

                        <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <span>Start: {new Date(contest.startTime).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <span>End: {new Date(contest.endTime).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                            <span className={`px-2 py-1 rounded text-xs ${contest.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                                    contest.status === 'ongoing' ? 'bg-green-500/20 text-green-400' :
                                        'bg-gray-700 text-gray-400'
                                }`}>
                                {contest.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Contest' : 'New Contest'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-purple-500 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-purple-500 outline-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Linked Test</label>
                                <select
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-purple-500 outline-none"
                                    value={formData.testId}
                                    onChange={e => setFormData({ ...formData, testId: e.target.value })}
                                    required
                                >
                                    <option value="">Select a Test</option>
                                    {tests.map(t => (
                                        <option key={t._id} value={t._id}>{t.title} ({t.type})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Time</label>
                                    <input type="datetime-local" className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                                        value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time</label>
                                    <input type="datetime-local" className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                                        value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Reg. Start</label>
                                    <input type="datetime-local" className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                                        value={formData.registrationStartTime} onChange={e => setFormData({ ...formData, registrationStartTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Reg. End</label>
                                    <input type="datetime-local" className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                                        value={formData.registrationEndTime} onChange={e => setFormData({ ...formData, registrationEndTime: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">Save Contest</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
