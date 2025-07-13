import { getServerSession } from "next-auth";
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

    return <AdminDashboard users={users} currentUser={user} />;
  }

  return <UserDashboard user={user} />;
}
