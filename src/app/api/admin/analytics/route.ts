import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Utility to convert BigInt to Number recursively
function convertBigIntToNumber(obj: any): any {
  if (typeof obj === "bigint") return Number(obj);
  if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertBigIntToNumber(v)])
    );
  }
  return obj;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total savings
    const totalSavingsResult = await prisma.saving.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalSavings = totalSavingsResult._sum.amount || 0;

    // Get total withdrawals
    const totalWithdrawalsResult = await prisma.withdrawal.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalWithdrawals = totalWithdrawalsResult._sum.amount || 0;

    // Net savings
    const netSavings = totalSavings - totalWithdrawals;

    // Get recent savings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSavingsResult = await prisma.saving.aggregate({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        amount: true,
      },
    });
    const recentSavings = recentSavingsResult._sum.amount || 0;

    // Get monthly data for charts
    const monthlyData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(amount) as total,
        COUNT(*) as count
      FROM "Saving"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    const averagePerUser = totalUsers > 0 ? Number(netSavings) / totalUsers : 0;

    return NextResponse.json(
      convertBigIntToNumber({
        totalUsers,
        totalSavings: netSavings,
        recentSavings,
        averagePerUser,
        monthlyData,
      })
    );
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
