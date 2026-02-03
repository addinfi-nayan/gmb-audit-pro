import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // Import the file you just created

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GMB Audit Pro",
  description: "AI-Powered Google My Business Audits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}