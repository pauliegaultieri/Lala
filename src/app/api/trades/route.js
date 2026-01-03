import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * GET /api/trades
 * List active trades with optional pagination
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";
    const limitCount = parseInt(searchParams.get("limit")) || 20;
    const page = parseInt(searchParams.get("page")) || 1;
    const offeringFilter = searchParams.get("offering");
    const lookingForFilter = searchParams.get("lookingFor");

    const tradesRef = adminDb.collection("trades");
    let query = tradesRef.where("status", "==", status);

    // Order by createdAt descending (newest first)
    query = query.orderBy("createdAt", "desc");

    // Pagination (keep existing params but avoid expensive offset; simple page-based fetch)
    // If we later want true pagination, we should use startAfter with a cursor.
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const fetchCount = limitCount * safePage;

    // Apply limit
    query = query.limit(fetchCount);

    const snapshot = await query.get();
    
    let trades = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        joinedAt: data.joinedAt?.toDate?.()?.toISOString() || null,
        expiresAt: data.expiresAt?.toDate?.()?.toISOString() || null,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
        failedAt: data.failedAt?.toDate?.()?.toISOString() || null,
      };
    });

    // In-memory filtering (Firestore cannot reliably query inside arrays of objects without precomputed fields)
    function itemMatchesBrainrot(items, brainrotIdOrName) {
      if (!brainrotIdOrName) return true;
      if (!Array.isArray(items)) return false;
      const target = String(brainrotIdOrName);
      return items.some((item) => {
        if (!item) return false;
        const id = item.id ?? item.brainrotId ?? item.brainrot?.id;
        const name = item.name ?? item.brainrotName;
        return String(id || "") === target || String(name || "") === target;
      });
    }

    if (offeringFilter) {
      trades = trades.filter((t) => itemMatchesBrainrot(t.offeringItems, offeringFilter));
    }
    if (lookingForFilter) {
      trades = trades.filter((t) => itemMatchesBrainrot(t.lookingForItems, lookingForFilter));
    }

    // Apply page window after filtering
    const startIndex = (safePage - 1) * limitCount;
    trades = trades.slice(startIndex, startIndex + limitCount);

    return NextResponse.json({ trades, count: trades.length });
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trades
 * Create a new trade listing (auth required)
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { offeringItems, lookingForItems } = body;

    // Validate items
    if (!offeringItems || !Array.isArray(offeringItems) || offeringItems.length === 0) {
      return NextResponse.json(
        { error: "At least one offering item is required" },
        { status: 400 }
      );
    }

    if (!lookingForItems || !Array.isArray(lookingForItems) || lookingForItems.length === 0) {
      return NextResponse.json(
        { error: "At least one looking for item is required" },
        { status: 400 }
      );
    }

    // Get user from Firestore
    const usersRef = adminDb.collection("users");
    const userSnapshot = await usersRef
      .where("robloxId", "==", session.user.robloxId)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Calculate totals
    const offeringTotalLGC = offeringItems.reduce(
      (sum, item) => sum + (item.finalValueLGC || 0),
      0
    );
    const lookingForTotalLGC = lookingForItems.reduce(
      (sum, item) => sum + (item.finalValueLGC || 0),
      0
    );
    const valueDifferenceLGC = Math.abs(offeringTotalLGC - lookingForTotalLGC);

    // Calculate W/L/F result (from poster's perspective)
    // Win = getting more value, Loss = giving more value
    let result = "fair";
    let resultPercentage = 0;
    
    const maxValue = Math.max(offeringTotalLGC, lookingForTotalLGC);
    if (maxValue > 0) {
      resultPercentage = (valueDifferenceLGC / maxValue) * 100;
      
      if (resultPercentage > 5) {
        // More than 5% difference
        result = offeringTotalLGC > lookingForTotalLGC ? "loss" : "win";
      }
    }

    // Create expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create trade document
    const tradeData = {
      // Owner info (denormalized for display)
      ownerId: userDoc.id,
      ownerRobloxId: session.user.robloxId,
      ownerUsername: userData.username || session.user.username,
      ownerAvatarUrl: userData.avatarUrl || session.user.image,

      // Trade items
      offeringItems,
      lookingForItems,

      // Calculated values
      offeringTotalLGC,
      lookingForTotalLGC,
      valueDifferenceLGC,
      result,
      resultPercentage: Math.round(resultPercentage * 10) / 10,

      // Trade state
      status: "active",

      // Join fields (null until someone joins)
      joinedBy: null,
      joinedByRobloxId: null,
      joinedByUsername: null,
      joinedByAvatarUrl: null,
      joinedAt: null,

      // Acceptance tracking
      ownerAccepted: false,
      joinerAccepted: false,
      ownerAcceptedAt: null,
      joinerAcceptedAt: null,

      // Completion fields
      completedAt: null,
      failedAt: null,
      failReason: null,
      declinedBy: null,

      // Metadata
      views: 0,
      expiresAt,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const tradeRef = await adminDb.collection("trades").add(tradeData);

    // Update user's tradesPosted stat
    await userDoc.ref.update({
      "stats.tradesPosted": FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      { 
        id: tradeRef.id, 
        message: "Trade created successfully" 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating trade:", error);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}
