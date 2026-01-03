import { NextResponse } from "next/server";
import { getUserByRobloxIdAdmin } from "@/lib/firestore-admin";

async function resolveRobloxUserIdByUsername(username) {
  const clean = String(username || "").trim();
  if (!clean) return null;

  const res = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      usernames: [clean],
      excludeBannedUsers: true,
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  const data = Array.isArray(json?.data) ? json.data : [];
  const match = data[0];
  if (!match?.id) return null;
  return String(match.id);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json(
        { error: "Missing username query parameter" },
        { status: 400 }
      );
    }

    const robloxId = await resolveRobloxUserIdByUsername(username);
    if (!robloxId) {
      return NextResponse.json(
        { error: "Roblox username not found", username },
        { status: 404 }
      );
    }

    const user = await getUserByRobloxIdAdmin(String(robloxId));

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found in Sabrvalues",
          robloxId,
          note: "This user may need to log in to Sabrvalues at least once before stats are available.",
        },
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
    console.error("Error looking up user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
