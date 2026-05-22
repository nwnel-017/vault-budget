import type { Metadata } from "next";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";

export const metadata: Metadata = {
  title: "FlowVault",
  description: "A budgeting app designed for privacy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider />
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
