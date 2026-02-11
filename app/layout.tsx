import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // Import the file you just created

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GMB Audit Tool | GBP & Competitor Analysis",
  description: "Analyze your GBP with a detailed GMB audit tool. Compare competitors, find ranking gaps, and improve Google Maps visibility.",
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