"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logoImg from '../../assets/images/logosaas.png';
import { motion } from 'framer-motion';

interface Community {
  id: number;
  name: string;
}

const DashboardSummary = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-2 text-white/70">Total Members</h3>
        <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">5,000</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-2 text-white/70">Active Users</h3>
        <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">1,200</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-2 text-white/70">Total Messages</h3>
        <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">150,000</p>
      </div>
    </div>
  );
};

const CommunityStats = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Community Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-white/70">Top Contributors</h3>
          <ul className="space-y-2">
            <li className="text-white">@user1 - 500 Points</li>
            <li className="text-white">@user2 - 450 Points</li>
            <li className="text-white">@user3 - 400 Points</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-white/70">Recent Moderation Actions</h3>
          <ul className="space-y-2">
            <li className="text-white">Removed spam message</li>
            <li className="text-white">Muted @spammer for 24 hours</li>
            <li className="text-white">Deleted off-topic thread</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [username, setUsername] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/auth');
    } else {
      setUsername(JSON.parse(user).username);
      // Fetch user's communities (mock data for now)
      setCommunities([
        { id: 1, name: 'Crypto Enthusiasts' },
        { id: 2, name: 'NFT Collectors' },
      ]);
    }
  }, [router]);

  return (
    <div className="bg-black text-white min-h-screen bg-[linear-gradient(to_bottom,#000,#200D42_34%,#4F21A1_65%,#A45EDB_82%)]">
      <header className="bg-gray-900 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image src={logoImg} alt="TeleGage Logo" width={40} height={40} />
            <h1 className="text-2xl font-bold ml-2">TeleGage Dashboard</h1>
          </div>
          <div>
            <span className="mr-4">Welcome, {username}</span>
            <button 
              onClick={() => {
                localStorage.removeItem('user');
                router.push('/auth');
              }}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto mt-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
            Welcome to Your Dashboard
          </h2>
          <div className="flex justify-center space-x-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/create_community')}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-3 px-6 rounded-lg hover:opacity-90 transition duration-300"
            >
              Create Your Community
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/import_community')}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-3 px-6 rounded-lg hover:opacity-90 transition duration-300"
            >
              Import Your Community
            </motion.button>
          </div>
          {communities.length > 0 ? (
            communities.map((community) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
                  {community.name}
                </h2>
                <DashboardSummary />
                <CommunityStats />
              </motion.div>
            ))
          ) : (
            <p className="text-center text-xl">You haven&apos;t created or imported any communities yet.</p>
          )}
        </motion.div>
      </main>
    </div>
  );
}