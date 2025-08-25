import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get analytics data
    const totalUsers = await prisma.user.count()
    const totalSavings = await prisma.saving.aggregate({
      _sum: {
        amount: true,
      },
    })

    const userSavings = await prisma.user.findMany({
      include: {
        savings: true,
      },
    })

    const activeUsers = userSavings.filter((user) => user.savings.length > 0).length
    const averageSavings = totalUsers > 0 ? (totalSavings._sum.amount || 0) / totalUsers : 0

    // Monthly savings data
    const monthlySavings = await prisma.saving.groupBy({
      by: ["createdAt"],
      _sum: {
        amount: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({
      totalUsers,
      totalSavings: totalSavings._sum.amount || 0,
      activeUsers,
      averageSavings,
      monthlySavings,
      userSavings: userSavings.map((user) => ({
        name: user.name,
        totalSavings: user.savings.reduce((sum, saving) => sum + saving.amount, 0),
      })),
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
