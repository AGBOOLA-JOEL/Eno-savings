import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30"

    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - Number.parseInt(period))

    // Get analytics data
    const [totalUsers, totalSavings, recentSavings, savingsGrowth, topSavers, monthlyData] = await Promise.all([
      // Total users
      prisma.user.count({
        where: { role: "USER" },
      }),

      // Total savings amount
      prisma.saving.aggregate({
        _sum: { amount: true },
      }),

      // Recent savings (last 30 days)
      prisma.saving.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { gte: daysAgo },
        },
      }),

      // Savings growth data
      prisma.saving.groupBy({
        by: ["createdAt"],
        _sum: { amount: true },
        where: {
          createdAt: { gte: daysAgo },
        },
        orderBy: { createdAt: "asc" },
      }),

      // Top savers
      prisma.user.findMany({
        where: { role: "USER" },
        include: {
          savings: {
            select: { amount: true },
          },
        },
        take: 5,
      }),

      // Monthly savings data for chart
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          SUM(amount) as total,
          COUNT(*) as count
        FROM "Saving"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,
    ])

    // Process top savers
    const processedTopSavers = topSavers
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        totalSavings: user.savings.reduce((sum, saving) => sum + saving.amount, 0),
        savingsCount: user.savings.length,
      }))
      .sort((a, b) => b.totalSavings - a.totalSavings)

    return NextResponse.json({
      totalUsers,
      totalSavings: totalSavings._sum.amount || 0,
      recentSavings: recentSavings._sum.amount || 0,
      averagePerUser: totalUsers > 0 ? (totalSavings._sum.amount || 0) / totalUsers : 0,
      topSavers: processedTopSavers,
      monthlyData,
      savingsGrowth,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
