/**
 * Ticket Service - API layer for blockchain interactions
 * Uses MultiversX API endpoints for ticket operations
 */

import { API_URL, contractAddress } from 'config';

// Platform fee percentage for resale (e.g., 5%)
export const PLATFORM_FEE_PERCENT = 5;
export const ORGANIZER_FEE_PERCENT = 2.5;

export interface ResaleTicket {
  id: string;
  tokenId: string;
  nonce: number;
  eventName: string;
  ticketType: string;
  originalPrice: string;
  resalePrice: string;
  sellerAddress: string;
  listedAt: string;
}

export interface EntryCode {
  code: string;
  ticketId: string;
  walletAddress: string;
  generatedAt: string;
  expiresAt: string;
  isUsed: boolean;
}

export interface PurchaseResult {
  success: boolean;
  transactionHash?: string;
  ticketId?: string;
  error?: string;
}

/**
 * Calculate fees for resale transaction
 */
export const calculateResaleFees = (resalePrice: number) => {
  const platformFee = resalePrice * (PLATFORM_FEE_PERCENT / 100);
  const organizerFee = resalePrice * (ORGANIZER_FEE_PERCENT / 100);
  const totalFees = platformFee + organizerFee;
  const sellerReceives = resalePrice - totalFees;
  const buyerPays = resalePrice;

  return {
    resalePrice,
    platformFee,
    organizerFee,
    totalFees,
    sellerReceives,
    buyerPays
  };
};

/**
 * Get NFTs owned by a wallet address
 * Uses MultiversX API to fetch NFTs
 */
export const getOwnedNFTs = async (walletAddress: string, collection?: string) => {
  try {
    let url = `${API_URL}/accounts/${walletAddress}/nfts?size=100`;
    if (collection) {
      url += `&collection=${collection}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch NFTs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching owned NFTs:', error);
    return [];
  }
};

/**
 * Get NFT details by identifier
 */
export const getNFTDetails = async (identifier: string) => {
  try {
    const response = await fetch(`${API_URL}/nfts/${identifier}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    return null;
  }
};

/**
 * Generate entry code for check-in
 * This creates a time-limited code that can be verified
 */
export const generateEntryCode = async (
  ticketId: string,
  walletAddress: string
): Promise<EntryCode> => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes expiry
  
  // Generate a unique code with timestamp for verification
  const code = `ENTRY-${ticketId}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  
  return {
    code,
    ticketId,
    walletAddress,
    generatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isUsed: false
  };
};

/**
 * Verify entry code at check-in
 */
export const verifyEntryCode = async (
  code: string,
  walletAddress: string
): Promise<{ valid: boolean; error?: string }> => {
  // Parse the code
  if (!code.startsWith('ENTRY-')) {
    return { valid: false, error: 'Invalid code format' };
  }
  
  const parts = code.split('-');
  if (parts.length < 4) {
    return { valid: false, error: 'Malformed code' };
  }
  
  const timestamp = parseInt(parts[2]);
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (now - timestamp > fiveMinutes) {
    return { valid: false, error: 'Code has expired' };
  }
  
  // Verify the wallet owns the ticket on blockchain
  const ticketId = parts[1];
  try {
    const nftDetails = await getNFTDetails(ticketId);
    if (!nftDetails) {
      return { valid: false, error: 'Ticket not found on blockchain' };
    }
    
    if (nftDetails.owner !== walletAddress) {
      return { valid: false, error: 'Wallet does not own this ticket' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Failed to verify ticket ownership' };
  }
};

/**
 * Query smart contract storage
 */
export const queryContract = async (funcName: string, args: string[] = []) => {
  try {
    const response = await fetch(`${API_URL}/vm-values/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scAddress: contractAddress,
        funcName,
        args
      })
    });
    
    if (!response.ok) {
      throw new Error('Contract query failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error querying contract:', error);
    return null;
  }
};

/**
 * Get account transactions
 */
export const getAccountTransactions = async (address: string, size: number = 20) => {
  try {
    const response = await fetch(
      `${API_URL}/accounts/${address}/transactions?size=${size}&status=success`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};
