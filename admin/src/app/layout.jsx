import { Inter, Outfit } from 'next/font/google';
import "./globals.scss";
import styles from "./layout.module.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "ProAlgo Admin",
  description: "Admin Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${styles.body}`}>{children}</body>
    </html>
  );
}
