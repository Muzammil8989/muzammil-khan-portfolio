// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/signout-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-4 text-lg text-gray-600">
                Welcome, {session.user?.name || session.user?.username}! You are
                authenticated.
              </p>
            </div>
            <SignOutButton />
          </div>

          {/* Additional dashboard content can go here */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold">Your Account</h2>
            <div className="mt-4 space-y-2">
              <p>
                <span className="font-medium">Username:</span>{" "}
                {session.user?.username}
              </p>
              <p>
                <span className="font-medium">User ID:</span> {session.user?.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
