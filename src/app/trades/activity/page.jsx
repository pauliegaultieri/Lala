import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TradeActivityContainer from "@/components/Trades/TradeActivityContainer";

export const metadata = {
  title: "Trade Activity - Sabrvalues",
  description: "View your trade activity on Sabrvalues",
  openGraph: {
    title: "Trade Activity - Sabrvalues",
    description: "View your trade activity on Sabrvalues",
    type: "website",
    images: ["/images/og-thumbnail.webp"],
  },
};

export default async function TradeActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-[1000px]">
          <TradeActivityContainer session={session} />
        </div>
      </section>
    </div>
  );
}
