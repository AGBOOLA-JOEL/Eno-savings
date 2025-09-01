import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserDashboard from "@/components/dashboard/user-dashboard";
import AdminDashboard from "@/components/dashboard/admin-dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      savings: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    const users = await prisma.user.findMany({
      include: {
        savings: true,
      },
    });

    // Fetch analytics data from the API
    const analyticsRes = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/admin/analytics`,
      {
        cache: "no-store",
      }
    );
    const analytics = analyticsRes.ok ? await analyticsRes.json() : null;

    return (
      <AdminDashboard users={users} currentUser={user} analytics={analytics} />
    );
  }

  return <UserDashboard user={user} />;
}
