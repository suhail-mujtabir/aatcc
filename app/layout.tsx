// app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from '@/context/ThemeContext';
import  Transitions  from "@/context/pageTransition";
import SnowEffect from '@/components/SnowEffect';
import ClickSpark from "@/components/clickSpark";


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
            <Transitions>
              <main className="flex-grow">
                {children}
              </main>
            </Transitions>
            <Footer/>
            <ScrollToTop />
            </ClickSpark>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
