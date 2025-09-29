import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login"); // 🚨 Server-side protection
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {session.user?.userId}
        </h1>
        <p className="text-gray-600 mb-6">
          You have successfully logged into your student dashboard.
        </p>

        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
