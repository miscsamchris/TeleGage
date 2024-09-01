import React from "react";
import { motion } from "framer-motion";
import { WalletConnector } from "./WalletConnector";

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 py-12 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <motion.h1 
        className="text-6xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to TeleGage
      </motion.h1>
      <motion.p 
        className="text-2xl mb-8 max-w-2xl text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Mint AI-generated Telegram stickers as NFTs using your community points!
      </motion.p>
      <WalletConnector />
      
      <motion.div
        className="mt-16 w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-white">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Connect", description: "Link your wallet to start minting", icon: "🔗" },
            { title: "Create", description: "Design unique stickers with AI", icon: "🎨" },
            { title: "Collect", description: "Own your stickers as NFTs", icon: "🏆" }
          ].map((step, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 bg-opacity-50 p-6 rounded-lg backdrop-blur-sm shadow-lg"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(107, 70, 193, 0.6)" }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};