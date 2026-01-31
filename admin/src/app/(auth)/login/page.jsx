"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/utils/api';
import styles from './page.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await login({ email, password });

            // The backend now auto-promotes if config ID matches, so we trust the returned role.
            if (data.role !== 'admin') {
                setError('Access Denied. Admins only.');
                return;
            }
            localStorage.setItem('userInfo', JSON.stringify(data));
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <main className={styles.container}>
            <div className={`glass-panel fade-in-up ${styles.card}`}>
                <h2 className={styles.title}>Admin Portal</h2>
                <p className={styles.subtitle}>Secure Login</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <button type="submit" className={`btn-primary ${styles.submitBtn}`}>Access Portal</button>
                </form>
            </div>
        </main>
    );
}
