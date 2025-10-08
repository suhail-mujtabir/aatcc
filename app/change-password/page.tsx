// "use client";

// import { useSession } from "next-auth/react";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function ChangePasswordPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // Redirect if not logged in
//   if (status === "loading") return <p>Loading...</p>;
//   if (status === "unauthenticated") {
//     router.push("/login");
//     return null;
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (newPassword !== confirmPassword) {
//       setError("New password and confirm password do not match");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/change-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ oldPassword, newPassword }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Something went wrong");
//       } else {
//         setSuccess("Password changed successfully!");
//         setTimeout(() => router.push("/dashboard"), 1500);
//       }
//     } catch (err) {
//       setError("Request failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 px-6">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
//       >
//         <h2 className="text-2xl font-bold mb-6 text-center">
//           Change Password
//         </h2>

//         {error && <p className="text-red-600 mb-4">{error}</p>}
//         {success && <p className="text-green-600 mb-4">{success}</p>}

//         <input
//           type="password"
//           placeholder="Current Password"
//           value={oldPassword}
//           onChange={(e) => setOldPassword(e.target.value)}
//           required
//           className="w-full px-4 py-2 mb-4 border rounded-lg"
//         />

//         <input
//           type="password"
//           placeholder="New Password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           required
//           className="w-full px-4 py-2 mb-4 border rounded-lg"
//         />

//         <input
//           type="password"
//           placeholder="Confirm New Password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           required
//           className="w-full px-4 py-2 mb-6 border rounded-lg"
//         />

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
//         >
//           {loading ? "Changing..." : "Change Password"}
//         </button>
//       </form>
//     </div>
//   );
// }
