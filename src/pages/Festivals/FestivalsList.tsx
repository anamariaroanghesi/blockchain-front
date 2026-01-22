import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAllFestivals, useTicketPrices, useFestivalEvents } from 'hooks/festival/useFestivalContract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faUsers,
  faTicket,
  faSpinner,
  faMusic,
  faArrowRight,
  faMapMarkerAlt,
  faClock,
  faChevronDown,
  faChevronUp,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { formatDate, formatTime, getAvailabilityPercentage, isFestivalActive, weiToEgld, TicketPrice, FestivalEvent, FestivalData } from 'types/festival.types';
import { contractAddress, API_URL } from 'config';

// Component to show festival details (events + tickets)
const FestivalDetails = ({ festivalId }: { festivalId: number }) => {
  const { ticketPrices, isLoading: loadingPrices } = useTicketPrices(festivalId);
  const { events, isLoading: loadingEvents } = useFestivalEvents(festivalId);
  
  // Filter valid tickets
  const validTickets = ticketPrices.filter(t => t.saleStart && t.saleStart > 0);
  const lowestPrice = validTickets.length > 0 
    ? Math.min(...validTickets.map(t => parseFloat(t.priceDisplay)))
    : 0;

  if (loadingPrices || loadingEvents) {
    return (
      <div className="py-4 text-center text-white/50">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
        Loading details...
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 pt-4 mt-4">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Events */}
        <div>
          <h4 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faMusic} className="text-purple-400" />
            Events ({events.length})
          </h4>
          {events.length === 0 ? (
            <p className="text-white/40 text-sm">No events scheduled yet</p>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 3).map((event, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <div>
                    <span className="text-white">{event.name}</span>
                    <span className="text-white/40 ml-2">@ {event.location}</span>
                  </div>
                </div>
              ))}
              {events.length > 3 && (
                <p className="text-white/40 text-xs">+{events.length - 3} more events</p>
              )}
            </div>
          )}
        </div>

        {/* Ticket Prices */}
        <div>
          <h4 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faTicket} className="text-pink-400" />
            Tickets ({validTickets.length} types)
          </h4>
          {validTickets.length === 0 ? (
            <p className="text-white/40 text-sm">No tickets available yet</p>
          ) : (
            <div className="space-y-2">
              {validTickets.slice(0, 3).map((ticket, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white">{ticket.name}</span>
                  <span className="text-emerald-400 font-semibold">{ticket.priceDisplay} EGLD</span>
                </div>
              ))}
              {validTickets.length > 3 && (
                <p className="text-white/40 text-xs">+{validTickets.length - 3} more ticket types</p>
              )}
              {lowestPrice > 0 && (
                <p className="text-xs text-white/50 mt-2">
                  Starting from <span className="text-emerald-400 font-semibold">{lowestPrice.toFixed(4)} EGLD</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Festival Card Component
const FestivalCard = ({ festival }: { festival: FestivalData }) => {
  const [expanded, setExpanded] = useState(false);
  
  const availability = getAvailabilityPercentage(festival);
  const isActive = isFestivalActive(festival);
  const isSoldOut = availability <= 0;
  const ticketsRemaining = festival.maxTickets - festival.soldTickets;

  return (
    <div className="glass-card overflow-hidden">
      {/* Main Row - Always Visible */}
      <div 
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Left: Status + Info */}
        <div className="flex items-center gap-5">
          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
            isSoldOut 
              ? 'bg-red-500'
              : isActive 
                ? 'bg-emerald-500'
                : 'bg-purple-500'
          }`}>
            {isSoldOut ? 'SOLD OUT' : isActive ? 'LIVE' : 'UPCOMING'}
          </div>

          {/* Festival Info */}
          <div>
            <h3 className="text-xl font-bold text-white">
              {festival.name}
            </h3>
            <div className="flex items-center gap-4 text-white/60 text-sm mt-1">
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faCalendar} className="text-purple-400" />
                {formatDate(festival.startTime)}
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faUsers} className="text-cyan-400" />
                {festival.maxTickets.toLocaleString()} capacity
              </span>
            </div>
          </div>
        </div>

        {/* Right: Tickets + Expand */}
        <div className="flex items-center gap-6">
          {/* Tickets Info */}
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {ticketsRemaining.toLocaleString()} <span className="text-white/50 text-sm font-normal">left</span>
            </div>
            <div className="text-xs text-white/50">
              {festival.soldTickets.toLocaleString()} sold
            </div>
          </div>

          {/* Expand Arrow */}
          <FontAwesomeIcon 
            icon={expanded ? faChevronUp : faChevronDown} 
            className="text-white/50" 
          />
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 pb-5">
          <FestivalDetails festivalId={festival.id} />
          
          {/* Action Button */}
          <div className="mt-4">
            <Link 
              to={`/festival/${festival.id}`}
              className="btn-primary w-full text-center py-3 block"
            >
              View Festival Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export const FestivalsList = () => {
  const { festivals, isLoading, error } = useAllFestivals();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-400 animate-spin mb-4" />
          <div className="text-white/50">Loading festivals...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm mb-6">
            <FontAwesomeIcon icon={faMusic} />
            <span>All Festivals</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="gradient-text">Festival</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Browse all available festivals and get your NFT tickets
          </p>
        </div>

        {/* Festivals List */}
        {festivals.length === 0 ? (
          <div className="text-center py-12 glass-card">
            <FontAwesomeIcon icon={faTicket} className="text-5xl text-white/30 mb-4" />
            <h3 className="text-xl font-semibold text-white/70 mb-2">No Festivals Available</h3>
            <p className="text-white/50">Check back later for upcoming events.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {festivals.map((festival) => (
              <FestivalCard key={festival.id} festival={festival} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FestivalsList;

