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
  title: "Finora",
  description: "Manage your money, simply. Track income, expenses, and categories easily.",
  manifest: "/manifest.json",
  icons: {
    icon: "/finora_bg.png",
    shortcut: "/finora_bg.png",
    apple: "/finora_bg.png",
  },
  appleWebApp: {
    capable: true,
    title: "Finora",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
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
                const isDark =
                  theme === 'dark' ||
                  (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

                document.documentElement.classList.toggle("dark", isDark);
                setThemeColor(isDark);

                const color = isDark ? '#020617' : '#f8fafc';
                const applyThemeColor = () => {
                  document
                    .querySelectorAll('meta[name="theme-color"]')
                    .forEach((m) => m.setAttribute('content', color));
                };
                applyThemeColor();
                document.addEventListener('DOMContentLoaded', applyThemeColor);
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
