import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Finora - Personal Finance Tracker",
  description: "Manage your money, simply. Track income, expenses, and categories easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${poppins.className} h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
