"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.role === 'admin') {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return <div className={styles.container}>Loading...</div>;
}
