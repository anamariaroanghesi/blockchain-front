import { Link } from 'react-router-dom';
import { useGetIsLoggedIn } from 'hooks';
import { 
  useFestivalData, 
  useTicketPrices, 
  useFestivalEvents 
} from 'hooks/festival';
import { RouteNamesEnum } from 'localConstants';
import { 
  formatDate, 
  formatTime, 
  getAvailabilityPercentage,
  isFestivalActive,
  isTicketsSoldOut
} from 'types/festival.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faMapMarkerAlt,
  faTicket,
  faArrowRight,
  faMusic,
  faClock,
  faUsers,
  faInfoCircle,
  faShieldHalved,
  faQrcode,
  faExchangeAlt,
  faWallet,
  faSpinner,
  faBolt
} from '@fortawesome/free-solid-svg-icons';
import { FESTIVAL_ID } from 'config';

export const FestivalInfo = () => {
  const isLoggedIn = useGetIsLoggedIn();
  const { festivalData, isLoading: loadingFestival } = useFestivalData(FESTIVAL_ID);
  const { ticketPrices, isLoading: loadingPrices } = useTicketPrices(FESTIVAL_ID);
  const { events, isLoading: loadingEvents } = useFestivalEvents(FESTIVAL_ID);

  const isLoading = loadingFestival || loadingPrices || loadingEvents;

  if (isLoading || !festivalData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-400 animate-spin mb-4" />
          <div className="text-white/50">Loading festival info from blockchain...</div>
        </div>
      </div>
    );
  }

  const lowestPrice = ticketPrices.length > 0 
    ? Math.min(...ticketPrices.map(t => parseFloat(t.priceDisplay)))
    : 0;
  
  const availability = getAvailabilityPercentage(festivalData);
  const ticketsRemaining = festivalData.maxTickets - festivalData.soldTickets;
  const isActive = isFestivalActive(festivalData);
  const isSoldOut = isTicketsSoldOut(festivalData);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920" 
            alt={festivalData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-dark-950/30" />
        </div>
        
        <div className="relative h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-16">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="badge-primary inline-flex items-center gap-2">
                <FontAwesomeIcon icon={faMusic} />
                FESTIVAL
              </span>
              {isActive && (
                <span className="badge bg-emerald-500/20 text-emerald-300 border-emerald-500/30 inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faBolt} />
                  LIVE NOW
                </span>
              )}
              {isSoldOut && (
                <span className="badge bg-red-500/20 text-red-300 border-red-500/30">
                  SOLD OUT
                </span>
              )}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
              {festivalData.name}
            </h1>
            
            <div className="flex flex-wrap gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendar} className="text-purple-400" />
                <span>{formatDate(festivalData.startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-pink-400" />
                <span>Gates open at {formatTime(festivalData.startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-400" />
                <span>Main Arena, MultiversX City</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              {!isSoldOut && (
                <Link 
                  to={RouteNamesEnum.tickets}
                  className="btn-primary flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTicket} />
                  Buy Tickets from {lowestPrice.toFixed(4)} EGLD
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              )}
              <Link 
                to={RouteNamesEnum.resale}
                className="btn-secondary flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faExchangeAlt} />
                Resale Marketplace
              </Link>
              {isLoggedIn && (
                <Link 
                  to={RouteNamesEnum.checkin}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faQrcode} />
                  My Ticket / Check-in
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats from Smart Contract */}
      <section className="py-8 px-6 bg-dark-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-card p-4 text-center">
              <FontAwesomeIcon icon={faUsers} className="text-purple-400 text-xl mb-2" />
              <div className="text-2xl font-bold">{festivalData.maxTickets.toLocaleString()}</div>
              <div className="text-white/50 text-sm">Total Capacity</div>
            </div>
            <div className="glass-card p-4 text-center">
              <FontAwesomeIcon icon={faTicket} className="text-pink-400 text-xl mb-2" />
              <div className="text-2xl font-bold">{ticketsRemaining.toLocaleString()}</div>
              <div className="text-white/50 text-sm">Available</div>
            </div>
            <div className="glass-card p-4 text-center">
              <FontAwesomeIcon icon={faTicket} className="text-amber-400 text-xl mb-2" />
              <div className="text-2xl font-bold">{festivalData.soldTickets.toLocaleString()}</div>
              <div className="text-white/50 text-sm">Tickets Sold</div>
            </div>
            <div className="glass-card p-4 text-center">
              <FontAwesomeIcon icon={faUsers} className="text-emerald-400 text-xl mb-2" />
              <div className="text-2xl font-bold">{festivalData.insideCount.toLocaleString()}</div>
              <div className="text-white/50 text-sm">Currently Inside</div>
            </div>
            <div className="glass-card p-4 text-center">
              <FontAwesomeIcon icon={faWallet} className="text-blue-400 text-xl mb-2" />
              <div className="text-2xl font-bold">{lowestPrice.toFixed(4)}</div>
              <div className="text-white/50 text-sm">Starting Price (EGLD)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Bar */}
      <section className="py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">Ticket Availability</span>
              <span className={`font-semibold ${availability < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                {availability.toFixed(0)}% available ({ticketsRemaining.toLocaleString()} tickets)
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  availability < 20 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
                style={{ width: `${availability}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                About the <span className="gradient-text">Festival</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Experience the future of entertainment at {festivalData.name}. 
                This groundbreaking event combines world-class performances, 
                cutting-edge technology, and blockchain-powered ticketing.
              </p>
              <p className="text-white/70 leading-relaxed">
                Join us for an unforgettable experience featuring world-class performances, 
                immersive art installations, and a community of music lovers from around the globe. 
                All tickets are secured as NFTs on the MultiversX blockchain, ensuring authenticity 
                and preventing fraud.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Event Details</h3>
              
              <div className="glass-card p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faCalendar} className="text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold">Date & Time</div>
                  <div className="text-white/60">{formatDate(festivalData.startTime)}</div>
                  <div className="text-white/60">
                    {formatTime(festivalData.startTime)} - {formatTime(festivalData.endTime)}
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-pink-400" />
                </div>
                <div>
                  <div className="font-semibold">Location</div>
                  <div className="text-white/60">Main Arena</div>
                  <div className="text-white/60">MultiversX City, Blockchain District</div>
                </div>
              </div>
              
              <div className="glass-card p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold">NFT Tickets</div>
                  <div className="text-white/60">
                    All tickets are minted as NFTs on MultiversX blockchain, 
                    ensuring authenticity and secure ownership.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticket Types from Smart Contract */}
      <section className="py-16 px-6 bg-dark-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">
            Ticket <span className="gradient-text">Options</span>
          </h2>
          <p className="text-white/50 text-center mb-8">
            Prices fetched live from the smart contract
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {ticketPrices.map((ticket, i) => (
              <div 
                key={ticket.name}
                className={`glass-card p-6 relative ${i === 1 ? 'md:scale-105 border-purple-500/50' : ''}`}
              >
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs font-bold uppercase bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-2">{ticket.name}</h3>
                <p className="text-white/50 text-sm mb-2">Phase: {ticket.phase}</p>
                
                <div className="text-3xl font-bold gradient-text mb-4">
                  {ticket.priceDisplay} EGLD
                </div>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-emerald-400">✓</span>
                    Full festival access
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-emerald-400">✓</span>
                    NFT collectible ticket
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-emerald-400">✓</span>
                    Resale enabled
                  </li>
                  {i >= 1 && (
                    <li className="flex items-center gap-2 text-sm text-white/70">
                      <span className="text-emerald-400">✓</span>
                      Priority entry
                    </li>
                  )}
                  {i === 2 && (
                    <li className="flex items-center gap-2 text-sm text-white/70">
                      <span className="text-emerald-400">✓</span>
                      Backstage access
                    </li>
                  )}
                </ul>
                
                <Link 
                  to={`${RouteNamesEnum.tickets}?type=${encodeURIComponent(ticket.name)}`}
                  className={`w-full py-3 rounded-xl font-semibold text-center block ${
                    i === 1 ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  Select {ticket.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Schedule from Smart Contract */}
      {events.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Event <span className="gradient-text">Schedule</span>
            </h2>
            
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="glass-card p-6 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faMusic} className="text-2xl text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{event.name}</h3>
                    <p className="text-white/60">{event.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-400 font-semibold">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </div>
                    <div className="text-white/50 text-sm">
                      {formatDate(event.startTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-6 bg-dark-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't Miss Out!
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Secure your spot at {festivalData.name}. Only {ticketsRemaining.toLocaleString()} tickets remaining.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isSoldOut && (
              <Link 
                to={RouteNamesEnum.tickets}
                className="btn-accent flex items-center gap-2 justify-center"
              >
                <FontAwesomeIcon icon={faTicket} />
                Buy Tickets Now
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            )}
            <Link 
              to={RouteNamesEnum.resale}
              className="btn-secondary flex items-center gap-2 justify-center"
            >
              <FontAwesomeIcon icon={faExchangeAlt} />
              Check Resale Market
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FestivalInfo;
