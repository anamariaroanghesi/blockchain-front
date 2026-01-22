import { useState, useEffect, useCallback } from 'react';
import { API_URL, contractAddress, FESTIVAL_ID } from 'config';
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
          // Use collection ID (e.g., "FEST-c51ed4") not the full identifier with nonce
          tokenId: nft.collection,
          identifier: nft.identifier, // Full identifier (e.g., "FEST-c51ed4-03")
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

// Binary parser for resale data
const BinaryParser = {
  fromBase64: (base64: string): Uint8Array => {
    if (!base64) return new Uint8Array(0);
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch {
      return new Uint8Array(0);
    }
  },
  readU64: (buffer: Uint8Array, offset: number): { value: number; newOffset: number } => {
    if (offset + 8 > buffer.length) return { value: 0, newOffset: offset };
    const view = new DataView(buffer.buffer, buffer.byteOffset + offset, 8);
    const value = Number(view.getBigUint64(0, false));
    return { value, newOffset: offset + 8 };
  },
  readBigInt: (buffer: Uint8Array, offset: number): { value: bigint; newOffset: number } => {
    if (offset >= buffer.length) return { value: BigInt(0), newOffset: offset };
    const length = (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3];
    offset += 4;
    let hex = '0x';
    for (let i = 0; i < length; i++) {
      let h = buffer[offset + i].toString(16);
      if (h.length === 1) h = '0' + h;
      hex += h;
    }
    return { value: hex === '0x' ? BigInt(0) : BigInt(hex), newOffset: offset + length };
  },
  // Read a 32-byte address
  readAddress: (buffer: Uint8Array, offset: number): { value: string; newOffset: number } => {
    if (offset + 32 > buffer.length) return { value: '', newOffset: offset };
    let hex = '';
    for (let i = 0; i < 32; i++) {
      let h = buffer[offset + i].toString(16);
      if (h.length === 1) h = '0' + h;
      hex += h;
    }
    // Convert to bech32 format (simplified - just show hex for now)
    return { value: hex, newOffset: offset + 32 };
  }
};

export interface ResaleListing {
  nonce: number;
  seller: string;
  price: string;
  priceDisplay: string;
  originalPrice: string;
  originalPriceDisplay: string;
  festivalId?: number;
}

/**
 * Hook to fetch resale listings from the contract
 * Searches across all festivals (1-10) to find all listings
 */
export const useResaleListings = () => {
  const [listings, setListings] = useState<ResaleListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResaleListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allListings: ResaleListing[] = [];
      
      // Search across multiple festivals
      for (let fid = 1; fid <= 10; fid++) {
        try {
          // Convert festival ID to hex
          let hexId = fid.toString(16);
          if (hexId.length % 2 !== 0) hexId = '0' + hexId;

          const response = await fetch(`${API_URL}/vm-values/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scAddress: contractAddress,
              funcName: 'getResaleTicketsForFestival',
              args: [hexId]
            })
          });

          const json = await response.json();

          // The response structure is { data: { data: { returnData: [...] } } }
          const returnData = json.data?.data?.returnData || json.data?.returnData || json.returnData;
          
          if (!returnData || returnData.length === 0) {
            continue; // No listings for this festival
          }

          // Contract returns MultiValueEncoded<(u64, ManagedAddress, BigUint, BigUint)>
          // Each item is: (nonce, seller, price, original_price)
          for (const item of returnData) {
            if (!item) continue;
            
            const buffer = BinaryParser.fromBase64(item);
            if (buffer.length === 0) continue;

            let offset = 0;

            // 1. Nonce (u64) - 8 bytes
            const nonceRes = BinaryParser.readU64(buffer, offset);
            offset = nonceRes.newOffset;

            // 2. Seller Address (32 bytes)
            const sellerRes = BinaryParser.readAddress(buffer, offset);
            offset = sellerRes.newOffset;

            // 3. Price (BigUint - length prefixed)
            const priceRes = BinaryParser.readBigInt(buffer, offset);
            offset = priceRes.newOffset;

            // 4. Original Price (BigUint - length prefixed)
            const origPriceRes = BinaryParser.readBigInt(buffer, offset);

            // Convert to EGLD (18 decimals)
            const priceEgld = Number(priceRes.value) / 1e18;
            const origPriceEgld = Number(origPriceRes.value) / 1e18;

            allListings.push({
              nonce: nonceRes.value,
              seller: `erd1${sellerRes.value.slice(0, 6)}...${sellerRes.value.slice(-4)}`,
              price: priceRes.value.toString(),
              priceDisplay: priceEgld.toFixed(4),
              originalPrice: origPriceRes.value.toString(),
              originalPriceDisplay: origPriceEgld.toFixed(4),
              festivalId: fid
            });
          }
        } catch (err) {
          // Skip this festival on error
          console.log(`Error fetching festival ${fid}:`, err);
        }
      }

      setListings(allListings);
      
    } catch (err) {
      console.error('Error fetching resale listings:', err);
      setError('Failed to fetch resale listings');
      setListings([]);
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

