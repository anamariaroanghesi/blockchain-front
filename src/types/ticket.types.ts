export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  country: string;
  imageUrl: string;
  category: EventCategory;
  organizer: string;
  totalTickets: number;
  availableTickets: number;
  ticketTypes: TicketType[];
  isFeatured?: boolean;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: string; // in EGLD
  maxPerUser: number;
  available: number;
  benefits: string[];
}

export interface OwnedTicket {
  id: string;
  tokenId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketType: string;
  purchaseDate: string;
  purchasePrice: string;
  isUsed: boolean;
  qrCode: string;
  imageUrl: string;
  seatInfo?: string;
}

export interface TicketValidation {
  ticketId: string;
  isValid: boolean;
  eventName: string;
  ticketType: string;
  ownerAddress: string;
  validationTime?: string;
  errorMessage?: string;
}

export type EventCategory = 
  | 'concert'
  | 'sports'
  | 'theater'
  | 'conference'
  | 'festival'
  | 'exhibition'
  | 'comedy'
  | 'other';

export interface PurchaseTransaction {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  totalPrice: string;
  buyerAddress: string;
  transactionHash?: string;
  status: 'pending' | 'success' | 'failed';
}

