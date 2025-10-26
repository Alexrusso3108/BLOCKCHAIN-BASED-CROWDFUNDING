import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import Web3 from 'web3';
import { getContract } from '../web3';

const BlockchainContext = createContext(null);

export const BlockchainProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);

  const contractRef = useRef(null);
  const web3Ref = useRef(null);

  // --- LOAD CAMPAIGNS ---
  const loadCampaigns = useCallback(async () => {
    try {
      const contract = contractRef.current;
      const web3 = web3Ref.current;
      if (!contract || !web3) return [];

      const accounts = await web3.eth.getAccounts();
      if (accounts && accounts.length > 0) setCurrentAccount(accounts[0]);
      else setCurrentAccount(null);

      // Support two possible contract APIs:
      // 1) getCampaigns() returns Campaign[]
      // 2) getCampaignCount() + getCampaign(i) (returns tuple per campaign)
      if (contract.methods.getCampaigns) {
        const result = await contract.methods.getCampaigns().call();
        const indexed = result.map((c, idx) => ({
          // ABI shape when getCampaigns returns struct array
          title: c.title || c[0] || '',
          description: c.description || c[1] || '',
          category: c.category || c[2] || '',
          image: c.image || c[3] || '',
          goal: (c.goal || c[4] || '0').toString(),
          raised: (c.raised || c[5] || '0').toString(),
          owner: c.owner || c[6] || '',
          withdrawn: Boolean(c.withdrawn || c[7] || false),
          _index: idx,
          contractId: String(idx + 1),
        }));
        setCampaigns(indexed);
        return indexed;
      }

      if (contract.methods.getCampaignCount && contract.methods.getCampaign) {
        const countStr = await contract.methods.getCampaignCount().call();
        const count = Number(countStr || 0);
        const results = [];
        for (let idx = 0; idx < count; idx += 1) {
          try {
            const c = await contract.methods.getCampaign(idx).call();
            // getCampaign returns a tuple matching the struct order
            const campaign = {
              title: c.title || c[0] || '',
              description: c.description || c[1] || '',
              category: c.category || c[2] || '',
              image: c.image || c[3] || '',
              goal: (c.goal || c[4] || '0').toString(),
              raised: (c.raised || c[5] || '0').toString(),
              owner: c.owner || c[6] || '',
              withdrawn: Boolean(c.withdrawn || c[7] || false),
              _index: idx,
              contractId: String(idx + 1),
            };
            results.push(campaign);
          } catch (e) {
            console.error('Error reading campaign index', idx, e);
          }
        }
        setCampaigns(results);
        return results;
      }

      // If neither accessor exists, return empty list
      console.warn('Contract does not expose getCampaigns or getCampaignCount/getCampaign');
      setCampaigns([]);
      return [];
    } catch (err) {
      console.error('loadCampaigns error', err);
      setCampaigns([]);
      return [];
    }
  }, []);

  // --- LOAD DONATIONS ---
  const loadDonations = useCallback(async () => {
    try {
      const contract = contractRef.current;
      const web3 = web3Ref.current;
      if (!contract || !web3) return [];

      const events = await contract.getPastEvents('Donated', { fromBlock: 0, toBlock: 'latest' });
      const donationsWithTime = await Promise.all(
        events.map(async (event) => {
          const block = await web3.eth.getBlock(event.blockNumber);
          const rawAmount = event.returnValues.amount?.toString();
          const amountEth = parseFloat(web3.utils.fromWei(rawAmount, 'ether'));
          const campaignId = event.returnValues.campaignId?.toString() || null;
          return {
            address: event.returnValues.donor,
            amount: amountEth.toFixed(4),
            amountWei: rawAmount,
            campaignId,
            time: new Date(Number(block.timestamp) * 1000).toLocaleString(),
          };
        })
      );

      const ordered = donationsWithTime.reverse();
      setDonations(ordered);
      return ordered;
    } catch (err) {
      console.error('loadDonations error', err);
      setDonations([]);
      return [];
    }
  }, []);

  // --- RELOAD EVERYTHING ---
  const reloadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedCampaigns, donationsList] = await Promise.all([loadCampaigns(), loadDonations()]);

      // aggregate total raised per campaign
      const donationMap = {};
      for (const d of donationsList) {
        if (!d.campaignId || !d.amountWei) continue;
        const id = d.campaignId;
        donationMap[id] = (donationMap[id] || 0n) + BigInt(d.amountWei);
      }

      const updatedCampaigns = loadedCampaigns.map((c) => {
        const id = c.contractId.toString();
        const raised = donationMap[id] || 0n;
        return { ...c, raised: raised.toString() };
      });

      setCampaigns(updatedCampaigns);
    } catch (err) {
      console.error('reloadAll error', err);
    } finally {
      setLoading(false);
    }
  }, [loadCampaigns, loadDonations]);

  // --- INITIAL SETUP & REAL-TIME SUBSCRIPTIONS ---
  useEffect(() => {
    let mounted = true;
    let donateSub = null;
    let campaignCreatedSub = null;
    let withdrawnSub = null;

    const init = async () => {
      try {
        // 👇 Connect via WebSocket provider for live updates
        const { contract, web3, accounts } = await getContract(true);
        if (!mounted) return;

        contractRef.current = contract;
        web3Ref.current = web3;
        if (accounts?.length) setCurrentAccount(accounts[0]);

        await reloadAll(); // Load data once initially

        // --- 📡 SUBSCRIBE TO LIVE EVENTS ---
        if (contract.events) {
          // 🔴 When someone donates
          donateSub = contract.events
            .Donated({ fromBlock: 'latest' })
            .on('data', async (event) => {
              console.log('💰 New donation detected:', event.returnValues);

              const { donor, amount, campaignId } = event.returnValues;
              const block = await web3.eth.getBlock(event.blockNumber);
              const amountEth = parseFloat(web3.utils.fromWei(amount, 'ether')).toFixed(4);

              // Add new donation immediately
              const donation = {
                address: donor,
                amount: amountEth,
                amountWei: amount.toString(),
                campaignId: campaignId.toString(),
                time: new Date(Number(block.timestamp) * 1000).toLocaleString(),
              };
              setDonations((prev) => [donation, ...prev]);

              // Update corresponding campaign raised amount
              setCampaigns((prev) => {
                const updated = [...prev];
                const campaignIdStr = campaignId.toString();
                const idx = updated.findIndex(c => c.contractId === campaignIdStr);
                if (idx >= 0) {
                  const prevRaised = BigInt(updated[idx].raised || '0');
                  const newRaised = prevRaised + BigInt(amount);
                  updated[idx] = { ...updated[idx], raised: newRaised.toString() };
                }
                return updated;
              });
            })
            .on('error', (err) => console.error('Donation event error:', err));

          // 🟢 New campaign created
          campaignCreatedSub = contract.events
            .CampaignCreated({ fromBlock: 'latest' })
            .on('data', async () => {
              console.log('📢 New campaign detected!');
              await reloadAll();
            })
            .on('error', (err) => console.error('CampaignCreated error:', err));

          // 💸 Campaign withdrawal
          withdrawnSub = contract.events
            .Withdrawn({ fromBlock: 'latest' })
            .on('data', async () => {
              console.log('💸 Funds withdrawn detected!');
              await reloadAll();
            })
            .on('error', (err) => console.error('Withdrawn error:', err));
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setLoading(false);
      }
    };

    init();

    // Cleanup
    return () => {
      mounted = false;
      if (donateSub?.unsubscribe) donateSub.unsubscribe();
      if (campaignCreatedSub?.unsubscribe) campaignCreatedSub.unsubscribe();
      if (withdrawnSub?.unsubscribe) withdrawnSub.unsubscribe();
    };
  }, [reloadAll]);

  return (
    <BlockchainContext.Provider
      value={{
        campaigns,
        donations,
        loading,
        currentAccount,
        reloadAll,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => useContext(BlockchainContext);
export default BlockchainContext;
