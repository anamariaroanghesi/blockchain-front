import { Link } from 'react-router-dom';
import { useGetIsLoggedIn } from 'hooks';
import { RouteNamesEnum } from 'localConstants';
import { mockEvents, getCategoryIcon } from 'data/mockEvents';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldHalved, 
  faTicket, 
  faWallet, 
  faCheckCircle,
  faArrowRight,
  faQrcode,
  faGlobe,
  faLock
} from '@fortawesome/free-solid-svg-icons';

export const Home = () => {
  const isLoggedIn = useGetIsLoggedIn();
  const featuredEvents = mockEvents.filter(e => e.isFeatured).slice(0, 3);

  return (
    <div className="w-full">
      {/* Hero Section */}
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
              <span className="text-sm text-white/70">Powered by MultiversX Blockchain</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-slide-up animation-delay-200">
              <span className="text-white">NFT Ticket</span>
              <br />
              <span className="gradient-text">Master</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto animate-slide-up animation-delay-400">
              The future of event ticketing. Secure, transparent, and fraud-proof tickets 
              powered by blockchain technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-slide-up animation-delay-600">
              {isLoggedIn ? (
                <>
                  <Link to={RouteNamesEnum.tickets} className="btn-primary flex items-center gap-2 justify-center">
                    <FontAwesomeIcon icon={faTicket} />
                    Browse Events
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
                  <Link to={RouteNamesEnum.tickets} className="btn-secondary flex items-center gap-2 justify-center">
                    <FontAwesomeIcon icon={faTicket} />
                    Explore Events
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 animate-fade-in animation-delay-600">
              {[
                { value: '150K+', label: 'Tickets Sold' },
                { value: '500+', label: 'Events' },
                { value: '0%', label: 'Fraud Rate' },
                { value: '50K+', label: 'Users' }
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
                title: 'Easy Validation',
                description: 'Instant ticket verification through QR codes linked to blockchain',
                color: 'from-pink-500 to-rose-500'
              },
              {
                icon: faGlobe,
                title: 'Transparent',
                description: 'All transactions are public and verifiable on the blockchain',
                color: 'from-cyan-500 to-blue-500'
              },
              {
                icon: faLock,
                title: 'Secure Ownership',
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

      {/* Featured Events */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Featured <span className="gradient-text">Events</span>
              </h2>
              <p className="text-white/60">Don't miss out on the hottest upcoming events</p>
            </div>
            <Link 
              to={RouteNamesEnum.tickets} 
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All Events
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event, i) => (
              <Link 
                key={event.id}
                to={`${RouteNamesEnum.tickets}?event=${event.id}`}
                className="glass-card-hover overflow-hidden group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.imageUrl} 
                    alt={event.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="badge-primary">
                      {getCategoryIcon(event.category)} {event.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white line-clamp-1">{event.name}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                    <span>📍 {event.venue}, {event.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                    <span>📅 {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <div>
                      <span className="text-white/50 text-xs">Starting from</span>
                      <div className="text-lg font-bold text-white">
                        {Math.min(...event.ticketTypes.map(t => parseFloat(t.price)))} EGLD
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300 transition-colors">
                      <span className="text-sm font-medium">Get Tickets</span>
                      <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-dark-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-white/60 text-lg">Get started in just a few simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Wallet',
                description: 'Link your MultiversX wallet to get started'
              },
              {
                step: '02',
                title: 'Browse Events',
                description: 'Explore concerts, sports, festivals and more'
              },
              {
                step: '03',
                title: 'Buy NFT Tickets',
                description: 'Purchase tickets securely on the blockchain'
              },
              {
                step: '04',
                title: 'Attend & Enjoy',
                description: 'Show your QR code at the venue for instant entry'
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
                Ready to Experience the Future?
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of users already enjoying secure, transparent, 
                and fraud-proof event ticketing.
              </p>
              
              {isLoggedIn ? (
                <Link to={RouteNamesEnum.tickets} className="btn-accent inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faTicket} />
                  Browse Events Now
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              ) : (
                <Link to={RouteNamesEnum.unlock} className="btn-accent inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faWallet} />
                  Connect Your Wallet
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
