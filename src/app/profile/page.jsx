import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileListings from "@/components/Profile/ProfileListings";

export const metadata = {
  title: "Profile - Sabrvalues",
  description: "View your Sabrvalues profile, trade history, and listings",
  openGraph: {
    title: "Profile - Sabrvalues",
    description: "View your Sabrvalues profile, trade history, and listings",
    type: "website",
    images: ["/images/og-thumbnail.webp"],
  },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-[1100px] space-y-6">
          <ProfileHeader session={session} />
          <ProfileListings session={session} />
        </div>
      </section>
    </div>
  );
}
