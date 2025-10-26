import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import DonateForm from "./components/DonateForm";
import WithdrawButton from "./components/WithdrawButton";
import ProgressBar from "./components/ProgressBar";
import CreateCampaignModal from "./components/CreateCampaignModal";
import CampaignList from "./components/CampaignList";
import RecentDonations from "./components/RecentDonations";
import MyCampaignList from "./components/MyCampaignList";
import AuthPage from "./components/AuthPage";
import { BlockchainProvider, useBlockchain } from "./contexts/BlockchainContext";
import { getContract } from "./web3";
import Loader from "./components/Loader";
import { useAuth } from "./contexts/AuthContext";

function AppInner() {
  const { user, loading: authLoading } = useAuth();
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeView, setActiveView] = useState('all');

  // Use blockchain data from context
  const { campaigns, donations, loading, currentAccount, reloadAll, handleOptimisticDonate } = useBlockchain();

  // Keep the local authenticatedUser in sync with context `user` so
  // sessions restored by Supabase on page refresh are respected.
  useEffect(() => {
    setAuthenticatedUser(user);
  }, [user]);

  // Create campaign on blockchain — use getContract directly for write actions
  const handleCreateCampaign = async (campaign) => {
    try {
      const { contract, web3, accounts } = await getContract();
      if (!accounts || accounts.length === 0) {
        alert("Please connect your wallet to create a campaign.");
        return;
      }
      await contract.methods.createCampaign(
        campaign.title,
        campaign.description,
        campaign.category,
        campaign.image,
        web3.utils.toWei(campaign.goal.toString(), "ether")
      ).send({ from: accounts[0] });
      await reloadAll();
    } catch (error) {
      console.error("Create campaign failed:", error);
      alert("Create campaign failed. See console for details.");
    }
  };

  // reloadAll provided by blockchain context

  const handleViewChange = (view) => { setActiveView(view); };

  const handleAuthSuccess = (userData) => { setAuthenticatedUser(userData); };

  // Show auth page if not authenticated
  if (authLoading) {
    return <Loader />;
  }

  if (!authenticatedUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Exclude the 0th campaign from UI as requested
  const visibleCampaigns = campaigns.filter(c => c._index !== 0);
  const activeCampaigns = visibleCampaigns.filter(c => !c.withdrawn);
  const myActiveCampaigns = visibleCampaigns.filter(c => !c.withdrawn && c.owner === currentAccount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-100">
      {loading && <Loader />}
      <Header 
        onCreateCampaign={() => setShowModal(true)} 
        onViewChange={handleViewChange}
        authenticatedUser={authenticatedUser}
      />
      <CreateCampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateCampaign}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Support Causes You Care About
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our community of donors and make a difference. Every contribution counts towards creating positive change.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-3xl font-bold text-indigo-600 mb-2">{activeCampaigns.length}</div>
            <div className="text-gray-600">Active Campaigns</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-2">{donations.length}</div>
            <div className="text-gray-600">Total Donations</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {activeCampaigns.filter(c => c.owner === currentAccount).length}
            </div>
            <div className="text-gray-600">Your Campaigns</div>
          </div>
        </div>

        {/* Campaigns Section */}
        <div className="bg-white/80 rounded-3xl shadow-2xl px-6 py-8 border border-gray-100 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {activeView === 'all' ? 'All Active Campaigns' : 'My Campaigns'}
            </h2>
            <div className="text-sm text-gray-500">
              {activeView === 'all' 
                ? 'Discover and support causes'
                : 'Manage your fundraising campaigns'}
            </div>
          </div>
          
          {loading ? (
            <div className="text-center text-lg text-gray-500 py-10">Loading campaigns...</div>
          ) : activeView === 'all' ? (
            activeCampaigns.length === 0 ? (
              <div className="text-center text-gray-400 py-10 text-lg">
                No campaigns yet. Be the first to create one!
              </div>
            ) : (
              <CampaignList 
                campaigns={activeCampaigns} 
                reloadCampaigns={reloadAll} 
                donations={donations}
                currentAccount={currentAccount}
                onOptimisticDonate={handleOptimisticDonate}
              />
            )
          ) : myActiveCampaigns.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-lg">
              You haven't created any active campaigns yet.
            </div>
          ) : (
            <MyCampaignList 
              campaigns={myActiveCampaigns} 
              reloadCampaigns={reloadAll} 
              donations={donations}
              currentAccount={currentAccount}
              onOptimisticDonate={handleOptimisticDonate}
            />
          )}
        </div>

        {/* Recent Donations Section */}
        
      </main>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            Built with ❤️ for the blockchain community
          </div>
        </div>
      </footer>

      <style>{`.fade-in { animation: fadeIn 0.7s; } @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; }}`}</style>
    </div>
  );
}

export default function App() {
  return (
    <BlockchainProvider>
      <AppInner />
    </BlockchainProvider>
  );
}
