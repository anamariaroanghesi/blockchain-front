import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetIsLoggedIn } from 'hooks';
import { RouteNamesEnum } from 'localConstants';
import { mockEvents } from 'data/mockEvents';
import { Event } from 'types/ticket.types';
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
  faWallet
} from '@fortawesome/free-solid-svg-icons';

// Use the first featured event as the main festival
const FESTIVAL_ID = '1';

export const FestivalInfo = () => {
  const isLoggedIn = useGetIsLoggedIn();
  const [festival, setFestival] = useState<Event | null>(null);

  useEffect(() => {
    const event = mockEvents.find(e => e.id === FESTIVAL_ID);
    setFestival(event || null);
  }, []);

  if (!festival) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50">Loading festival info...</div>
      </div>
    );
  }

  const lowestPrice = Math.min(...festival.ticketTypes.map(t => parseFloat(t.price)));

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={festival.imageUrl} 
            alt={festival.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-dark-950/30" />
        </div>
        
        <div className="relative h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-16">
          <div className="space-y-4">
            <span className="badge-primary inline-flex items-center gap-2">
              <FontAwesomeIcon icon={faMusic} />
              {festival.category.toUpperCase()}
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
              {festival.name}
            </h1>
            
            <div className="flex flex-wrap gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendar} className="text-purple-400" />
                <span>{new Date(festival.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-pink-400" />
                <span>Gates open at {festival.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-400" />
                <span>{festival.venue}, {festival.city}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                to={`${RouteNamesEnum.tickets}?event=${festival.id}`}
                className="btn-primary flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTicket} />
                Buy Tickets from {lowestPrice} EGLD
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
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

      {/* Quick Stats */}
      <section className="py-8 px-6 bg-dark-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Capacity', value: festival.totalTickets.toLocaleString(), icon: faUsers },
              { label: 'Available', value: festival.availableTickets.toLocaleString(), icon: faTicket },
              { label: 'Ticket Types', value: festival.ticketTypes.length.toString(), icon: faInfoCircle },
              { label: 'Starting Price', value: `${lowestPrice} EGLD`, icon: faWallet }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <FontAwesomeIcon icon={stat.icon} className="text-purple-400 text-xl mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </div>
            ))}
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
                {festival.description}
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
                  <div className="text-white/60">
                    {new Date(festival.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-white/60">Gates open at {festival.time}</div>
                </div>
              </div>
              
              <div className="glass-card p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-pink-400" />
                </div>
                <div>
                  <div className="font-semibold">Location</div>
                  <div className="text-white/60">{festival.venue}</div>
                  <div className="text-white/60">{festival.city}, {festival.country}</div>
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

      {/* Ticket Types */}
      <section className="py-16 px-6 bg-dark-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Ticket <span className="gradient-text">Options</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {festival.ticketTypes.map((ticket, i) => (
              <div 
                key={ticket.id}
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
                <p className="text-white/50 text-sm mb-4">{ticket.description}</p>
                
                <div className="text-3xl font-bold gradient-text mb-4">
                  {ticket.price} EGLD
                </div>
                
                <ul className="space-y-2 mb-6">
                  {ticket.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-white/70">
                      <span className="text-emerald-400">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs text-white/40 mb-4">
                  {ticket.available} tickets remaining
                </div>
                
                <Link 
                  to={`${RouteNamesEnum.tickets}?event=${festival.id}&type=${ticket.id}`}
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

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't Miss Out!
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Secure your spot at {festival.name}. Limited tickets available.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to={`${RouteNamesEnum.tickets}?event=${festival.id}`}
              className="btn-accent flex items-center gap-2 justify-center"
            >
              <FontAwesomeIcon icon={faTicket} />
              Buy Tickets Now
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
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

