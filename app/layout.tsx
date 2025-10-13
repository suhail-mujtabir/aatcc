import "./globals.css";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Script from 'next/script'
import { ThemeProvider } from '@/context/ThemeContext';
import  Transitions  from "@/context/pageTransition";


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
        {/* Vanta.js requires three.js as a dependency, so we load it first */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js" strategy="beforeInteractive" />
      </head>
      <body>

        
          <ThemeProvider>
        <AuthProvider>
        <Navbar />
        <Transitions>
        <main className="flex-grow">
            {children}
            </main>
            </Transitions>
            </AuthProvider>
            </ThemeProvider>
       
        <Footer/>
        <ScrollToTop />
      </body>
    </html>
  );

} 