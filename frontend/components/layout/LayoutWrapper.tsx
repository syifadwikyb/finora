"use client";

import { usePathname } from "next/navigation";

const authPaths = ["/login", "/register"];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = authPaths.includes(pathname);

  return (
    <div className={`flex-1 flex flex-col min-w-0 ${isAuth ? "" : "min-h-screen pb-20 md:pb-0"}`}>
      {children}
    </div>
  );
}
