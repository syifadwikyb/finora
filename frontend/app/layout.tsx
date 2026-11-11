import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import BottomNavbar from "@/components/layout/BottomNavbar";
import BackNavigationHandler from "@/components/layout/BackNavigationHandler";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ClientLayout from "@/components/layout/ClientLayout";
import AppShell from "@/components/AppShell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Finora - Personal Finance Tracker",
  description: "Manage your money, simply. Track income, expenses, and categories easily.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Finora",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('finora_theme') || 'system';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${poppins.className} min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex`}>
        <AuthProvider>
          <AppShell>
            <ClientLayout>
              <BackNavigationHandler />
              <Sidebar />
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <BottomNavbar />
            </ClientLayout>
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
