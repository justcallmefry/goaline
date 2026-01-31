import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // <--- NEW FONT
import "./globals.css";

// Load the font
const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GoaLine",
  description: "AI Growth Strategy Board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}