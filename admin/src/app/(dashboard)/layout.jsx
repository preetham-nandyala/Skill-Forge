"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, BookOpen, Terminal, ClipboardList, LogOut, FileQuestion, Trophy, BarChart2 } from 'lucide-react';
import styles from './layout.module.css';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || userInfo.role !== 'admin') {
            router.push('/login');
        } else {
            setAuthorized(true);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        router.push('/login');
    };

    if (!authorized) return <div className={`container ${styles.verificationLoading}`}>Verifying...</div>;

    const menuItems = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Analytics', icon: BarChart2, path: '/dashboard/analytics' },
        { name: 'Users', icon: Users, path: '/dashboard/users' },
        { name: 'Courses', icon: BookOpen, path: '/dashboard/courses' },
        { name: 'Tests', icon: ClipboardList, path: '/dashboard/tests' },
        { name: 'Contests', icon: Trophy, path: '/dashboard/contests' },
        { name: 'Questions', icon: FileQuestion, path: '/dashboard/questions' },
        { name: 'Problems', icon: Terminal, path: '/dashboard/problems' },
    ];

    return (
        <div className={styles.layoutContainer}>
            {/* Sidebar */}
            <div className={`glass-panel ${styles.sidebar}`}>
                <h2 className={styles.title}>Admin Portal</h2>

                <div className={styles.menuList}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.path} href={item.path} className={styles.menuItemLink}>
                                <div className={styles.menuItem} style={{
                                    background: isActive ? 'var(--accent-primary)' : 'transparent',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                }}>
                                    <item.icon size={18} />
                                    <span className={styles.menuItemName}>{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <button onClick={handleLogout} className={styles.logoutBtn}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {children}
            </div>
        </div>
    );
}
