import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (currentUser?.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true as const };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await ensureAdmin();
    if ("error" in auth) return auth.error;

    const id = params.id;
    const body = await request.json();
    const { amount, description } = body as {
      amount?: number;
      description?: string | null;
    };

    if (amount == null && typeof description === "undefined") {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.saving.update({
      where: { id },
      data: {
        ...(amount != null
          ? { amount: Number.parseFloat(String(amount)) }
          : {}),
        ...(typeof description !== "undefined" ? { description } : {}),
      },
    });

    return NextResponse.json({ success: true, saving: updated });
  } catch (error) {
    console.error("Error updating savings entry:", error);
    return NextResponse.json(
      { error: "Failed to update savings entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await ensureAdmin();
    if ("error" in auth) return auth.error;

    const id = params.id;
    await prisma.saving.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting savings entry:", error);
    return NextResponse.json(
      { error: "Failed to delete savings entry" },
      { status: 500 }
    );
  }
}
