import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getContract } from '../web3';

const BlockchainContext = createContext(null);

export const BlockchainProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);

  const contractRef = useRef(null);
  const web3Ref = useRef(null);
  const lastBlockRef = useRef(0);
  const pollIntervalRef = useRef(null);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      let contract, accounts;
      if (contractRef.current && web3Ref.current) {
        contract = contractRef.current;
        accounts = await web3Ref.current.eth.getAccounts();
      } else {
        const res = await getContract();
        contract = res.contract;
        web3Ref.current = res.web3;
        contractRef.current = res.contract;
        accounts = res.accounts;
      }
      const result = await contract.methods.getCampaigns().call();
      const indexed = result.map((c, idx) => ({ ...c, _index: idx, contractId: (idx + 1).toString() }));
      setCampaigns(indexed);
      if (accounts && accounts.length > 0) setCurrentAccount(accounts[0]); else setCurrentAccount(null);
    } catch (err) {
      console.error('loadCampaigns error', err);
      setCampaigns([]);
      setCurrentAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDonations = async () => {
    try {
      const contract = contractRef.current || (await getContract()).contract;
      const web3 = web3Ref.current || (await getContract()).web3;
      const events = await contract.getPastEvents('Donated', { fromBlock: 0, toBlock: 'latest' });
      const donationsWithTime = await Promise.all(events.map(async (event) => {
        const block = await web3.eth.getBlock(event.blockNumber);
        const rawAmount = event.returnValues.amount;
        const amountEthStr = web3.utils.fromWei(rawAmount.toString(), 'ether');
        const amountEth = parseFloat(amountEthStr);
        const campaignId = event.returnValues.campaignId !== undefined ? event.returnValues.campaignId.toString() : null;
        return {
          address: event.returnValues.donor,
          amount: amountEth.toFixed(4),
          campaignId,
          time: new Date(Number(block.timestamp) * 1000).toLocaleString()
        };
      }));
      setDonations(donationsWithTime.reverse());
      try {
        const latest = await web3.eth.getBlockNumber();
        lastBlockRef.current = latest;
      } catch (err) { /* ignore */ }
    } catch (err) {
      console.error('loadDonations error', err);
      setDonations([]);
    }
  };

  const reloadAll = async () => {
    await loadCampaigns();
    await loadDonations();
  };

  const handleOptimisticDonate = (donation) => {
    setDonations(prev => [donation, ...prev]);
  };

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      try {
        const { contract, web3, accounts } = await getContract();
        contractRef.current = contract;
        web3Ref.current = web3;
        if (accounts && accounts.length > 0) setCurrentAccount(accounts[0]);
        await loadCampaigns();
        await loadDonations();

        try {
          const latest = await web3.eth.getBlockNumber();
          lastBlockRef.current = latest;
        } catch (err) {
          lastBlockRef.current = 0;
        }

        pollIntervalRef.current = setInterval(async () => {
          if (!mounted) return;
          try {
            const web3 = web3Ref.current;
            const contract = contractRef.current;
            if (!web3 || !contract) return;
            const latest = await web3.eth.getBlockNumber();
            if (latest > lastBlockRef.current) {
              const fromBlock = lastBlockRef.current + 1 || 0;
              const toBlock = latest;
              lastBlockRef.current = latest;
              const events = await contract.getPastEvents('allEvents', { fromBlock, toBlock });
              if (events && events.length > 0) {
                for (const ev of events) {
                  if (ev.event === 'Donated') {
                    try {
                      const block = await web3.eth.getBlock(ev.blockNumber);
                      const rawAmount = ev.returnValues.amount;
                      const amountEthStr = web3.utils.fromWei(rawAmount.toString(), 'ether');
                      const amountEth = parseFloat(amountEthStr);
                      const campaignId = ev.returnValues.campaignId !== undefined ? ev.returnValues.campaignId.toString() : null;
                      const donationObj = {
                        address: ev.returnValues.donor,
                        amount: amountEth.toFixed(4),
                        campaignId,
                        time: new Date(Number(block.timestamp) * 1000).toLocaleString()
                      };
                      setDonations(prev => [donationObj, ...prev]);
                      setCampaigns(prev => {
                        if (!campaignId) return prev;
                        const idx = parseInt(campaignId, 10) - 1;
                        if (isNaN(idx) || idx < 0 || idx >= prev.length) return prev;
                        const updated = [...prev];
                        const prevRaised = Number(web3.utils.fromWei(updated[idx].raised?.toString() || '0', 'ether')) || 0;
                        updated[idx] = { ...updated[idx], raised: web3.utils.toWei((prevRaised + amountEth).toString(), 'ether') };
                        return updated;
                      });
                    } catch (err) {
                      console.error('Error processing Donated event', err);
                    }
                  } else if (ev.event === 'CampaignCreated' || ev.event === 'Withdrawn') {
                    await loadCampaigns();
                  }
                }
              }
            }
          } catch (err) {
            console.error('Polling error:', err);
          }
        }, 4000);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    initialize();

    return () => {
      mounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  return (
    <BlockchainContext.Provider value={{ campaigns, donations, loading, currentAccount, reloadAll, handleOptimisticDonate }}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => useContext(BlockchainContext);

export default BlockchainContext;
