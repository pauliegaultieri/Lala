import CompletedTradesContainer from "@/components/Trades/CompletedTradesContainer";

export const metadata = {
  title: "Completed Trades - Sabrvalues",
  description: "View all recently completed trades on Sabrvalues",
  openGraph: {
    title: "Completed Trades - Sabrvalues",
    description: "View all recently completed trades on Sabrvalues",
    type: "website",
    images: ["/images/og-thumbnail.webp"],
  },
};

export default function CompletedTradesPage() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-[1200px]">
          <CompletedTradesContainer />
        </div>
      </section>
    </div>
  );
}
