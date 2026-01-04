import HeroSection from "@/components/HeroSection/HeroSection";
import TopBrainrotsSection from "@/components/TopBrainrotsSection/TopBrainrotsSection";
import WhoAreWeSection from "@/components/WhoAreWeSection/WhoAreWeSection";
import DiscordBotSection from "@/components/DiscordBotSection/DiscordBotSection";
import JoinCommunitySection from "@/components/JoinCommunitySection/JoinCommunitySection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TopBrainrotsSection />
      <WhoAreWeSection />
      <JoinCommunitySection />
      <DiscordBotSection />
    </main>
  );
}
