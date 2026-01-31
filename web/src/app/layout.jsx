import { Inter, Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import ReduxProvider from "@/providers/ReduxProvider";
import "./globals.scss";
import styles from "./layout.module.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "ProAlgo | Master Coding & Aptitude",
  description: "A full-scale learning, practice, and assessment platform for developers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${styles.body}`}>
        <ReduxProvider>
          <Navbar />
          <main className={styles.mainContent}>
            {children}
          </main>
        </ReduxProvider>
      </body>
    </html>
  );
}
