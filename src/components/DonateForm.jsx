import React, { useState } from "react";
import { getContract } from "../web3";

export default function DonateForm({ campaignId, reloadCampaigns, onOptimisticDonate }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const quickAmounts = ["0.01", "0.05", "0.1", "0.5"];

  const handleDonate = async () => {
    setLoading(true);
    try {
      const { web3, contract } = await getContract();
      const accounts = await web3.eth.getAccounts();
      // Convert to 0-based indexing for the smart contract
      const contractCampaignId = Number(campaignId) - 1;
      
      console.log("Frontend campaign ID:", campaignId, "-> Contract campaign ID:", contractCampaignId);
      console.log("Donation amount:", amount, "Wei value:", web3.utils.toWei(amount, "ether"));
      
      // Validate amount
      if (!amount || parseFloat(amount) <= 0) {
        alert("Please enter a valid donation amount greater than 0");
        return;
      }
      // Optimistic donation entry (displayed immediately)
      if (onOptimisticDonate) {
        onOptimisticDonate({
          address: accounts[0],
          amount: parseFloat(amount).toFixed(4),
          campaignId: campaignId.toString(), // Use original frontend ID for display
          time: new Date().toLocaleString(),
        });
      }

      // Estimate gas and add 20% buffer
      const gasEstimate = await contract.methods.donate(contractCampaignId).estimateGas({
        from: accounts[0],
        value: web3.utils.toWei(amount, "ether"),
      });
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      await contract.methods.donate(contractCampaignId).send({
        from: accounts[0],
        value: web3.utils.toWei(amount, "ether"),
        gas: gasLimit,
      });
      alert("Donation successful!");
      setAmount("");
      // Force reload after successful donation
      if (reloadCampaigns) {
        console.log("Reloading campaigns after donation...");
        await reloadCampaigns();
        console.log("Reload completed!");
      } else {
        console.warn("No reloadCampaigns function provided!");
      }
    } catch (err) {
      console.error("Donation failed:", err);
      alert("Donation failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-indigo-50/40 rounded-xl p-4 shadow-inner mb-2">
      <div className="mb-4 relative">
        <input
          type="number"
          min="0"
          step="any"
          placeholder="0.00"
          className="border border-indigo-200 rounded-lg px-4 py-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
        <span className="absolute right-6 top-3 text-gray-400 font-semibold">ETH</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-indigo-200 transition-all"
            onClick={() => setAmount(amt)}
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m0 0l-3-3m3 3l3-3" /></svg>
            {amt} ETH
          </button>
        ))}
      </div>
      <button
        onClick={handleDonate}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg text-lg mb-2 shadow-lg transition-all disabled:opacity-50"
        disabled={loading || !amount}
      >
        {loading ? "Processing..." : "Donate Now"}
      </button>
      <p className="text-xs text-gray-500 text-center mt-2">
        All donations are processed on the Ethereum blockchain and are subject to network fees.
      </p>
    </div>
  );
}
