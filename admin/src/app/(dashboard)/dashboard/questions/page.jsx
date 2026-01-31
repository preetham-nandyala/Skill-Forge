"use client";
import { useState, useEffect } from 'react';
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } from '../../../../utils/api';
import { Plus, Search, Edit, Trash2, CheckCircle, Code } from 'lucide-react';

export default function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ text: '', type: 'MCQ', difficulty: 'Medium', options: [{ text: '', isCorrect: false }], correctAnswer: '', points: 1, tags: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadData();
    }, [search]);

    const loadData = async () => {
        const res = await fetchQuestions({ keyword: search });
        setQuestions(res.data);
    };

    const handleOptionChange = (idx, field, value) => {
        const newOpts = [...formData.options];
        newOpts[idx][field] = value;
        setFormData({ ...formData, options: newOpts });
    };

    const addOption = () => {
        setFormData({ ...formData, options: [...formData.options, { text: '', isCorrect: false }] });
    };

    const removeOption = (idx) => {
        const newOpts = formData.options.filter((_, i) => i !== idx);
        setFormData({ ...formData, options: newOpts });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()) // Convert tags string to array
        };
        try {
            if (editingId) {
                await updateQuestion(editingId, payload);
            } else {
                await createQuestion(payload);
            }
            setIsModalOpen(false);
            setEditingId(null);
            loadData();
        } catch (error) {
            alert('Error saving question');
        }
    };

    const openEdit = (q) => {
        setEditingId(q._id);
        setFormData({
            text: q.text,
            type: q.type,
            difficulty: q.difficulty,
            options: q.options || [],
            correctAnswer: q.correctAnswer || '',
            points: q.points,
            tags: q.tags ? q.tags.join(', ') : ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Delete question?')) {
            await deleteQuestion(id);
            loadData();
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Question Bank</h1>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ text: '', type: 'MCQ', difficulty: 'Medium', options: [{ text: '', isCorrect: false }], correctAnswer: '', points: 1, tags: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} /> New Question
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2 pl-10 pr-4 focus:border-blue-500 outline-none"
                    placeholder="Search by keywords..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {questions.map(q => (
                    <div key={q._id} className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
                        <div className="flex justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                            q.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {q.difficulty}
                                    </span>
                                    <span className="text-xs text-gray-500">{q.type}</span>
                                    {q.isLatest && <span className="text-xs bg-blue-500/20 text-blue-400 px-1 rounded">Latest v{q.version}</span>}
                                </div>
                                <p className="font-medium mb-2">{q.text}</p>
                                <div className="flex flex-wrap gap-2">
                                    {q.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(q)} className="p-2 hover:bg-gray-700 rounded text-gray-400">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDelete(q._id)} className="p-2 hover:bg-red-500/10 rounded text-red-400">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Question' : 'New Question'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Question Text</label>
                                <textarea required className="w-full bg-gray-800 border border-gray-700 rounded p-2" rows={3}
                                    value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                                        value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="MCQ">MCQ</option>
                                        <option value="CODE">Code</option>
                                        <option value="TEXT">Text</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                                    <select className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                                        value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Points</label>
                                    <input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                                        value={formData.points} onChange={e => setFormData({ ...formData, points: e.target.value })} />
                                </div>
                            </div>

                            {formData.type === 'MCQ' && (
                                <div className="space-y-2 border border-gray-700 p-4 rounded-lg">
                                    <label className="text-sm font-medium">Options</label>
                                    {formData.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input type="checkbox" checked={opt.isCorrect}
                                                onChange={e => handleOptionChange(idx, 'isCorrect', e.target.checked)}
                                                className="w-4 h-4 accent-blue-500" />
                                            <input className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                                                value={opt.text} onChange={e => handleOptionChange(idx, 'text', e.target.value)} placeholder={`Option ${idx + 1}`} required />
                                            <button type="button" onClick={() => removeOption(idx)} className="text-red-400 hover:text-red-300">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addOption} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2">
                                        <Plus size={14} /> Add Option
                                    </button>
                                </div>
                            )}

                            {formData.type !== 'MCQ' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Correct Answer (Optional Match)</label>
                                    <textarea className="w-full bg-gray-800 border border-gray-700 rounded p-2" rows={2}
                                        value={formData.correctAnswer} onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })} />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                                <input className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                                    value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g. arrays, logic, math" />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400">Cancel</button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
