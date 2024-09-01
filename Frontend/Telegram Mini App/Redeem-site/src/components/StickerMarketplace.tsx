import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@aptos-labs/wallet-adapter-react";


interface NFTPack {
  title: string;
  price: number;
  id: number;
  negative: string;
  keywords: string;
  imageUrl: string;
  altText: string;
}

const StickerMarketplace: React.FC = () => {

  const { account } = useWallet();
 
  const [nftPacks, setNFTPacks] = useState<NFTPack[]>([]);

  // const nftData = [
  //   { 
  //     title: "Good Pack", 
  //     price: 100, 
  //     id: 1, 
  //     negative: "Evil Expression, Scowl, Frown, No beard,Sarcastic Smile,blurry images", 
  //     keywords: "Cartoon, Exagerated,Handsome, Beautiful, Detailed Animation, Animated, No Background, Black Background, Happy, Long hair, Always bearded",
  //     imageUrl: "https://res.cloudinary.com/dkewhgebd/image/upload/v1724837797/copsdqwxvevwbkvll2hy.jpg",
  //     altText: "Good Pack NFT"
  //   },
  //   { 
  //     title: "Evil Pack", 
  //     price: 150, 
  //     id: 2, 
  //     negative: "Good Expression, Smile, blurry images", 
  //     keywords: "Evil ,Cartoon, Exagerated,Handsome, Beautiful, Detailed Animation, Animated, No Background, Black Background, Happy, Long hair, Always bearded, Sarcastic smile",
  //     imageUrl: "https://res.cloudinary.com/dkewhgebd/image/upload/v1724837806/qhyaseccdm25i8zhqsc8.jpg",
  //     altText: "Evil Pack NFT"
  //   },
  //   {
  //     title: "Ethereum Pack",
  //     price: 200,
  //     id: 3,
  //     negative: "Bitcoin symbols, Dollar signs, Confusion, Blurry images",
  //     keywords: "Ethereum, ETH, Cryptocurrency, Blockchain, Smart Contracts, Decentralized, Vitalik Buterin, Animated, No Background, Detailed Illustration, Futuristic, Tech",
  //     imageUrl: "https://res.cloudinary.com/dkewhgebd/image/upload/v1724837803/jcqlnfvtjsvzlah4filf.jpg",
  //     altText: "Ethereum Pack NFT"
  //   },
  //   {
  //     title: "Bitcoin Pack",
  //     price: 200,
  //     id: 4,
  //     negative: "Ethereum symbols, Bank buildings, Paper money, Blurry images",
  //     keywords: "Bitcoin, BTC, Cryptocurrency, Blockchain, Satoshi Nakamoto, Digital Gold, Animated, No Background, Detailed Illustration, Decentralized, Finance, Mining",
  //     imageUrl: "https://res.cloudinary.com/dkewhgebd/image/upload/v1724837804/bqmtrtvckxfqf4sad6aq.jpg",
  //     altText: "Bitcoin Pack NFT"
  //   }
  // ];

  const mint_nftpack = async (pack: NFTPack) => {
    const data = {
      action: "Add Sticker",
      prompt: pack.keywords,
      wallet: account?.address.toString(),
      negative_prompt: pack.negative,
      price: pack.price
    };

    console.log("Minting NFT pack:", data);

    window.Telegram.WebApp.sendData(JSON.stringify(data));
  };

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
    }
    
    const fetchNFTPacks = async () => {
      try {

        const response = await fetch('https://telegage-server.onrender.com/api/nft-packs');
        const data = await response.json();
        setNFTPacks(data);
      } catch (error) {
        console.error("Error fetching NFT packs:", error);
      }
    };

    fetchNFTPacks();
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {nftPacks.map((pack) => (
        <motion.div 
          key={pack.id} 
          className="bg-gray-700 p-4 rounded-lg shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="aspect-square bg-gray-600 rounded-lg mb-2 overflow-hidden">
            <img 
              src={pack.imageUrl} 
              alt={pack.altText} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
              }}
            />
          </div>
          <h3 className="text-lg font-semibold mb-1 text-white">{pack.title}</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">{pack.price} Tokens</span>
            <button 
              className="bg-purple-500 text-white py-1 px-3 rounded hover:bg-purple-600 transition-colors duration-200"
              onClick={() => mint_nftpack(pack)}
            >
              Buy
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StickerMarketplace;