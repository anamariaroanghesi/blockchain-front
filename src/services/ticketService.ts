/**
 * Ticket Service - API layer for blockchain interactions
 * In production, these would call actual MultiversX API endpoints
 */

import { OwnedTicket } from 'types/ticket.types';

const API_BASE = 'https://testnet-api.multiversx.com';

// Platform fee percentage for resale (e.g., 5%)
export const PLATFORM_FEE_PERCENT = 5;
export const ORGANIZER_FEE_PERCENT = 2.5;

export interface ResaleTicket {
  id: string;
  tokenId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  ticketType: string;
  originalPrice: string;
  resalePrice: string;
  sellerAddress: string;
  listedAt: string;
  imageUrl: string;
}

export interface EntryCode {
  code: string;
  ticketId: string;
  eventId: string;
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

// Simulated resale listings
const mockResaleListings: ResaleTicket[] = [
  {
    id: 'resale-1',
    tokenId: 'TICKET-x1y2z3-01',
    eventId: '1',
    eventName: 'Electric Dreams Festival 2026',
    eventDate: '2026-07-15',
    ticketType: 'VIP Experience',
    originalPrice: '1.2',
    resalePrice: '1.5',
    sellerAddress: 'erd1qqqqqqqqqqqqqpgq...abc123',
    listedAt: '2026-01-18T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
  },
  {
    id: 'resale-2',
    tokenId: 'TICKET-a4b5c6-02',
    eventId: '1',
    eventName: 'Electric Dreams Festival 2026',
    eventDate: '2026-07-15',
    ticketType: 'General Admission',
    originalPrice: '0.5',
    resalePrice: '0.65',
    sellerAddress: 'erd1qqqqqqqqqqqqqpgq...def456',
    listedAt: '2026-01-17T14:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
  },
  {
    id: 'resale-3',
    tokenId: 'TICKET-m7n8o9-03',
    eventId: '3',
    eventName: 'Taylor Swift - The Eras Tour',
    eventDate: '2026-06-20',
    ticketType: 'Standing',
    originalPrice: '0.6',
    resalePrice: '0.9',
    sellerAddress: 'erd1qqqqqqqqqqqqqpgq...ghi789',
    listedAt: '2026-01-16T09:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
  }
];

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
 * Get all resale listings
 * In production: GET /events/tickets?status=resale
 */
export const getResaleListings = async (eventId?: string): Promise<ResaleTicket[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (eventId) {
    return mockResaleListings.filter(t => t.eventId === eventId);
  }
  return mockResaleListings;
};

/**
 * List a ticket for resale
 * In production: POST /transactions/list-resale
 */
export const listTicketForResale = async (
  ticketId: string,
  price: string,
  walletAddress: string
): Promise<PurchaseResult> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate successful listing
  return {
    success: true,
    transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`
  };
};

/**
 * Buy a ticket from resale marketplace
 * In production: POST /transactions/buy-resale
 */
export const buyResaleTicket = async (
  resaleId: string,
  buyerAddress: string
): Promise<PurchaseResult> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    ticketId: `TICKET-${Math.random().toString(36).slice(2, 8)}`
  };
};

/**
 * Buy ticket directly from organizer
 * In production: POST /transactions/buy-ticket
 */
export const buyTicketFromOrganizer = async (
  eventId: string,
  ticketTypeId: string,
  quantity: number,
  buyerAddress: string
): Promise<PurchaseResult> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    ticketId: `TICKET-${Math.random().toString(36).slice(2, 8)}`
  };
};

/**
 * Generate entry code for check-in
 * In production: POST /entry-code
 */
export const generateEntryCode = async (
  ticketId: string,
  eventId: string,
  walletAddress: string
): Promise<EntryCode> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes expiry
  
  // Generate a unique code
  const code = `ENTRY-${eventId}-${ticketId}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  
  return {
    code,
    ticketId,
    eventId,
    walletAddress,
    generatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isUsed: false
  };
};

/**
 * Verify entry code at check-in
 * In production: POST /verify-entry
 */
export const verifyEntryCode = async (
  code: string
): Promise<{ valid: boolean; ticket?: OwnedTicket; error?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Parse the code
  if (!code.startsWith('ENTRY-')) {
    return { valid: false, error: 'Invalid code format' };
  }
  
  // Check if code is expired (simulated)
  const parts = code.split('-');
  if (parts.length < 4) {
    return { valid: false, error: 'Malformed code' };
  }
  
  const timestamp = parseInt(parts[3]);
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (now - timestamp > fiveMinutes) {
    return { valid: false, error: 'Code has expired' };
  }
  
  // In production, verify the wallet owns the ticket on blockchain
  return {
    valid: true,
    ticket: {
      id: 'verified-ticket',
      tokenId: parts[2],
      eventId: parts[1],
      eventName: 'Electric Dreams Festival 2026',
      eventDate: '2026-07-15',
      eventTime: '18:00',
      venue: 'Arena Națională, Bucharest',
      ticketType: 'VIP Experience',
      purchaseDate: '2026-01-10',
      purchasePrice: '1.2',
      isUsed: false,
      qrCode: code,
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
    }
  };
};

/**
 * Get tickets owned by wallet
 * In production: GET /accounts/{address}/nfts?collection=TICKET
 */
export const getOwnedTickets = async (walletAddress: string): Promise<OwnedTicket[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data - in production, query MultiversX API
  const { mockOwnedTickets } = await import('data/mockEvents');
  return mockOwnedTickets;
};

/**
 * Search events/tickets using elastic-like query
 * In production: POST /events/search
 */
export const searchEvents = async (query: {
  type?: 'event' | 'ticket' | 'resale';
  eventId?: string;
  walletAddress?: string;
  status?: string;
  limit?: number;
}) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In production, this would query the events/search endpoint
  const { mockEvents } = await import('data/mockEvents');
  
  if (query.eventId) {
    return mockEvents.filter(e => e.id === query.eventId);
  }
  
  return mockEvents.slice(0, query.limit || 10);
};

