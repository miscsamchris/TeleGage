import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletConnector } from "./components/WalletConnector";
import { Dashboard } from "./components/Dashboard";


import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

const App: React.FC = () => {
  const { connected } = useWallet();

  return (
    <Router>
      <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center bg-[linear-gradient(to_bottom,#000,#200D42_34%,#4F21A1_65%,#A45EDB_82%)]">
        <Routes>
          <Route path="/" element={connected ? <Navigate to="/dashboard" /> : <WalletConnector />} />
          <Route path="/dashboard" element={connected ? <Dashboard /> : <Navigate to="/" />} />
          <Route 
            path="/user/:userId" 
            element={
              connected ? <Dashboard /> : <WalletConnector />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;