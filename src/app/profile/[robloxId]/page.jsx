import { notFound } from "next/navigation";
import { getUserByRobloxIdAdmin } from "@/lib/firestore-admin";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileListings from "@/components/Profile/ProfileListings";

export default async function PublicProfilePage({ params }) {
  const awaitedParams = await params;
  const robloxId = awaitedParams?.robloxId;

  if (!robloxId) {
    notFound();
  }

  const user = await getUserByRobloxIdAdmin(String(robloxId));

  if (!user) {
    notFound();
  }

  const viewedUser = {
    robloxId: user.robloxId,
    username: user.username,
    displayName: user.displayName,
    image: user.avatarUrl,
    avatarUrl: user.avatarUrl,
    profileUrl: user.profileUrl,
    stats: user.stats,
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-[1100px] space-y-6">
          <ProfileHeader session={{ user: viewedUser }} statsEndpoint={`/api/users/${viewedUser.robloxId}`} />
          <ProfileListings
            session={null}
            tradesEndpoint={`/api/trades/activity/${viewedUser.robloxId}?limit=100`}
            subjectRobloxId={viewedUser.robloxId}
          />
        </div>
      </section>
    </div>
  );
}
