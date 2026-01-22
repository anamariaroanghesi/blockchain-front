import { Link } from 'react-router-dom';
import { useGetIsLoggedIn } from 'hooks';
import { RouteNamesEnum } from 'localConstants';
import { useFestivalData, useTicketPrices } from 'hooks/festival/useFestivalContract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldHalved, 
  faTicket, 
  faWallet, 
  faCheckCircle,
  faArrowRight,
  faQrcode,
  faGlobe,
  faLock,
  faCalendar,
  faUsers,
  faClock,
  faMusic
} from '@fortawesome/free-solid-svg-icons';
import { formatDate, getAvailabilityPercentage } from 'types/festival.types';

export const Home = () => {
  const isLoggedIn = useGetIsLoggedIn();
  const { festivalData, isLoading, error: festivalError } = useFestivalData();
  const { ticketPrices, error: pricesError } = useTicketPrices();

  // Get the lowest ticket price for display  
  const lowestPrice = ticketPrices.length > 0 
    ? Math.min(...ticketPrices.map(t => parseFloat(t.priceDisplay)))
    : 0;
  
  const contractNotConfigured = !isLoading && (!festivalData || ticketPrices.length === 0);

  return (
    <div className="w-full">
      {/* Contract Not Configured Warning */}
      {contractNotConfigured && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 py-3 px-6">
          <div className="max-w-6xl mx-auto flex items-center gap-3 text-yellow-300 text-sm">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            <span>
              <strong>Contract Setup Required:</strong> Festival data or ticket prices not configured. 
              <Link to={RouteNamesEnum.tickets} className="underline ml-1 hover:text-yellow-200">View details →</Link>
            </span>
          </div>
        </div>
      )}

      {/* Hero Section - Festival Focused */}
      <section className="hero-gradient relative overflow-hidden py-20 px-6">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-200" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-slide-up">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white/70">NFT Tickets on MultiversX Blockchain</span>
            </div>

            {/* Festival Name */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-slide-up animation-delay-200">
              <span className="gradient-text">
                {isLoading ? 'Loading...' : festivalData?.name || 'Festival'}
              </span>
            </h1>

            {/* Festival Details */}
            {festivalData && (
              <div className="flex flex-wrap justify-center gap-6 text-white/70 animate-slide-up animation-delay-300">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} className="text-purple-400" />
                  <span>{formatDate(festivalData.startTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-cyan-400" />
                  <span>{festivalData.maxTickets.toLocaleString()} Capacity</span>
                </div>
              </div>
            )}

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto animate-slide-up animation-delay-400">
              Secure your spot with blockchain-powered NFT tickets. 
              No counterfeits, no scalpers, just pure festival vibes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-slide-up animation-delay-600">
              {isLoggedIn ? (
                <>
                  <Link to={RouteNamesEnum.tickets} className="btn-primary flex items-center gap-2 justify-center">
                    <FontAwesomeIcon icon={faTicket} />
                    Buy Tickets
                    <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                  </Link>
                  <Link to={RouteNamesEnum.dashboard} className="btn-secondary flex items-center gap-2 justify-center">
                    <FontAwesomeIcon icon={faWallet} />
                    My Tickets
                  </Link>
                </>
              ) : (
                <>
                  <Link to={RouteNamesEnum.unlock} className="btn-primary flex items-center gap-2 justify-center">
                    <FontAwesomeIcon icon={faWallet} />
                    Connect Wallet
                    <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                  </Link>
                  <Link to={RouteNamesEnum.festival} className="btn-secondary flex items-center gap-2 justify-center">
                    <FontAwesomeIcon icon={faMusic} />
                    Festival Info
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 animate-fade-in animation-delay-600">
              {[
                { 
                  value: festivalData ? `${festivalData.soldTickets}` : '--', 
                  label: 'Tickets Sold' 
                },
                { 
                  value: festivalData ? `${festivalData.maxTickets - festivalData.soldTickets}` : '--', 
                  label: 'Available' 
                },
                { 
                  value: lowestPrice > 0 ? `${lowestPrice.toFixed(4)} EGLD` : '--', 
                  label: 'Starting Price' 
                },
                { 
                  value: festivalData ? `${Math.round(getAvailabilityPercentage(festivalData))}%` : '--', 
                  label: 'Availability' 
                }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-white/50 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ticket Types Preview */}
      <section className="py-24 px-6 bg-dark-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="gradient-text">Experience</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Select from different ticket tiers to match your festival experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ticketPrices.length > 0 ? ticketPrices.map((ticket, i) => (
              <div 
                key={i}
                className={`glass-card-hover p-8 text-center relative overflow-hidden ${i === 1 ? 'ring-2 ring-purple-500' : ''}`}
              >
                {i === 1 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{ticket.name}</h3>
                <p className="text-white/50 text-sm mb-4">{ticket.phase}</p>
                <div className="text-4xl font-bold gradient-text mb-6">
                  {ticket.priceDisplay} <span className="text-lg">EGLD</span>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-white/70">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
                    Festival Entry
                  </li>
                  <li className="flex items-center gap-2 text-white/70">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
                    NFT Collectible
                  </li>
                  {i >= 1 && (
                    <li className="flex items-center gap-2 text-white/70">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
                      Priority Entry
                    </li>
                  )}
                  {i === 2 && (
                    <li className="flex items-center gap-2 text-white/70">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
                      Backstage Access
                    </li>
                  )}
                </ul>
                <Link 
                  to={isLoggedIn ? RouteNamesEnum.tickets : RouteNamesEnum.unlock}
                  className={i === 1 ? "btn-primary w-full" : "btn-secondary w-full"}
                >
                  {isLoggedIn ? 'Buy Now' : 'Connect to Buy'}
                </Link>
              </div>
            )) : (
              // No ticket prices configured
              <div className="col-span-full">
                <div className="glass-card p-8 text-center border border-yellow-500/30">
                  <FontAwesomeIcon icon={faTicket} className="text-4xl text-yellow-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Ticket Prices Not Configured</h3>
                  <p className="text-white/60 mb-4">
                    The contract owner needs to add ticket prices.
                  </p>
                  <Link 
                    to={RouteNamesEnum.tickets}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    View Setup Instructions
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-hero-pattern">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why <span className="gradient-text">NFT Tickets</span>?
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Traditional ticketing is broken. Counterfeits, scalpers, and lack of transparency 
              hurt both fans and organizers. We're changing that.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: faShieldHalved,
                title: 'Fraud Proof',
                description: 'Every ticket is a unique NFT on the blockchain, impossible to counterfeit',
                color: 'from-purple-500 to-indigo-500'
              },
              {
                icon: faQrcode,
                title: 'Easy Check-In',
                description: 'Instant ticket verification through QR codes linked to blockchain',
                color: 'from-pink-500 to-rose-500'
              },
              {
                icon: faGlobe,
                title: 'Resale Market',
                description: 'Safely resell your tickets with built-in commission for organizers',
                color: 'from-cyan-500 to-blue-500'
              },
              {
                icon: faLock,
                title: 'Your Wallet',
                description: 'Your tickets are stored in your wallet, fully under your control',
                color: 'from-emerald-500 to-teal-500'
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="glass-card-hover p-6 text-center group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                  <FontAwesomeIcon icon={feature.icon} className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-white/60 text-lg">Get your ticket in just a few simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Wallet',
                description: 'Link your MultiversX wallet (xPortal, DeFi Wallet, etc.)'
              },
              {
                step: '02',
                title: 'Choose Ticket',
                description: 'Select your ticket type and complete the purchase'
              },
              {
                step: '03',
                title: 'Receive NFT',
                description: 'Your ticket NFT appears in your wallet instantly'
              },
              {
                step: '04',
                title: 'Check-In',
                description: 'Generate QR code at the venue for instant entry'
              }
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                {/* Step number */}
                <div className="text-6xl font-bold text-white/5 mb-4">{item.step}</div>
                
                {/* Icon circle */}
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.description}</p>

                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Don't Miss Out!
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                {festivalData 
                  ? `Only ${festivalData.maxTickets - festivalData.soldTickets} tickets remaining. Secure yours before they're gone!`
                  : 'Limited tickets available. Secure yours before they sell out!'}
              </p>
              
              {isLoggedIn ? (
                <Link to={RouteNamesEnum.tickets} className="btn-accent inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faTicket} />
                  Get Your Tickets Now
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              ) : (
                <Link to={RouteNamesEnum.unlock} className="btn-accent inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faWallet} />
                  Connect Wallet to Buy
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
