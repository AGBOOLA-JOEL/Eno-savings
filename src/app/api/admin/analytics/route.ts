import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get basic analytics
    const totalUsers = await prisma.user.count()
    const totalSavings = await prisma.saving.aggregate({
      _sum: {
        amount: true,
      },
    })

    // Get recent savings (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSavings = await prisma.saving.aggregate({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        amount: true,
      },
    })

    // Get monthly data for charts (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const monthlyData = await prisma.saving.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    })

    // Group by month
    const monthlyGrouped = monthlyData.reduce((acc: any, item) => {
      const month = new Date(item.createdAt).toISOString().slice(0, 7) // YYYY-MM format
      if (!acc[month]) {
        acc[month] = {
          month,
          total: 0,
          count: 0,
        }
      }
      acc[month].total += Number(item._sum.amount) || 0
      acc[month].count += item._count.id
      return acc
    }, {})

    const monthlyDataFormatted = Object.values(monthlyGrouped).sort((a: any, b: any) => a.month.localeCompare(b.month))

    const averagePerUser = totalUsers > 0 ? Number(totalSavings._sum.amount) / totalUsers : 0

    return NextResponse.json({
      totalUsers,
      totalSavings: Number(totalSavings._sum.amount) || 0,
      recentSavings: Number(recentSavings._sum.amount) || 0,
      averagePerUser,
      monthlyData: monthlyDataFormatted,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
