import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserByRobloxIdAdmin } from "@/lib/firestore-admin";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await getUserByRobloxIdAdmin(session.user.robloxId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      robloxId: user.robloxId,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      profileUrl: user.profileUrl,
      stats: user.stats || {
        tradesPosted: 0,
        tradesAccepted: 0,
        tradesCompleted: 0,
        tradesFailed: 0,
      },
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
