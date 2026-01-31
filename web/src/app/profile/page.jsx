"use client";
import { useEffect, useState } from 'react';
import { fetchUserProfile, fetchSubmissions, updateProfile } from '@/utils/api';
import styles from './page.module.css';
import { Activity, Award, Calendar, Layers } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data } = await fetchUserProfile();
            setUser(data);
            setFormData({ name: data.name, email: data.email, password: '' });

            const subData = await fetchSubmissions();
            setSubmissions(subData.data);
        } catch (error) {
            console.error("Error loading profile", error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            setEditing(false);
            loadProfile();
        } catch (error) {
            alert('Update failed');
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Profile...</div>;

    return (
        <div className={`fade-in-up ${styles.container}`}>
            <div className={styles.profileHeader}>
                {/* Optional: Add a subtle banner area or keep clean */}
            </div>

            <div className={styles.grid}>
                {/* Left Column: User Card */}
                <aside className={styles.userCard}>
                    <div className={styles.avatarWrapper}>
                        <div className={styles.avatar}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {!editing ? (
                        <>
                            <h2 className={styles.userName}>{user.name}</h2>
                            <p className={styles.userRank}>Rank 12,403</p>

                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Views</div>
                                    <div className={styles.statValue}>0</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Solution</div>
                                    <div className={styles.statValue}>0</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Discuss</div>
                                    <div className={styles.statValue}>0</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Reputation</div>
                                    <div className={styles.statValue}>0</div>
                                </div>
                            </div>

                            <button onClick={() => setEditing(true)} className={styles.editBtn}>
                                Edit Profile
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleUpdate} className={styles.editForm}>
                            <input
                                className={styles.input}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Name"
                            />
                            <div className={styles.formActions}>
                                <button type="submit" className={styles.saveBtn}>Save</button>
                                <button type="button" onClick={() => setEditing(false)} className={styles.cancelBtn}>Cancel</button>
                            </div>
                        </form>
                    )}
                </aside>

                {/* Right Column: Content */}
                <div className={styles.contentArea}>

                    {/* Stats Overview */}
                    <div className={styles.overviewPanel}>
                        <h3 className={styles.panelTitle}>
                            <Layers size={20} className="text-gray-400" />
                            Solved Problems
                        </h3>
                        <div className={styles.solvedStats}>
                            <div className={styles.statCard}>
                                <div className={styles.difficultyLabel}>
                                    <span className={styles.easy}>Easy</span>
                                    <span>/ 24</span>
                                </div>
                                <div>
                                    <span className={styles.count}>0</span>
                                    <span className={styles.total}> / 100</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.difficultyLabel}>
                                    <span className={styles.medium}>Medium</span>
                                    <span>/ 56</span>
                                </div>
                                <div>
                                    <span className={styles.count}>0</span>
                                    <span className={styles.total}> / 200</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.difficultyLabel}>
                                    <span className={styles.hard}>Hard</span>
                                    <span>/ 12</span>
                                </div>
                                <div>
                                    <span className={styles.count}>0</span>
                                    <span className={styles.total}> / 50</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Submissions */}
                    <div className={styles.submissionsPanel}>
                        <h3 className={styles.panelTitle}>
                            <Activity size={20} className="text-gray-400" />
                            Recent Submissions
                        </h3>

                        {submissions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>No submissions recently.</p>
                            </div>
                        ) : (
                            <div className={styles.submissionList}>
                                {submissions.map(sub => (
                                    <div key={sub._id} className={styles.submissionItem}>
                                        <div>
                                            <div className={styles.subTitle}>
                                                {sub.problem ? sub.problem.title : 'Unknown Problem'}
                                            </div>
                                            <div className={styles.subMeta}>
                                                <Calendar size={12} />
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                                <span className={styles.langTag}>{sub.language}</span>
                                            </div>
                                        </div>
                                        <span className={`${styles.subStatus} ${sub.status === 'Accepted' ? styles.accepted : styles.rejected}`}>
                                            {sub.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
