import React, { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import StickerMarketplace from "./StickerMarketplace";
import NFTCard from "./NFTCard";
import { IndexerClient } from "aptos";

export const Dashboard: React.FC = () => {
  const { account } = useWallet();
  const { userId } = useParams<{ userId: string }>();
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState("my nfts");
  const [nfts, setNfts] = useState<any[]>([]);

  const [custodialAddress, setCustodialAddress] = useState<string | null>(null);
  const [encData, setEncData] = useState<string | null>(null);
  const [decData, setDecData] = useState<string | null>(null);

  useEffect(() => {

    const fetchCustodialAddress = async () => {
      const res = await fetch(`https://telegage-server.onrender.com/api/community-user/${userId}`);
      const data = await res.json();
      if (data.custodialAddress) {
        console.log("Custodial Address:", data.custodialAddress);
        setCustodialAddress(data.custodialAddress);
        setEncData(data.data);

        const client = new IndexerClient("https://api.testnet.aptoslabs.com/v1/graphql");
        const TokenBalance = await client.getAccountCoinsData(data.custodialAddress);
        const teleGageToken = TokenBalance.current_fungible_asset_balances.find(
          token => token.asset_type === "0xf1e9e56bb36fb6b14a0e43bdc08dd13d5712eca1935c63870d1f3cc9827aab51::telegage_token::TeleGageToken"
        );
        if (teleGageToken) {
          setBalance(teleGageToken.amount); // Assuming 6 decimal places
        }
      }
    };

    const custodialPrivateAdress = async()=>{
      const res = await fetch(`https://telegage-server.onrender.com/api/decrypt-user-data/${userId}`);
      const data = await res.json();
      console.log(data.decryptedData);
      setDecData(data.decryptedData);
    }

    const fetchAccountNFTs = async () => {
      if (account?.address) {
        const client = new IndexerClient("https://api.testnet.aptoslabs.com/v1/graphql");
        try {
          const accountNFTs = await client.getOwnedTokens(account.address);
          
          console.log("Account NFTs:", accountNFTs);
          setNfts(accountNFTs.current_token_ownerships_v2);
        } catch (error) {
          console.error("Error fetching account NFTs:", error);
        }
      }
    };

    console.log("encData",encData);
    console.log("decData",decData);

    fetchAccountNFTs();
    fetchCustodialAddress();
    custodialPrivateAdress();
  }, [account?.address]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="bg-gray-800 p-3 rounded-lg shadow-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-sm font-medium text-gray-400">Balance</p>
            <p className="text-xl font-bold text-white">{balance.toFixed(2)} TELE</p>
            {custodialAddress && (
              <p className="text-xs text-gray-400 mt-1">
                Custodial: {custodialAddress.slice(0, 6)}...{custodialAddress.slice(-4)}
              </p>
            )}
          </motion.div>
          <h1 className="text-2xl font-bold text-white">TeleGage Dashboard</h1>
        </div>
        <div className="text-sm bg-gray-800 px-3 py-2 rounded-full shadow-md">
          {account?.address.slice(0, 6)}...{account?.address.slice(-4)}
        </div>
      </header>
      
      <nav className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="flex">
          {["My NFTs", "Marketplace"].map((tab) => (
            <button 
              key={tab}
              className={`flex-1 py-3 px-4 ${activeTab === tab.toLowerCase() ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300"} transition-colors duration-200`}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <motion.div 
        className="bg-gray-800 rounded-lg shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {activeTab === "my nfts" ? (
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Your Collection</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {nfts.map((nft, index) => (
                <NFTCard
                  key={index}
                  collectionName={nft.current_token_data.current_collection.collection_name}
                  tokenUri={nft.current_token_data.token_uri}
                  tokenName={nft.current_token_data.token_name || `Sticker #${nft.current_token_data.token_properties['Sticker #']}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <StickerMarketplace  />
        )}
      </motion.div>
    </div>
  );
};