import type { Metadata } from "next";
import "./globals.css";
import "@fontsource-variable/inter/wght.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Bikin Invoice — Invoice & Kontrak Kerja",
  description: "Generator Invoice & Kontrak Kerja fleksibel untuk freelancer/agency website — Next.js 15 + SQLite lokal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full bg-[#F9FAFB] text-[#111827] antialiased">
        <Providers>
          <div className="flex min-h-screen bg-[#F9FAFB]">
            <Sidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
