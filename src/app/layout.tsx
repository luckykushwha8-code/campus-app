import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar, Sidebar } from "@/components/layout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// export const metadata: Metadata = {
//   title: "CampusLink - Verified Student Social Network",
//   description: "The verified social network for students - connect, share, study, and grow together.",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen pb-16 md:pb-0 md:ml-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}