import { NextResponse } from "next/server";
import { getUserByRobloxIdAdmin } from "@/lib/firestore-admin";

export async function GET(request, { params }) {
  try {
    const awaitedParams = await params;
    const robloxId = awaitedParams?.robloxId;

    if (!robloxId) {
      return NextResponse.json({ error: "Missing robloxId" }, { status: 400 });
    }

    const user = await getUserByRobloxIdAdmin(String(robloxId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
    console.error("Error fetching public user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
