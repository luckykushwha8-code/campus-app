"use client";

import { usePathname } from "next/navigation";
import { Navbar, Sidebar } from "@/components/layout";

const authRoutes = new Set(["/login", "/signup"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.has(pathname);

  if (isAuthRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <div className="app-frame flex gap-6 px-4 pb-20 pt-20 md:px-6 lg:pt-24">
        <Sidebar />
        <main className="min-h-screen min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
