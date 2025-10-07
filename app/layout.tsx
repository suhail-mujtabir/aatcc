import "./globals.css";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import SessionProviderWrapper from "./SessionProviderWrapper";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";


export const metadata: Metadata = {
  title: "Student Org Website",
  description: "Official website of our student organization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        
      </head>
      <body>
        <Navbar />
        <main className="flex-grow">
          <SessionProviderWrapper>
            {children}
          </SessionProviderWrapper>
        </main>
        <Footer/>
        <ScrollToTop />
      </body>
    </html>
  );
}
