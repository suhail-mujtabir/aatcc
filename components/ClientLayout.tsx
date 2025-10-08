// components/ClientLayout.tsx

'use client'; // This is now our main Client Component

import { useState } from "react";
import Navbar from "./Navbar"; // Adjust this path if needed
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from '@/context/ThemeContext';
import SplashScreen from "@/components/SplashScreen"; // Adjust this path if needed

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  const handleAnimationComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading ? (
        <SplashScreen onAnimationComplete={handleAnimationComplete} />
      ) : (
        <>
          {/* Your original page structure */}
          <main className="flex-grow">
            <ThemeProvider>
              <AuthProvider>
                <Navbar />
                {children}
              </AuthProvider>
            </ThemeProvider>
          </main>
          <Footer />
          <ScrollToTop />
        </>
      )}
    </>
  );
}