"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/reducers/authSlice';
import styles from './Navbar.module.css';
import { UserCircle, LogOut, LayoutDashboard, GraduationCap, Code2, FileCheck, Trophy } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);

    const isActive = (path) => pathname === path;

    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/auth/login');
        setShowDropdown(false);
    };

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <nav className={styles.nav}>
            <Link href="/" className={styles.logoLink}>
                <h2 className={styles.logoText} style={{ color: 'white' }}>ProAlgo</h2>
            </Link>

            <div className={styles.navLinks}>
                <NavLink href="/dashboard" isActive={isActive('/dashboard')} icon={<LayoutDashboard size={18} />}>Dashboard</NavLink>
                <NavLink href="/learn" isActive={isActive('/learn')} icon={<GraduationCap size={18} />}>Learning</NavLink>
                <NavLink href="/practice" isActive={isActive('/practice')} icon={<Code2 size={18} />}>Practice</NavLink>
                <NavLink href="/tests" isActive={isActive('/tests')} icon={<FileCheck size={18} />}>Tests</NavLink>
                <NavLink href="/contests" isActive={isActive('/contests')} icon={<Trophy size={18} />}>Contests</NavLink>
                {user && user.role === 'admin' && (
                    <a href="http://localhost:3001" className={styles.adminLink}>Admin Portal</a>
                )}
            </div>

            <div className={styles.userActions}>
                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className={styles.profileBtn}
                        >
                            <div className={styles.avatar}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </button>

                        {showDropdown && (
                            <div className={styles.dropdownMenu}>
                                <div className={styles.dropdownHeader}>
                                    <p className={styles.dropdownName}>{user.name}</p>
                                    <p className={styles.dropdownEmail}>{user.email}</p>
                                </div>
                                <Link
                                    href="/profile"
                                    className={styles.dropdownItem}
                                    onClick={() => setShowDropdown(false)}
                                >
                                    <UserCircle size={16} /> Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link href="/auth/login">
                            <button className={styles.loginBtn}>Login</button>
                        </Link>
                        <Link href="/auth/register">
                            <button className={styles.registerBtn}>Register</button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

function NavLink({ href, children, isActive, icon }) {
    return (
        <Link href={href} className={styles.navLink} style={{
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: isActive ? 500 : 400,
            background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent'
        }}>
            <span style={{ opacity: isActive ? 1 : 0.7 }}>{icon}</span>
            {children}
        </Link>
    );
}
