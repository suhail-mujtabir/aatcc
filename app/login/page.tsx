// app/login/page.tsx
"use client";
import { useState, useEffect, useRef, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Eye, EyeOff, Moon } from "react-feather";
import { loginUser } from "@/app/actions/auth-actions";

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

// Create a separate component that uses useSearchParams
function LoginForm() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [vantaReady, setVantaReady] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, router, redirectTo]);

  // Load scripts dynamically
  useEffect(() => {
    const loadVantaScripts = async () => {
      // Check if scripts are already loaded
      if (window.VANTA && window.THREE) {
        setVantaReady(true);
        return;
      }

      try {
        // Load Three.js first
        if (!window.THREE) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Load Vanta.js
        if (!window.VANTA) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        setVantaReady(true);
      } catch (error) {
        console.error('Failed to load Vanta.js scripts:', error);
      }
    };

    loadVantaScripts();
  }, []);

  // Initialize Vanta effect when scripts are ready
  useEffect(() => {
    if (!vantaReady || !vantaRef.current || !window.VANTA) return;

    // Destroy previous effect if it exists
    if (vantaEffect.current) {
      vantaEffect.current.destroy();
    }

    // Initialize Vanta effect
    vantaEffect.current = window.VANTA.WAVES({
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

    // Cleanup function
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, [vantaReady]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

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

  try {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('password', password);
    formData.append('rememberMe', rememberMe.toString());

    console.log('🔐 Login: Attempting login...');
    const result = await loginUser(formData);
    
    if (result?.error) {
      setError(result.error);
      console.log('🔐 Login: Failed -', result.error);
    } else if (result?.success) {
      // Login successful - use a more reliable redirect approach
      console.log('🔐 Login: Success, waiting for auth sync...');
      
      // Wait a bit for the session to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force a hard navigation to ensure clean state
      window.location.href = redirectTo;
    }
  } catch (err: any) {
    console.error('🔐 Login: Error -', err);
    setError(err.message || "An error occurred during login");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen flex items-center justify-center">
      {/* Vanta background */}
      <div 
        ref={vantaRef} 
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: -1 }}
      />
      
      {/* Show loading indicator while Vanta loads */}
      {!vantaReady && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900" />
      )}
      
      <div className="relative w-full max-w-md px-4 sm:px-6 py-6 sm:py-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden mx-4 sm:mx-0">
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
            <label htmlFor="userid" className={`floating-label absolute left-4 top-3 text-gray-500 dark:text-gray-400 pointer-events-none ${userId ? 'active' : ''}`}>User ID (eg. 23-01-001)</label>
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
              minLength={6}
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
              className="cursor-pointer btn-primary w-full flex justify-center py-2 sm:py-3 px-3 sm:px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
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

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}