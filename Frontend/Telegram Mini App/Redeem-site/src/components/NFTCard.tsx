import React from 'react';
import { motion } from 'framer-motion';

interface NFTCardProps {
  collectionName: string;
  tokenUri: string;
  tokenName: string;
}

const NFTCard: React.FC<NFTCardProps> = ({ collectionName, tokenUri, tokenName }) => {
  return (
    <motion.div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <img src={tokenUri} alt={tokenName} className="w-full h-80 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">{tokenName || 'Unnamed Token'}</h3>
        <p className="text-sm text-gray-400">{collectionName}</p>
      </div>
    </motion.div>
  );
};

export default NFTCard;