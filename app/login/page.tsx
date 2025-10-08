"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

// It's better to use a React-specific icon library
import { Lock, Eye, EyeOff, Moon } from "react-feather";

// Since VANTA and feather are loaded via scripts, we need to declare them to avoid TypeScript errors
declare global {
  interface Window {
    VANTA: any;
    feather: any;
  }
}

export default function LoginPage() {
  // --- State Management ---
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // --- Hooks ---
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const vantaRef = useRef(null); 

  // --- This useEffect now solely handles the redirect ---
  useEffect(() => {
    // If the user object exists, it means they are logged in.
    // Redirect them to the dashboard.
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // --- Effect for Initializing Third-Party Libraries ---
  useEffect(() => {
    // Theme initialization from localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }

    // Vanta.js background initialization
    const vantaEffect = window.VANTA && window.VANTA.WAVES({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x1e3a8a,
        shininess: 35.00,
        waveHeight: 15.00,
        waveSpeed: 0.75,
        zoom: 0.80
    });
    
    // Cleanup function to destroy Vanta effect on component unmount
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  // --- Event Handlers ---
  const handleThemeToggle = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = `${userId}@yourschool.com`;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Invalid User ID or Password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  // --- Render Logic ---
  // ▼▼▼ WE REMOVED THE if (user) { ... } BLOCK FROM HERE ▼▼▼
  
  return (
    <div className=" text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen flex items-center justify-center">
      <div ref={vantaRef} id="vanta-bg"></div>
      
      <div className="relative w-full max-w-md px-4 sm:px-6 py-6 sm:py-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden mx-4 sm:mx-0">
        {/* The rest of your JSX is exactly the same... */}
        
        {/* Theme Toggle */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center">
          <div className="relative inline-block w-14 mr-2 align-middle select-none">
            <input 
              type="checkbox" 
              name="toggle" 
              id="theme-toggle" 
              checked={isDark}
              onChange={handleThemeToggle}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label htmlFor="theme-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer transition-colors duration-300"></label>
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            <Moon className="inline w-4 h-4" />
          </span>
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-2xl font-bold text-gray-800 dark:text-white">AATCC AUST Student Chapter</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 mt-1 sm:mt-2">Student Login</p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* User ID Field */}
          <div className="input-field relative">
            <input
              id="userid"
              name="userid"
              type="text"
              autoComplete="username"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
            />
            <label htmlFor="userid" className={`floating-label absolute left-4 top-3 text-gray-500 dark:text-gray-400 pointer-events-none ${userId ? 'active' : ''}`}>User ID</label>
          </div>

          {/* Password Field */}
          <div className="input-field relative mt-6">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
            />
            <label htmlFor="password" className={`floating-label absolute left-4 top-3 text-gray-500 dark:text-gray-400 pointer-events-none ${password ? 'active' : ''}`}>Password</label>
            <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-blue-500" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Remember me</label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">Forgot password?</a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-2 sm:py-3 px-3 sm:px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              <span id="btn-text">{loading ? 'Authenticating...' : 'Sign in'}</span>
              {loading && (
                <div id="spinner" className="ml-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}