import { useState, useEffect, useCallback } from 'react';
import { API_URL } from 'config';
import { OwnedTicketNFT } from 'types/festival.types';
import { useGetAccountInfo } from 'hooks/sdkDappHooks';

/**
 * Hook to fetch user's NFT tickets from the blockchain
 */
export const useUserTickets = (tokenIdentifier?: string) => {
  const [tickets, setTickets] = useState<OwnedTicketNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useGetAccountInfo();

  const fetchUserTickets = useCallback(async () => {
    if (!address) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all NFTs owned by the user
      const response = await fetch(
        `${API_URL}/accounts/${address}/nfts?size=100`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }

      const nfts = await response.json();

      // Filter by token identifier if provided
      let userTickets: OwnedTicketNFT[] = nfts
        .filter((nft: any) => {
          // If tokenIdentifier is specified, filter by it
          if (tokenIdentifier) {
            return nft.collection === tokenIdentifier || nft.identifier?.startsWith(tokenIdentifier);
          }
          // Otherwise, look for festival-related tickets
          // You can customize this filter based on your NFT naming convention
          return true;
        })
        .map((nft: any) => ({
          tokenId: nft.identifier || nft.collection,
          nonce: nft.nonce || 0,
          balance: nft.balance || '1',
          name: nft.name || 'Festival Ticket',
          attributes: nft.attributes,
          uris: nft.uris || []
        }));

      setTickets(userTickets);
    } catch (err) {
      console.error('Error fetching user tickets:', err);
      setError('Failed to fetch your tickets');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, tokenIdentifier]);

  useEffect(() => {
    fetchUserTickets();
  }, [fetchUserTickets]);

  return { tickets, isLoading, error, refetch: fetchUserTickets };
};

/**
 * Hook to fetch resale listings from the contract
 * This queries the resale_info storage mapper
 */
export const useResaleListings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResaleListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Note: The smart contract doesn't have a direct view function to list all resale tickets
      // In a production app, you would either:
      // 1. Add a view function to the contract that returns all resale listings
      // 2. Index the contract events (ticketBought, etc.) using an indexer
      // 3. Store listings in a backend database that syncs with contract events
      
      // For now, we'll return mock data
      // In production, you'd query the MultiversX API for contract storage or events
      
      setListings([
        {
          ticketNonce: 1,
          sellerAddress: 'erd1...',
          festivalId: 1,
          price: '0.08',
          eventName: 'Electric Dreams Festival',
          ticketType: 'VIP',
          originalPrice: '0.1'
        },
        {
          ticketNonce: 2,
          sellerAddress: 'erd1...',
          festivalId: 1,
          price: '0.06',
          eventName: 'Electric Dreams Festival',
          ticketType: 'General Admission',
          originalPrice: '0.05'
        }
      ]);
    } catch (err) {
      console.error('Error fetching resale listings:', err);
      setError('Failed to fetch resale listings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResaleListings();
  }, [fetchResaleListings]);

  return { listings, isLoading, error, refetch: fetchResaleListings };
};

export default useUserTickets;

