import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthRedirectWrapper } from 'wrappers';
import { mockEvents, getCategoryIcon, getCategoryColor } from 'data/mockEvents';
import { Event, EventCategory, TicketType } from 'types/ticket.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faCalendar,
  faMapMarkerAlt,
  faTicket,
  faArrowRight,
  faTimes,
  faChevronDown,
  faUsers,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { useGetIsLoggedIn, useGetAccountInfo } from 'hooks';
import { RouteNamesEnum } from 'localConstants';

const categories: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'concert', label: '🎵 Concerts' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'festival', label: '🎪 Festivals' },
  { value: 'theater', label: '🎭 Theater' },
  { value: 'conference', label: '💼 Conferences' },
  { value: 'comedy', label: '😂 Comedy' },
  { value: 'exhibition', label: '🖼️ Exhibitions' },
];

const EventCard = ({ event, onClick }: { event: Event; onClick: () => void }) => {
  const availabilityPercentage = (event.availableTickets / event.totalTickets) * 100;
  const isLowAvailability = availabilityPercentage < 20;
  
  return (
    <div 
      onClick={onClick}
      className="glass-card-hover overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className={`badge bg-gradient-to-r ${getCategoryColor(event.category)} text-white border-0`}>
            {getCategoryIcon(event.category)} {event.category}
          </span>
        </div>
        
        {/* Featured badge */}
        {event.isFeatured && (
          <div className="absolute top-4 right-4">
            <span className="badge bg-amber-500/90 text-white border-0">
              ⭐ Featured
            </span>
          </div>
        )}

        {/* Event name overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-lg">{event.name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location & Date */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-purple-400" />
            <span className="line-clamp-1">{event.venue}, {event.city}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <FontAwesomeIcon icon={faCalendar} className="text-pink-400" />
            <span>{new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })} • {event.time}</span>
          </div>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/50">
              <FontAwesomeIcon icon={faUsers} className="mr-1" />
              {event.availableTickets.toLocaleString()} tickets left
            </span>
            <span className={isLowAvailability ? 'text-red-400' : 'text-emerald-400'}>
              {availabilityPercentage.toFixed(0)}% available
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${isLowAvailability ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
              style={{ width: `${availabilityPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Price & CTA */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <div>
            <span className="text-white/50 text-xs">From</span>
            <div className="text-xl font-bold gradient-text">
              {Math.min(...event.ticketTypes.map(t => parseFloat(t.price)))} EGLD
            </div>
          </div>
          <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300 transition-colors">
            <span className="text-sm font-semibold">View Event</span>
            <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

const EventModal = ({ 
  event, 
  onClose, 
  onBuy 
}: { 
  event: Event; 
  onClose: () => void;
  onBuy: (ticketType: TicketType, quantity: number) => void;
}) => {
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const isLoggedIn = useGetIsLoggedIn();

  const totalPrice = selectedTicketType 
    ? (parseFloat(selectedTicketType.price) * quantity).toFixed(2) 
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card animate-slide-up">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* Header image */}
        <div className="relative h-64">
          <img 
            src={event.imageUrl} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-dark-800/50 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className={`badge bg-gradient-to-r ${getCategoryColor(event.category)} text-white border-0 mb-3`}>
              {getCategoryIcon(event.category)} {event.category}
            </span>
            <h2 className="text-3xl font-bold text-white">{event.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Event info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faCalendar} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-white/50 text-sm">Date & Time</div>
                  <div className="font-medium">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })} at {event.time}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-pink-400" />
                </div>
                <div>
                  <div className="text-white/50 text-sm">Location</div>
                  <div className="font-medium">{event.venue}</div>
                  <div className="text-white/60 text-sm">{event.city}, {event.country}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-white/50 text-sm mb-2">About this event</div>
              <p className="text-white/80 text-sm leading-relaxed">{event.description}</p>
            </div>
          </div>

          {/* Ticket types */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Select Tickets</h3>
            <div className="space-y-3">
              {event.ticketTypes.map((ticketType) => (
                <div
                  key={ticketType.id}
                  onClick={() => {
                    setSelectedTicketType(ticketType);
                    setQuantity(1);
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTicketType?.id === ticketType.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 hover:border-white/30 bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{ticketType.name}</h4>
                        {selectedTicketType?.id === ticketType.id && (
                          <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 text-sm">{ticketType.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold gradient-text">{ticketType.price} EGLD</div>
                      <div className={`text-xs ${ticketType.available < 100 ? 'text-red-400' : 'text-white/50'}`}>
                        {ticketType.available} available
                      </div>
                    </div>
                  </div>
                  
                  {/* Benefits */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {ticketType.benefits.map((benefit, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60">
                        ✓ {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity & Purchase */}
          {selectedTicketType && (
            <div className="border-t border-white/10 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-white/60">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedTicketType.maxPerUser, quantity + 1))}
                      className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-white/40 text-sm">
                    (max {selectedTicketType.maxPerUser})
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-white/50 text-sm">Total</div>
                    <div className="text-2xl font-bold gradient-text">{totalPrice} EGLD</div>
                  </div>
                  
                  {isLoggedIn ? (
                    <button
                      onClick={() => onBuy(selectedTicketType, quantity)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTicket} />
                      Buy Now
                    </button>
                  ) : (
                    <Link to={RouteNamesEnum.unlock} className="btn-primary flex items-center gap-2">
                      Connect to Buy
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AvailableTicketsPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const isLoggedIn = useGetIsLoggedIn();

  // Check if there's an event ID in the URL
  const eventIdFromUrl = searchParams.get('event');
  
  // Set selected event from URL on mount
  useState(() => {
    if (eventIdFromUrl) {
      const event = mockEvents.find(e => e.id === eventIdFromUrl);
      if (event) setSelectedEvent(event);
    }
  });

  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleBuyTicket = (ticketType: TicketType, quantity: number) => {
    console.log('Buying ticket:', { ticketType, quantity, event: selectedEvent });
    // Here you would integrate with the smart contract
    alert(`Transaction initiated!\n\nBuying ${quantity}x ${ticketType.name}\nTotal: ${(parseFloat(ticketType.price) * quantity).toFixed(2)} EGLD\n\nThis would trigger a blockchain transaction.`);
  };

  return (
    <AuthRedirectWrapper requireAuth={false}>
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover <span className="gradient-text">Events</span>
            </h1>
            <p className="text-white/60 text-lg">
              Find and purchase NFT tickets for the most exciting events
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="text"
                  placeholder="Search events, venues, cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-12"
                />
              </div>

              {/* Category dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  <FontAwesomeIcon icon={faFilter} />
                  {categories.find(c => c.value === selectedCategory)?.label || 'All Events'}
                  <FontAwesomeIcon icon={faChevronDown} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {showFilters && (
                  <div className="absolute top-full mt-2 right-0 w-48 glass-card p-2 z-20">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => {
                          setSelectedCategory(category.value);
                          setShowFilters(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.value
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active filters */}
            {(searchQuery || selectedCategory !== 'all') && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                {searchQuery && (
                  <span className="badge-primary flex items-center gap-2">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}>
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="badge-primary flex items-center gap-2">
                    {categories.find(c => c.value === selectedCategory)?.label}
                    <button onClick={() => setSelectedCategory('all')}>
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="mb-6 text-white/60">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-white/50">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Event Modal */}
        {selectedEvent && (
          <EventModal 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)}
            onBuy={handleBuyTicket}
          />
        )}
      </div>
    </AuthRedirectWrapper>
  );
};

export default AvailableTicketsPage;
