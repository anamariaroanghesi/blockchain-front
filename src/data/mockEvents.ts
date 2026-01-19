import { Event, OwnedTicket } from 'types/ticket.types';

export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Electric Dreams Festival 2026',
    description: 'The ultimate electronic music experience featuring world-renowned DJs and immersive visual installations. Join us for three days of non-stop music, art, and community in the heart of Bucharest.',
    date: '2026-07-15',
    time: '18:00',
    venue: 'Arena Națională',
    city: 'Bucharest',
    country: 'Romania',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    category: 'festival',
    organizer: 'Dream Events SRL',
    totalTickets: 50000,
    availableTickets: 35420,
    isFeatured: true,
    ticketTypes: [
      {
        id: '1-ga',
        name: 'General Admission',
        description: 'Access to all main stages and general areas',
        price: '0.5',
        maxPerUser: 4,
        available: 25000,
        benefits: ['Access to all main stages', 'Food court access', 'Free parking']
      },
      {
        id: '1-vip',
        name: 'VIP Experience',
        description: 'Premium viewing areas and exclusive amenities',
        price: '1.2',
        maxPerUser: 2,
        available: 8000,
        benefits: ['Premium viewing platforms', 'VIP lounge access', 'Complimentary drinks', 'Meet & Greet opportunities', 'Express entry']
      },
      {
        id: '1-backstage',
        name: 'Backstage Pass',
        description: 'Ultimate experience with artist access',
        price: '3.0',
        maxPerUser: 1,
        available: 500,
        benefits: ['All VIP benefits', 'Backstage access', 'Artist meet & greet', 'Exclusive merchandise', 'Private bar']
      }
    ]
  },
  {
    id: '2',
    name: 'Champions League Final',
    description: 'Witness the pinnacle of European club football as the two best teams compete for the ultimate prize. An unforgettable night of world-class football.',
    date: '2026-05-29',
    time: '21:00',
    venue: 'Wembley Stadium',
    city: 'London',
    country: 'United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
    category: 'sports',
    organizer: 'UEFA',
    totalTickets: 90000,
    availableTickets: 12500,
    isFeatured: true,
    ticketTypes: [
      {
        id: '2-cat3',
        name: 'Category 3',
        description: 'Upper tier seating with great views',
        price: '0.8',
        maxPerUser: 4,
        available: 8000,
        benefits: ['Upper tier seating', 'Stadium access 2h before']
      },
      {
        id: '2-cat2',
        name: 'Category 2',
        description: 'Middle tier premium seating',
        price: '1.5',
        maxPerUser: 4,
        available: 3500,
        benefits: ['Middle tier seating', 'Stadium access 3h before', 'Official program']
      },
      {
        id: '2-cat1',
        name: 'Category 1',
        description: 'Best seats in the house',
        price: '2.5',
        maxPerUser: 2,
        available: 1000,
        benefits: ['Prime sideline seating', 'Hospitality lounge', 'Premium catering', 'Stadium tour']
      }
    ]
  },
  {
    id: '3',
    name: 'Taylor Swift - The Eras Tour',
    description: 'Experience the magic of Taylor Swift live as she performs hits spanning her entire legendary career. A spectacular show with stunning visuals and unforgettable moments.',
    date: '2026-06-20',
    time: '19:30',
    venue: 'Johan Cruijff Arena',
    city: 'Amsterdam',
    country: 'Netherlands',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    category: 'concert',
    organizer: 'Live Nation',
    totalTickets: 55000,
    availableTickets: 2340,
    isFeatured: true,
    ticketTypes: [
      {
        id: '3-standing',
        name: 'Standing',
        description: 'General admission standing area',
        price: '0.6',
        maxPerUser: 4,
        available: 1500,
        benefits: ['Floor standing access', 'Early entry draw eligible']
      },
      {
        id: '3-seated',
        name: 'Reserved Seating',
        description: 'Comfortable seated experience',
        price: '0.9',
        maxPerUser: 6,
        available: 800,
        benefits: ['Reserved seat', 'Cup holder', 'Stadium access 1h before']
      },
      {
        id: '3-vip',
        name: 'Lover Lounge VIP',
        description: 'The ultimate Swiftie experience',
        price: '2.0',
        maxPerUser: 2,
        available: 40,
        benefits: ['Premium pit access', 'Exclusive merchandise pack', 'VIP lounge', 'Signed poster', 'Early entry']
      }
    ]
  },
  {
    id: '4',
    name: 'Blockchain Summit Europe 2026',
    description: 'The premier blockchain and Web3 conference bringing together industry leaders, developers, and innovators. Three days of workshops, keynotes, and networking.',
    date: '2026-09-10',
    time: '09:00',
    venue: 'RAI Convention Centre',
    city: 'Amsterdam',
    country: 'Netherlands',
    imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=800',
    category: 'conference',
    organizer: 'Web3 Foundation',
    totalTickets: 5000,
    availableTickets: 2890,
    ticketTypes: [
      {
        id: '4-standard',
        name: 'Standard Pass',
        description: 'Full conference access',
        price: '0.3',
        maxPerUser: 5,
        available: 2000,
        benefits: ['All keynotes access', 'Workshop participation', 'Lunch included', 'Digital materials']
      },
      {
        id: '4-developer',
        name: 'Developer Pass',
        description: 'Enhanced for builders',
        price: '0.5',
        maxPerUser: 3,
        available: 700,
        benefits: ['All Standard benefits', 'Hackathon access', 'Developer workshops', 'Code review sessions']
      },
      {
        id: '4-executive',
        name: 'Executive Pass',
        description: 'Premium networking experience',
        price: '1.0',
        maxPerUser: 2,
        available: 190,
        benefits: ['All Developer benefits', 'Executive lounge', 'Private meetings', 'Gala dinner', 'Airport transfer']
      }
    ]
  },
  {
    id: '5',
    name: 'Hamilton - The Musical',
    description: 'The revolutionary musical that took the world by storm. Experience the story of Alexander Hamilton like never before with award-winning performances.',
    date: '2026-04-15',
    time: '19:30',
    venue: 'West End Theatre',
    city: 'London',
    country: 'United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    category: 'theater',
    organizer: 'Cameron Mackintosh Ltd',
    totalTickets: 1200,
    availableTickets: 145,
    ticketTypes: [
      {
        id: '5-balcony',
        name: 'Balcony',
        description: 'Elevated view of the stage',
        price: '0.4',
        maxPerUser: 4,
        available: 80,
        benefits: ['Balcony seating', 'Program booklet']
      },
      {
        id: '5-stalls',
        name: 'Stalls',
        description: 'Ground floor premium seating',
        price: '0.7',
        maxPerUser: 4,
        available: 50,
        benefits: ['Stalls seating', 'Program booklet', 'Interval drinks']
      },
      {
        id: '5-premium',
        name: 'Premium Orchestra',
        description: 'The best seats in theater',
        price: '1.2',
        maxPerUser: 2,
        available: 15,
        benefits: ['Front orchestra seating', 'Cast meet & greet', 'Backstage tour', 'Signed playbill']
      }
    ]
  },
  {
    id: '6',
    name: 'Dave Chappelle - Live Comedy',
    description: 'Comedy legend Dave Chappelle brings his unfiltered, thought-provoking standup to Europe. An intimate evening of laughter and social commentary.',
    date: '2026-03-22',
    time: '20:00',
    venue: 'Ziggo Dome',
    city: 'Amsterdam',
    country: 'Netherlands',
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800',
    category: 'comedy',
    organizer: 'Mojo Concerts',
    totalTickets: 17000,
    availableTickets: 4200,
    ticketTypes: [
      {
        id: '6-standard',
        name: 'Standard',
        description: 'Great seats for great laughs',
        price: '0.35',
        maxPerUser: 4,
        available: 3500,
        benefits: ['Reserved seating', 'Full bar access']
      },
      {
        id: '6-front',
        name: 'Front Section',
        description: 'Up close and personal',
        price: '0.6',
        maxPerUser: 2,
        available: 700,
        benefits: ['Front section seating', 'Meet & greet opportunity', 'Signed merchandise']
      }
    ]
  }
];

export const mockOwnedTickets: OwnedTicket[] = [
  {
    id: 'owned-1',
    tokenId: 'TICKET-a1b2c3-01',
    eventId: '1',
    eventName: 'Electric Dreams Festival 2026',
    eventDate: '2026-07-15',
    eventTime: '18:00',
    venue: 'Arena Națională, Bucharest',
    ticketType: 'VIP Experience',
    purchaseDate: '2026-01-10',
    purchasePrice: '1.2',
    isUsed: false,
    qrCode: 'QR_ELECTRIC_DREAMS_VIP_001',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    seatInfo: 'VIP Section A'
  },
  {
    id: 'owned-2',
    tokenId: 'TICKET-d4e5f6-02',
    eventId: '4',
    eventName: 'Blockchain Summit Europe 2026',
    eventDate: '2026-09-10',
    eventTime: '09:00',
    venue: 'RAI Convention Centre, Amsterdam',
    ticketType: 'Developer Pass',
    purchaseDate: '2026-01-15',
    purchasePrice: '0.5',
    isUsed: false,
    qrCode: 'QR_BLOCKCHAIN_SUMMIT_DEV_042',
    imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=800'
  },
  {
    id: 'owned-3',
    tokenId: 'TICKET-g7h8i9-03',
    eventId: '5',
    eventName: 'Hamilton - The Musical',
    eventDate: '2026-04-15',
    eventTime: '19:30',
    venue: 'West End Theatre, London',
    ticketType: 'Stalls',
    purchaseDate: '2025-12-20',
    purchasePrice: '0.7',
    isUsed: true,
    qrCode: 'QR_HAMILTON_STALLS_089',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    seatInfo: 'Row G, Seat 14'
  }
];

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    concert: '🎵',
    sports: '⚽',
    theater: '🎭',
    conference: '💼',
    festival: '🎪',
    exhibition: '🖼️',
    comedy: '😂',
    other: '🎫'
  };
  return icons[category] || '🎫';
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    concert: 'from-purple-500 to-pink-500',
    sports: 'from-green-500 to-emerald-500',
    theater: 'from-red-500 to-orange-500',
    conference: 'from-blue-500 to-cyan-500',
    festival: 'from-yellow-500 to-orange-500',
    exhibition: 'from-indigo-500 to-purple-500',
    comedy: 'from-pink-500 to-rose-500',
    other: 'from-gray-500 to-slate-500'
  };
  return colors[category] || 'from-gray-500 to-slate-500';
};

