import React from "react";

export default function ProgressBar({ campaign, donations = [], campaignIndex = null }) {
  // Defensive: handle undefined/null campaign
  if (!campaign) return null;

  // Helper: convert wei-like (string/BN/number) into ETH number safely
  const toEth = (wei) => {
    if (wei === undefined || wei === null) return 0;
    try {
      // If it's an object with toString (BN/BigNumber), coerce to string first
      const str = typeof wei === 'string' ? wei : (wei.toString ? wei.toString() : String(wei));
      // If the str is already in wei (like '1000000000000000000'), parse as BigInt-safe by using string math
      // But for simplicity and because values are small (ETH amounts), divide by 1e18 after Number conversion
      const n = Number(str);
      if (Number.isNaN(n)) return 0;
      return n / 1e18;
    } catch (e) {
      return 0;
    }
  };

  // Compute raised amount: prefer aggregating recent donation events for this campaign
  let raised = 0;
  if (Array.isArray(donations) && campaign.contractId) {
    try {
      // donations contain the contract campaignId (1-based) as string, matching campaign.contractId
      const expectedId = campaign.contractId.toString();
      const matching = donations.filter(d => d.campaignId?.toString() === expectedId);
      if (matching.length > 0) {
        // donations amounts are already in ETH strings in App.jsx mapping (toFixed)
        raised = matching.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      } else {
        raised = toEth(campaign.raised);
      }
    } catch (e) {
      raised = toEth(campaign.raised);
    }
  } else {
    raised = toEth(campaign.raised);
  }

  const goal = toEth(campaign.goal);
  const percent = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  // Color transition: green (0-50%), yellow (50-80%), purple (80-100%)
  let barColor = "from-green-400 to-green-500";
  if (percent > 80) barColor = "from-purple-500 to-indigo-500";
  else if (percent > 50) barColor = "from-yellow-400 to-yellow-500";

  return (
    <div className="w-full mb-2">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-gray-700">Progress</span>
        <span className="font-semibold text-gray-700">{percent.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
        <div
          className={`h-4 rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex flex-wrap justify-between text-base font-bold mb-2">
        <div>
          <div className="text-xs font-normal text-gray-500">Total Raised</div>
          <div>{raised.toFixed(4)} ETH</div>
        </div>
        <div>
          <div className="text-xs font-normal text-gray-500">Goal</div>
          <div>{goal.toFixed(4)} ETH</div>
        </div>
      </div>
    </div>
  );
}
