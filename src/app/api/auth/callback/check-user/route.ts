import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if user has completed their profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        phone: true,
        goal: true,
        frequency: true,
      },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // If user has completed their profile (has phone, goal, or frequency), go to dashboard
    if (user.phone || user.goal || user.frequency) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If user exists but hasn't completed profile, go to complete profile page
    return NextResponse.redirect(new URL("/signup/complete", request.url));
  } catch (error) {
    console.error("Error in check-user callback:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
