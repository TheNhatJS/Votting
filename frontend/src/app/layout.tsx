import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


import ProviderLayout from "@/components/layouts/ProviderLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Votting",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${inter.className} text-[#EAECEF] bg-[#202328]`}
      >
        <div className="relative bg-custom-image bg-no-repeat bg-center bg-cover bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20"></div>
          <ProviderLayout>{children}</ProviderLayout>
        </div>
      </body>
    </html>
  );
}
