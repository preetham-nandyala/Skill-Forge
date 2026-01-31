"use client";
import { useState, useEffect } from 'react';
import { fetchCourses } from '@/utils/api';
import { PlayCircle, FileText, CheckCircle, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function CourseDetailPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [activeLevel, setActiveLevel] = useState(null);

    useEffect(() => {
        const load = async () => {
            // Mocking fetch specific course logic via filtering list for now as simple fetchById wasn't added explicitly
            // But actually backend getCourses returns all. We can filter client side or ideally add getCourseById. 
            // Assuming getCourses for now.
            try {
                const res = await fetchCourses();
                const found = res.data.find(c => c._id === courseId);
                setCourse(found);
                if (found?.levels?.length > 0) setActiveLevel(found.levels[0]._id);
            } catch (e) { }
        };
        load();
    }, [courseId]);

    if (!course) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Sidebar: Levels & Modules */}
            <div className="w-80 border-r border-gray-800 bg-gray-900/50 overflow-y-auto p-4">
                <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <span className="text-2xl">{course.icon}</span> {course.title}
                </h2>

                <div className="space-y-4">
                    {course.levels?.map((level, idx) => (
                        <div key={level._id} className="border border-gray-800 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setActiveLevel(activeLevel === level._id ? null : level._id)}
                                className={`w-full p-3 flex justify-between items-center text-left transition-colors ${activeLevel === level._id ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
                            >
                                <span className="font-medium">Level {level.number}</span>
                                {activeLevel === level._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {activeLevel === level._id && (
                                <div className="bg-gray-900 p-2 space-y-1">
                                    {level.modules?.map(module => (
                                        <div key={module._id} className="p-2 rounded hover:bg-gray-800 cursor-pointer group">
                                            <p className="text-sm font-medium text-gray-300 group-hover:text-white mb-1">{module.title}</p>
                                            <div className="pl-2 border-l border-gray-700 space-y-1">
                                                {module.topics?.map(topic => (
                                                    <div key={topic._id} className="flex items-center gap-2 text-xs text-gray-500 hover:text-purple-400 py-1">
                                                        <FileText size={12} /> {topic.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Viewer (Placeholder for "Select a topic") */}
            <div className="flex-1 p-10 flex flex-col items-center justify-center text-center">
                <div className="bg-gray-800/50 p-6 rounded-full mb-6">
                    <PlayCircle size={48} className="text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Ready to start learning?</h2>
                <p className="text-gray-400 max-w-md">Select a module from the sidebar to begin navigating the course content.</p>
            </div>
        </div>
    );
}
