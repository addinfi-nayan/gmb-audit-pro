import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SEO_DESCRIPTION, SEO_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SEO_TITLE, template: `%s | ${SITE_NAME}` },
  description: SEO_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "GMB audit tool", "Google Business Profile audit", "GBP audit tool", "Google My Business audit",
    "GMB audit report", "GMB competitor analysis", "local SEO audit", "Google Maps ranking", "GMB audit India",
  ],
  authors: [{ name: "Addinfi Digitech Pvt. Ltd.", url: "https://addinfi.com" }],
  creator: "Addinfi",
  publisher: "Addinfi Digitech Pvt. Ltd.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: SEO_TITLE, description: SEO_DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" style={{ colorScheme: "light" }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WZ5CRVPK');`
        }} />
        {/* End Google Tag Manager */}

        {/* Google Site Verification */}
        <meta name="google-site-verification" content="vhmWzLoA8zcviVDMbUF41S_Sk0WzOwIqFuBjEjaQM0o" />
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WZ5CRVPK"
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}