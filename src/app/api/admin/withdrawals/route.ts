import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Create a withdrawal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const { userId, amount, description } = body;
    if (!userId || !amount) {
      return NextResponse.json(
        { error: "User ID and amount are required" },
        { status: 400 }
      );
    }
    // Calculate user's total savings and withdrawals
    const totalSavings = await prisma.saving.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const totalWithdrawals = await prisma.withdrawal.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const savings = totalSavings._sum.amount || 0;
    const withdrawals = totalWithdrawals._sum.amount || 0;
    const available = savings - withdrawals;
    if (amount > available) {
      return NextResponse.json(
        { error: "Insufficient funds" },
        { status: 400 }
      );
    }
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount: Number.parseFloat(amount),
        description,
      },
    });
    return NextResponse.json({ success: true, withdrawal });
  } catch (error) {
    console.error("Error creating withdrawal entry:", error);
    return NextResponse.json(
      { error: "Failed to create withdrawal entry" },
      { status: 500 }
    );
  }
}

// GET: List withdrawals (optionally by user)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const where = userId ? { userId } : {};
    const withdrawals = await prisma.withdrawal.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    );
  }
}
