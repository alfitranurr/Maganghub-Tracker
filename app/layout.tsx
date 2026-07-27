/* cspell:disable */
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maganghub Application Tracker - Live Google Sheets Database",
  description:
    "Aplikasi pelacak lamaran Maganghub modern, cepat, minimalis, dan terhubung langsung secara real-time ke Google Spreadsheet via Google Apps Script REST API.",
  keywords: [
    "Maganghub Tracker",
    "Application Tracker",
    "Google Sheets Database",
    "Next.js 15",
    "TanStack Table",
    "Lamaran Magang",
  ],
  authors: [{ name: "Maganghub Tracker Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
