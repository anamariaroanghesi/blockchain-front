import { useState } from 'react';
import { useGetIsLoggedIn, useGetAccountInfo } from 'hooks';
import { RouteNamesEnum } from 'localConstants';
import { Link, useNavigate } from 'react-router-dom';
import { useFestivalData, useTicketPrices } from 'hooks/festival/useFestivalContract';
import { useFestivalTransactions } from 'hooks/festival/useFestivalTransactions';
import { FESTIVAL_ID } from 'config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTicket,
  faCheckCircle,
  faSpinner,
  faWallet,
  faCalendar,
  faMapMarkerAlt,
  faUsers,
  faClock,
  faArrowLeft,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { formatDate, formatTime, getAvailabilityPercentage, isFestivalActive } from 'types/festival.types';

const AvailableTicketsPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = useGetIsLoggedIn();
  const { address } = useGetAccountInfo();
  const { festivalData, isLoading: festivalLoading } = useFestivalData();
  const { ticketPrices, isLoading: pricesLoading } = useTicketPrices();
  const { buyTicket } = useFestivalTransactions();
  
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handlePurchase = async (ticketIndex: number) => {
    if (!isLoggedIn) {
      navigate(RouteNamesEnum.unlock);
      return;
    }

    const ticket = ticketPrices[ticketIndex];
    if (!ticket) return;

    setIsPurchasing(true);
    setPurchaseError(null);
    setSelectedTicket(ticketIndex);

    try {
      await buyTicket(
        FESTIVAL_ID,
        ticket.name,
        ticket.priceDisplay,
        RouteNamesEnum.dashboard
      );
    } catch (error: any) {
      console.error('Purchase error:', error);
      setPurchaseError(error?.message || 'Failed to purchase ticket. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const isLoading = festivalLoading || pricesLoading;
  const availability = festivalData ? getAvailabilityPercentage(festivalData) : 100;
  const isSoldOut = availability <= 0;

  return (
    <div className="w-full min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to={RouteNamesEnum.home} 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Buy <span className="gradient-text">Tickets</span>
          </h1>
          <p className="text-white/60 text-lg">
            Choose your ticket type and join the festival experience
          </p>
        </div>

        {/* Festival Info Card */}
        {festivalData && (
          <div className="glass-card p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text mb-2">{festivalData.name}</h2>
                <div className="flex flex-wrap gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendar} className="text-purple-400" />
                    {formatDate(festivalData.startTime)}
                  </span>
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-pink-400" />
                    Blockchain Arena
                  </span>
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-cyan-400" />
                    {festivalData.soldTickets} / {festivalData.maxTickets} sold
                  </span>
                </div>
              </div>
              
              {/* Availability Bar */}
              <div className="w-full md:w-64">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Availability</span>
                  <span className={availability > 20 ? 'text-emerald-400' : 'text-orange-400'}>
                    {Math.round(availability)}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      availability > 50 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                      availability > 20 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${availability}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not Logged In Warning */}
        {!isLoggedIn && (
          <div className="glass-card p-4 mb-8 border-l-4 border-purple-500">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white mb-1">Connect Your Wallet</h3>
                <p className="text-white/60 text-sm">
                  You need to connect your MultiversX wallet to purchase tickets.{' '}
                  <Link to={RouteNamesEnum.unlock} className="text-purple-400 hover:text-purple-300">
                    Connect now →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {purchaseError && (
          <div className="glass-card p-4 mb-8 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-red-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white mb-1">Purchase Failed</h3>
                <p className="text-white/60 text-sm">{purchaseError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Types */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-400 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {ticketPrices.map((ticket, index) => (
              <div 
                key={index}
                className={`glass-card overflow-hidden transition-all duration-300 ${
                  index === 1 ? 'ring-2 ring-purple-500 scale-105' : ''
                } ${isSoldOut ? 'opacity-50' : ''}`}
              >
                {/* Popular Badge */}
                {index === 1 && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center text-sm font-bold py-2">
                    MOST POPULAR
                  </div>
                )}

                <div className="p-8">
                  {/* Ticket Name & Phase */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{ticket.name}</h3>
                    <span className="text-white/50 text-sm">{ticket.phase}</span>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="text-5xl font-bold gradient-text">
                      {ticket.priceDisplay}
                    </div>
                    <div className="text-white/50">EGLD</div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-white/80">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
                      Full Festival Access
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
                      NFT Ticket Collectible
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
                      Blockchain Verification
                    </li>
                    {index >= 1 && (
                      <li className="flex items-center gap-3 text-white/80">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
                        Priority Entry Lane
                      </li>
                    )}
                    {index === 2 && (
                      <>
                        <li className="flex items-center gap-3 text-white/80">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
                          Backstage Access
                        </li>
                        <li className="flex items-center gap-3 text-white/80">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
                          Meet & Greet
                        </li>
                      </>
                    )}
                  </ul>

                  {/* Buy Button */}
                  <button
                    onClick={() => handlePurchase(index)}
                    disabled={isPurchasing || isSoldOut}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      index === 1
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    } ${(isPurchasing || isSoldOut) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isPurchasing && selectedTicket === index ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        Processing...
                      </>
                    ) : isSoldOut ? (
                      'Sold Out'
                    ) : !isLoggedIn ? (
                      <>
                        <FontAwesomeIcon icon={faWallet} />
                        Connect Wallet
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faTicket} />
                        Buy Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faTicket} className="text-purple-400 text-xl" />
            </div>
            <h3 className="font-semibold mb-2">Instant Delivery</h3>
            <p className="text-white/50 text-sm">
              Your NFT ticket appears in your wallet immediately after purchase
            </p>
          </div>
          
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-pink-400 text-xl" />
            </div>
            <h3 className="font-semibold mb-2">Guaranteed Authentic</h3>
            <p className="text-white/50 text-sm">
              Every ticket is verified on the blockchain - no counterfeits possible
            </p>
          </div>
          
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faWallet} className="text-cyan-400 text-xl" />
            </div>
            <h3 className="font-semibold mb-2">Resale Available</h3>
            <p className="text-white/50 text-sm">
              Can't make it? Safely resell your ticket on our marketplace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableTicketsPage;
