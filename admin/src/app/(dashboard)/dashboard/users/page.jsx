"use client";
import { useEffect, useState } from 'react';
import { fetchUsers, deleteUser } from '@/utils/api';
import styles from './page.module.css';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const { data } = await fetchUsers();
        setUsers(data);
    };

    const handleDelete = async (id) => {
        if (confirm('Delete user?')) {
            await deleteUser(id);
            loadUsers();
        }
    };

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search));

    return (
        <div className={`fade-in-up ${styles.pageContainer}`}>
            <div className={styles.header}>
                <h1>User Management</h1>
                <input
                    placeholder="Search users..."
                    className={`glass-btn ${styles.search}`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className={`glass-panel ${styles.table}`}>
                <div className={styles.tableHeader}>
                    <span>Name</span>
                    <span>Email</span>
                    <span>Solved</span>
                    <span>Role</span>
                    <span>Actions</span>
                </div>
                {filteredUsers.map(user => (
                    <div key={user._id} className={styles.tableRow}>
                        <div className={styles.userCell}>
                            <div className={styles.avatar}>{user.name[0]}</div>
                            {user.name}
                        </div>
                        <span>{user.email}</span>
                        <span>{user.stats?.problemsSolved || 0}</span>
                        <span className={styles.roleTag} style={{
                            background: user.role === 'admin' ? '#f59e0b20' : '#3b82f620',
                            color: user.role === 'admin' ? '#f59e0b' : '#3b82f6'
                        }}>{user.role}</span>
                        <div>
                            {user.role !== 'admin' && (
                                <button onClick={() => handleDelete(user._id)} className={styles.deleteBtn}>Remove</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
