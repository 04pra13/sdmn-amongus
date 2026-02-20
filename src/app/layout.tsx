import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import ConvexClientProvider from "./ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SDMN Among Us - Stats & Tier List",
  description: "Track Sidemen Among Us stats, view the tier list, and check map win rates.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sdmn-amongus.vercel.app/",
    siteName: "SDMN Among Us Dashboard",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ConvexClientProvider>
          <div className="star-field" />
          <ClientLayout>{children}</ClientLayout>
        </ConvexClientProvider>
      </body>
    </html>
  );
}