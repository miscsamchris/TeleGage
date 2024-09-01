import EcosystemIcon from "../assets/icons/ecosystem.svg";
import { Feature } from "./Feature";

const features = [
  {
    title: "Automated Moderation",
    description:
      "Keep your community clean and on-topic with advanced AI-powered moderation.",
  },
  {
    title: "Engagement Boosting",
    description:
      "Increase participation with gamification and Web3 token rewards for active members.",
  },
  {
    title: "Customizable Rewards",
    description:
      "Create unique NFT stickers as rewards to incentivize and recognize community contributions.",
  },
];

export const Features = () => {
  return (
    <div className="bg-black text-white py-[72px] sm:py-24">
      <div className="container">
        <h2 className="text-center font-bold text-5xl sm:text-6xl tracking-tighter">Powerful Features</h2>
        <div className="max-w-xl mx-auto">
          <p className="text-center mt-5 text-xl text-white/70">
            TeleGage provides everything you need to manage and grow your Telegram community effectively.
          </p>
        </div>
        <div className="mt-16 flex flex-col sm:flex-row gap-4">
          {
            features.map((feature, index) => (
              <Feature key={index} title={feature.title} description={feature.description} />
            ))
          }
        </div>
      </div>
    </div>
  );
};