import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { WalletContextProvider } from "@/context/wallet";

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
    <html lang="en">
      <WalletContextProvider>
        <body
          className={`${inter.className} text-[#EAECEF] bg-[#202328]`}
        >
          <div className="relative bg-custom-image bg-no-repeat bg-center bg-cover bg-fixed">
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20"></div>
              {children}           
          </div>
        </body>
      </WalletContextProvider>
    </html>
  );
}
