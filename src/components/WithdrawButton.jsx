import React, { useState } from "react";
import { getContract } from "../web3";

export default function WithdrawButton({ campaignId, reloadCampaigns }) {
  const [loading, setLoading] = useState(false);
  const handleWithdraw = async () => {
    setLoading(true);
    try {
      const { contract, web3 } = await getContract();
      const accounts = await web3.eth.getAccounts();
      const contractCampaignId = Number(campaignId) - 1; // Convert to 0-based indexing
      
      // Estimate gas and add 20% buffer
      const gasEstimate = await contract.methods.withdraw(contractCampaignId).estimateGas({
        from: accounts[0],
      });
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
      
      await contract.methods.withdraw(contractCampaignId).send({ 
        from: accounts[0],
        gas: gasLimit,
      });
      alert("Funds withdrawn!");
      if (reloadCampaigns) await reloadCampaigns();
    } catch (err) {
      console.error("Withdraw failed:", err);
      alert("Withdraw failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleWithdraw} className="bg-red-600 text-white px-4 py-2 rounded mt-4 disabled:opacity-50" disabled={loading}>
      {loading ? "Withdrawing..." : "Withdraw (Owner Only)"}
    </button>
  );
}
