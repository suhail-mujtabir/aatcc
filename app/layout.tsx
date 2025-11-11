// app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from '@/context/ThemeContext';
import SnowEffect from '@/components/SnowEffect';
import ClickSpark from "@/components/clickSpark";
import {ReactLenis} from '@/components/utils/lenis';

export const metadata: Metadata = {
  title: "AATCC AUST Student Chapter",
  description: "Official website of our student organization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      
      <body>
        
        <SnowEffect snowflakeCount={70} />
        <ThemeProvider>
          {/* <PageThemeTransition /> */}
          <AuthProvider>
            <ClickSpark
              sparkSize={10}
  sparkRadius={15}
  sparkCount={8}
  duration={400}
            >
            <Navbar />
           
              <ReactLenis root>
              <main className="flex-grow">
                {children}
              </main>
              </ReactLenis>
            
            <Footer/>
            <ScrollToTop />
            </ClickSpark>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
