"use client";
import { useState, useEffect } from "react";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaWallet } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    aptos?: any;
  }
}

export const AuthForm = ({ isLogin }: { isLogin: boolean }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginMethod, setLoginMethod] = useState<"credentials" | "wallet">("credentials");
    const [petraAddress, setPetraAddress] = useState('');
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getAptosWallet = () => {
        if (isClient && 'aptos' in window) {
          return window.aptos;
        } else {
          return null;
        }
    };

    const wallet = getAptosWallet();
    
    const connectPetra = async () => {
      if (isClient && window.aptos) {
        try {
          const response = await wallet.connect();
          console.log("Petra wallet connected, address:", response.address);
          setPetraAddress(response.address);
          localStorage.setItem('petraAddress', response.address);
          
          if (isLogin) {
            const loginResponse = await axios.post('https://telegage-server.onrender.com/api/login', { walletAddress: response.address });
            console.log("Login with wallet successful", loginResponse.data);
            setSuccessMessage(loginResponse.data.message);
            setErrorMessage("");
            localStorage.setItem('user', JSON.stringify({ walletAddress: response.address }));
            router.push('/dashboard');
          }
        } catch (error) {
          console.error("Failed to connect to Petra wallet or login:", error);
          setErrorMessage("Failed to connect wallet or login. Please try again.");
        }
      } else {
        window.open('https://petra.app/', '_blank');
      }
    };

    const disconnectPetra = async () => {
        await wallet.disconnect();
        setPetraAddress('');
        localStorage.removeItem('petraAddress');
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (isLogin) {
          if (loginMethod === "wallet") {
            const response = await axios.post('https://telegage-server.onrender.com/api/login', { walletAddress: petraAddress });
            console.log("Login with wallet successful", response.data);
            setSuccessMessage(response.data.message);
            setErrorMessage("");
            localStorage.setItem('user', JSON.stringify({ username, walletAddress: petraAddress }));
            router.push('/dashboard');
          } else {
            const response = await axios.post('https://telegage-server.onrender.com/api/login', { username, password });
            console.log("Login with credentials successful", response.data);
            setSuccessMessage(response.data.message);
            setErrorMessage("");
            localStorage.setItem('user', JSON.stringify({ username, walletAddress: petraAddress }));
            router.push('/dashboard');
          }
        } else {
          if (petraAddress && username && password) {
            const response = await axios.post('https://telegage-server.onrender.com/api/signup', { username, password, walletAddress: petraAddress });
            console.log("Sign Up successful", response.data);
            setSuccessMessage(response.data.message);
            setErrorMessage("");
            localStorage.setItem('user', JSON.stringify({ username, walletAddress: petraAddress }));
          } else {
            setErrorMessage("Please fill all fields and connect wallet for signup");
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Authentication error:", error.response?.data.message);
          setErrorMessage(error.response?.data.message || "An error occurred");
        } else {
          console.error("Authentication error:", error);
          setErrorMessage("An error occurred");
        }
        setSuccessMessage("");
      }
    };

    useEffect(() => {
      const storedAddress = localStorage.getItem('petraAddress');
      if (storedAddress) {
        setPetraAddress(storedAddress);
      }
    }, []);

    return (
        <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
                {isLogin ? "Welcome Back" : "Join Us"}
            </h2>
            {isClient && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {isLogin && (
                        <div className="flex space-x-4 mb-6">
                            <motion.button
                                type="button"
                                onClick={() => setLoginMethod("credentials")}
                                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${loginMethod === "credentials" ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaUser className="inline-block mr-2" />
                                Credentials
                            </motion.button>
                            <motion.button
                                type="button"
                                onClick={() => setLoginMethod("wallet")}
                                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${loginMethod === "wallet" ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaWallet className="inline-block mr-2" />
                                Wallet
                            </motion.button>
                        </div>
                    )}
                    
                    <AnimatePresence mode="wait">
                        {(!isLogin || (isLogin && loginMethod === "credentials")) && (
                            <motion.div
                                key="credentials"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="relative">
                                    <FaUser className="absolute top-3 left-3 text-gray-400" />
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full p-2 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                                        placeholder="Username"
                                        required
                                    />
                                </div>
                                <div className="relative mt-4">
                                    <FaLock className="absolute top-3 left-3 text-gray-400" />
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-2 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                                        placeholder="Password"
                                        required
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <AnimatePresence mode="wait">
                        {(!isLogin || (isLogin && loginMethod === "wallet")) && (
                            <motion.div
                                key="wallet"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <motion.button 
                                    type="button" 
                                    onClick={petraAddress ? disconnectPetra : connectPetra} 
                                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaWallet className="mr-2" />
                                    {petraAddress 
                                        ? `Connected: ${petraAddress.slice(0, 6)}...${petraAddress.slice(-4)}` 
                                        : "Connect Petra Wallet"}
                                </motion.button>
                                {petraAddress && !isLogin && (
                                    <motion.button 
                                        type="button" 
                                        onClick={disconnectPetra}
                                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Disconnect Wallet
                                    </motion.button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="text-red-500 text-sm bg-red-100 border border-red-400 rounded-lg p-2"
                            >
                                {errorMessage}
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="text-green-500 text-sm bg-green-100 border border-green-400 rounded-lg p-2"
                            >
                                {successMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {(!isLogin || (isLogin && loginMethod === "credentials")) && (
                        <motion.button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                            disabled={!isLogin && (!petraAddress || !username || !password)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLogin ? "Login" : "Sign Up"}
                        </motion.button>
                    )}
                </form>
            )}
        </div>
    );
};