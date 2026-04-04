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
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen pb-16 md:pb-0 md:ml-0">{children}</main>
      </div>
    </>
  );
}
