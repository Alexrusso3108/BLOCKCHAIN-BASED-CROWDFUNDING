import { useEffect, useState } from "react";
import { ethers } from "ethers";
import RecentDonations from "./src/components/RecentDonations";
import contractAbi from "./src/abi.js"; // <-- Replace with your ABI
const contractAddress = "0x6c30c14c182d3e83d5943dfb0729d1a02d4086a6";

export default function DonationFeed() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    async function fetchDonations() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractAbi, provider);

      // Fetch past DonationReceived events
      const events = await contract.queryFilter("DonationReceived", -10000); // Last 10,000 blocks
      const formatted = events.map((e) => ({
        address: e.args.donor,
        // Ensure amount and timestamp are converted from BigNumber/BigInt safely
        amount: ethers.utils.formatEther(e.args.amount?.toString ? e.args.amount.toString() : e.args.amount),
        time: new Date((e.args.timestamp?.toNumber ? e.args.timestamp.toNumber() : Number(e.args.timestamp)) * 1000).toLocaleString(),
      }));

      // Sort by most recent
      setDonations(formatted.reverse());
    }

    fetchDonations();
  }, []);

  return <RecentDonations donations={donations} />;
}
