import styles from './page.module.css';

export default function Home() {
  return (
    <main className="container fade-in-up">
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
        </div>

        <h1 className={styles.title}>
          Master Your Career with <br />
          <span className="gradient-text">ProAlgo Platform</span>
        </h1>

        <p className={styles.subtitle}>
          The ultimate ecosystem for aptitude preparation, coding practice, and technical assessment.
        </p>

        <div className={styles.actions}>
          <button className="btn-primary">Get Started Now</button>
          <button className="glass-btn">Explore Features</button>
        </div>
      </section>

      <section className={styles.features}>
        <div className={`glass-panel ${styles.featureCard}`}>
          <h3 className={styles.featureTitle1}>Structured Learning</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Comprehensive study materials organized by category and difficulty to guide your path.</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <h3 className={styles.featureTitle2}>Coding Arena</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Practice with real-world problems in an isolated, secure execution environment.</p>
        </div>
        <div className={`glass-panel ${styles.featureCard}`}>
          <h3 className={styles.featureTitle3}>Live Assessments</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Take timed tests with real-time feedback and detailed performance analytics.</p>
        </div>
      </section>
    </main>
  );
}
