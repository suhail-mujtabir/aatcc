"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      userId,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid User ID or Password");
      return;
    }

    // ✅ Get session to check mustChangePassword flag
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    if (session?.user?.mustChangePassword) {
      router.push("/change-password");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Student Login</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
