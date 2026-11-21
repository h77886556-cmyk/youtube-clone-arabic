// التخطيط الجذري — RTL + خط Cairo + مزودو الجلسة والثيم و React Query
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import QueryProvider from "@/components/QueryProvider";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });

export const metadata: Metadata = {
  title: "عربي تيوب — شاهد وشارك الفيديوهات",
  description: "منصة فيديو عربية: ارفع، شاهد، اشترك في القنوات، وعلّق.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>
        <SessionProviderWrapper>
          <QueryProvider>
            <ThemeProvider>
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="min-h-screen flex-1 p-4 md:p-6">{children}</main>
              </div>
            </ThemeProvider>
          </QueryProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
