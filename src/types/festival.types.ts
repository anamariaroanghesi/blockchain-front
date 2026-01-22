/**
 * Types for Festival Smart Contract
 * Based on the contract deployed at:
 * erd1qqqqqqqqqqqqqpgq7kpf8d4eyy6umdgeug8la0ss64uxeg4cn2jsuxvsq2
 */

// Festival data returned by getFestivalData view function
// Returns: (name, start_time, end_time, max_tickets, sold_tickets, inside)
export interface FestivalData {
  id: number;
  name: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  maxTickets: number;
  soldTickets: number;
  insideCount: number; // Current attendees inside
}

// Ticket price returned by getTicketPrices view function
// Returns flat array with 6 items per price:
// (name, phase, price, saleStart, saleEnd, ticketType)
export interface TicketPrice {
  name: string;
  phase: string;
  price: string; // BigUint as string in wei (18 decimals)
  priceDisplay: string; // Human readable price in EGLD
  saleStart?: number; // Unix timestamp - when this price becomes available
  saleEnd?: number; // Unix timestamp - when this price ends
  ticketType?: number; // 0 = Full Pass, 1 = Day Ticket
}

// Event within a festival returned by getEvents view function
// Returns: MultiValueEncoded<(name, location, start_time, end_time)>
export interface FestivalEvent {
  name: string;
  location: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
}

// Flash event for bonus points
export interface FlashEvent {
  name: string;
  startTime: number;
  endTime: number;
  bonusPoints: number;
}

// Product available for purchase at a festival
export interface FestivalProduct {
  productId: number;
  name: string;
  price: string; // BigUint as string in wei (18 decimals)
  priceDisplay: string; // Human readable price in USD
  description: string;
  imageUrl: string;
}

// User/Participant data
export interface Participant {
  address: string;
  username: string;
  score: number;
  lastCheckIn: number;
  totalTime: number;
}

// Resale ticket info stored in contract
// resale_info(ticket_nonce) -> (seller_address, festival_id, price)
export interface ResaleInfo {
  ticketNonce: number;
  sellerAddress: string;
  festivalId: number;
  price: string; // BigUint as string
  priceDisplay: string;
}

// Tax configuration for a festival
export interface FestivalTax {
  normalTaxPercent: number;
  soldOutTaxPercent: number;
}

// User's owned ticket (NFT)
export interface OwnedTicketNFT {
  tokenId: string; // Collection ID e.g., "FEST-abc123"
  identifier?: string; // Full identifier with nonce e.g., "FEST-abc123-03"
  nonce: number;
  balance: string;
  name: string;
  attributes?: string;
  uris?: string[];
}

// Transaction status
export type TransactionStatus = 'pending' | 'success' | 'fail' | 'invalid';

// Purchase ticket request
export interface BuyTicketRequest {
  festivalId: number;
  ticketPriceName: string;
  amountEgld: string;
}

// Create participant request
export interface CreateParticipantRequest {
  username: string;
}

// Put ticket for sale request
export interface PutTicketForSaleRequest {
  festivalId: number;
  ticketNonce: number;
  tokenIdentifier: string;
  price: string; // in EGLD
}

// Buy resale ticket request
export interface BuyResaleTicketRequest {
  ticketNonce: number;
  amountEgld: string;
}

// Helper to convert wei (10^18) to EGLD display format
export const weiToEgld = (wei: string): string => {
  const weiNum = BigInt(wei);
  const egld = Number(weiNum) / 1e18;
  return egld.toFixed(4);
};

// Helper to convert EGLD to wei
export const egldToWei = (egld: string): string => {
  const egldNum = parseFloat(egld);
  const wei = BigInt(Math.floor(egldNum * 1e18));
  return wei.toString();
};

// Helper to format timestamp
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

// Helper to format date only
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper to format time only
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Check if festival is currently active
export const isFestivalActive = (festival: FestivalData): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return now >= festival.startTime && now <= festival.endTime;
};

// Check if festival has started
export const hasFestivalStarted = (festival: FestivalData): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return now >= festival.startTime;
};

// Check if festival has ended
export const hasFestivalEnded = (festival: FestivalData): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return now > festival.endTime;
};

// Check if tickets are sold out
export const isTicketsSoldOut = (festival: FestivalData): boolean => {
  return festival.soldTickets >= festival.maxTickets;
};

// Get ticket availability percentage
export const getAvailabilityPercentage = (festival: FestivalData): number => {
  const available = festival.maxTickets - festival.soldTickets;
  return (available / festival.maxTickets) * 100;
};

