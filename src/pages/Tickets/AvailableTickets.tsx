import { useState } from 'react';
import { useGetIsLoggedIn, useGetAccountInfo } from 'hooks';
import { RouteNamesEnum } from 'localConstants';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  faUsers,
  faClock,
  faArrowLeft,
  faInfoCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { formatDate, formatTime, getAvailabilityPercentage, isFestivalActive, TicketPrice } from 'types/festival.types';

// Helper to check if ticket is currently on sale
const isTicketOnSale = (ticket: TicketPrice): boolean => {
  const now = Math.floor(Date.now() / 1000);
  if (ticket.saleStart && now < ticket.saleStart) return false;
  if (ticket.saleEnd && now > ticket.saleEnd) return false;
  return true;
};

// Helper to get sale status
const getSaleStatus = (ticket: TicketPrice): 'upcoming' | 'active' | 'ended' => {
  const now = Math.floor(Date.now() / 1000);
  if (ticket.saleStart && now < ticket.saleStart) return 'upcoming';
  if (ticket.saleEnd && now > ticket.saleEnd) return 'ended';
  return 'active';
};

// Helper to get features based on ticket type
const getTicketFeatures = (ticket: TicketPrice): string[] => {
  const baseFeatures = [
    'NFT Ticket Collectible',
    'Blockchain Verification',
    'Transferable & Resellable'
  ];
  
  // Type 0 = Full Pass, Type 1 = Day Pass
  if (ticket.ticketType === 0) {
    return [
      'Full Festival Access (All Days)',
      ...baseFeatures
    ];
  } else if (ticket.ticketType === 1) {
    return [
      'Single Day Access',
      ...baseFeatures
    ];
  }
  
  return ['Festival Access', ...baseFeatures];
};

const AvailableTicketsPage = () => {
  const { id } = useParams<{ id: string }>();
  const festivalId = id ? parseInt(id, 10) : FESTIVAL_ID;
  
  const navigate = useNavigate();
  const isLoggedIn = useGetIsLoggedIn();
  const { address } = useGetAccountInfo();
  const { festivalData, isLoading: festivalLoading, error: festivalError } = useFestivalData(festivalId);
  const { ticketPrices: rawTicketPrices, isLoading: pricesLoading, error: pricesError } = useTicketPrices(festivalId);
  const { buyTicket } = useFestivalTransactions();
  
  // Filter out tickets with invalid/missing sale period data (saleStart or saleEnd is 0)
  const ticketPrices = rawTicketPrices.filter(ticket => 
    ticket.saleStart && ticket.saleStart > 0 && 
    ticket.saleEnd && ticket.saleEnd > 0
  );
  
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  
  const noTicketsAvailable = !pricesLoading && ticketPrices.length === 0;
  const noFestivalData = !festivalLoading && !festivalData;

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
        festivalId,
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

        {/* Contract Setup Warning */}
        {(noFestivalData || noTicketsAvailable) && !isLoading && (
          <div className="glass-card p-8 mb-8 border-l-4 border-yellow-500">
            <div className="flex items-start gap-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 text-2xl mt-1" />
              <div>
                <h3 className="font-bold text-white text-xl mb-2">Smart Contract Not Configured</h3>
                <p className="text-white/70 mb-4">
                  The festival smart contract needs to be set up by the owner. The following actions are required:
                </p>
                <ul className="text-white/60 text-sm space-y-2 mb-4">
                  {noFestivalData && (
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      <code className="bg-white/10 px-2 py-0.5 rounded">addFestival(name, start_time, end_time, max_tickets, tax_normal, tax_sold_out)</code>
                    </li>
                  )}
                  {noTicketsAvailable && (
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      <code className="bg-white/10 px-2 py-0.5 rounded">addTicketPrice(festival_id, name, phase, price)</code>
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <code className="bg-white/10 px-2 py-0.5 rounded">setTicketTokenIdentifier(token_identifier)</code>
                  </li>
                </ul>
                <p className="text-white/50 text-sm">
                  Use the MultiversX Explorer to call these functions on the contract.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Types */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-400 animate-spin" />
          </div>
        ) : ticketPrices.length === 0 ? (
          <div className="text-center py-12 glass-card">
            <FontAwesomeIcon icon={faTicket} className="text-5xl text-white/30 mb-4" />
            <h3 className="text-xl font-semibold text-white/70 mb-2">No Ticket Prices Available</h3>
            <p className="text-white/50">
              Ticket prices haven't been configured in the smart contract yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ticketPrices.map((ticket, index) => {
              const onSale = isTicketOnSale(ticket);
              const saleStatus = getSaleStatus(ticket);
              const features = getTicketFeatures(ticket);
              const isFullPass = ticket.ticketType === 0;
              const isUnavailable = isSoldOut || !onSale;
              
              return (
                <div 
                  key={index}
                  className={`glass-card overflow-hidden transition-all duration-300 ${
                    isFullPass && !isUnavailable ? 'ring-2 ring-purple-500' : ''
                  } ${isUnavailable ? 'opacity-60' : ''}`}
                >
                  {/* Type Badge */}
                  <div className={`text-white text-center text-sm font-bold py-2 ${
                    saleStatus === 'ended' 
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600'
                      : isFullPass 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  }`}>
                    {saleStatus === 'ended' ? 'SALE ENDED' : isFullPass ? 'FULL PASS' : 'DAY PASS'}
                  </div>

                  <div className="p-8">
                    {/* Ticket Name & Phase */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-1">{ticket.name}</h3>
                      <span className="text-white/50 text-sm">{ticket.phase}</span>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className={`text-5xl font-bold ${saleStatus === 'ended' ? 'text-white/40' : 'gradient-text'}`}>
                        {ticket.priceDisplay}
                      </div>
                      <div className="text-white/50">EGLD</div>
                    </div>

                    {/* Sale Period Status */}
                    {ticket.saleStart && ticket.saleEnd && (
                      <div className="text-center mb-6 text-xs">
                        {saleStatus === 'upcoming' && (
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400">
                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                            Sale starts {formatDate(ticket.saleStart)}
                          </span>
                        )}
                        {saleStatus === 'active' && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                            On sale until {formatDate(ticket.saleEnd)}
                          </span>
                        )}
                        {saleStatus === 'ended' && (
                          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                            Sale ended {formatDate(ticket.saleEnd)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Features - from contract ticket type */}
                    <ul className="space-y-3 mb-8">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-white/80">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Buy Button */}
                    <button
                      onClick={() => handlePurchase(index)}
                      disabled={isPurchasing || isUnavailable}
                      className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        isUnavailable
                          ? 'bg-white/5 text-white/50 border border-white/10 cursor-not-allowed'
                          : isFullPass
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      }`}
                    >
                      {isPurchasing && selectedTicket === index ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Processing...
                        </>
                      ) : isSoldOut ? (
                        'Sold Out'
                      ) : saleStatus === 'upcoming' ? (
                        <>
                          <FontAwesomeIcon icon={faClock} />
                          Coming Soon
                        </>
                      ) : saleStatus === 'ended' ? (
                        'Sale Ended'
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
              );
            })}
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
