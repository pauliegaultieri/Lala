import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PostTradeContainer from "@/components/Trades/PostTradeContainer";

export const metadata = {
  title: "Post a Trade - Sabrvalues",
  description: "Create a new trade listing on Sabrvalues",
  openGraph: {
    title: "Post a Trade - Sabrvalues",
    description: "Create a new trade listing on Sabrvalues",
    type: "website",
    images: ["/images/og-thumbnail.webp"],
  },
};

export default async function PostTradePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        {/* Heading */}
        <h1 className="text-center font-pp-mori font-semibold text-[1.75rem] sm:text-[2.5rem] lg:text-[3.75rem] text-black dark:text-white px-4">
          Post a <span className="text-[#4F46E5]">Trade</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-center font-urbanist font-light text-sm sm:text-base lg:text-lg text-[#64748B] dark:text-gray-400 max-w-[520px] px-4">
          Add the brainrots you're offering and what you're looking for.
        </p>

        {/* Trade Post Container */}
        <div className="mt-8 sm:mt-10 lg:mt-12 w-full flex justify-center">
          <div className="w-full max-w-[1100px]">
            <PostTradeContainer />
          </div>
        </div>
      </section>
    </div>
  );
}
