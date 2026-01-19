import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthRedirectWrapper } from 'wrappers';
import { useGetIsLoggedIn, useGetAccountInfo } from 'hooks';
import { RouteNamesEnum } from 'localConstants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExchangeAlt,
  faTicket,
  faWallet,
  faArrowRight,
  faInfoCircle,
  faShieldHalved,
  faSearch,
  faTimes,
  faSpinner,
  faCheck,
  faPercent,
  faUser,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';
import {
  getResaleListings,
  calculateResaleFees,
  buyResaleTicket,
  PLATFORM_FEE_PERCENT,
  ORGANIZER_FEE_PERCENT,
  ResaleTicket
} from 'services/ticketService';

const ResaleCard = ({ 
  ticket, 
  onBuy 
}: { 
  ticket: ResaleTicket; 
  onBuy: (ticket: ResaleTicket) => void;
}) => {
  const fees = calculateResaleFees(parseFloat(ticket.resalePrice));
  const priceIncrease = ((parseFloat(ticket.resalePrice) - parseFloat(ticket.originalPrice)) / parseFloat(ticket.originalPrice) * 100).toFixed(0);

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
          <img 
            src={ticket.imageUrl} 
            alt={ticket.eventName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-800/90 hidden md:block" />
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold mb-1">{ticket.eventName}</h3>
              <span className="badge-primary text-xs">{ticket.ticketType}</span>
            </div>
            {parseInt(priceIncrease) > 0 && (
              <span className="text-amber-400 text-sm">
                +{priceIncrease}% from original
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faCalendar} className="text-purple-400" />
              {new Date(ticket.eventDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faUser} className="text-pink-400" />
              {ticket.sellerAddress.slice(0, 12)}...
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-xl bg-white/5">
            <div>
              <div className="text-white/50 text-xs">Original Price</div>
              <div className="text-white/70 line-through">{ticket.originalPrice} EGLD</div>
            </div>
            <div>
              <div className="text-white/50 text-xs">Resale Price</div>
              <div className="text-xl font-bold gradient-text">{ticket.resalePrice} EGLD</div>
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="text-xs text-white/40 mb-4">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
            Includes {PLATFORM_FEE_PERCENT}% platform fee + {ORGANIZER_FEE_PERCENT}% organizer royalty
          </div>

          <button
            onClick={() => onBuy(ticket)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faTicket} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

const PurchaseModal = ({
  ticket,
  onClose,
  onConfirm,
  isProcessing
}: {
  ticket: ResaleTicket;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}) => {
  const fees = calculateResaleFees(parseFloat(ticket.resalePrice));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass-card p-6 animate-slide-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h3 className="text-2xl font-bold mb-2">Confirm Purchase</h3>
        <p className="text-white/60 mb-6">Review the transaction details below</p>

        {/* Ticket info */}
        <div className="p-4 rounded-xl bg-white/5 mb-6">
          <div className="font-semibold mb-1">{ticket.eventName}</div>
          <div className="text-white/60 text-sm">{ticket.ticketType}</div>
          <div className="text-white/40 text-xs mt-2">
            Token: {ticket.tokenId}
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-white/60">Ticket Price</span>
            <span>{fees.resalePrice.toFixed(4)} EGLD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">
              <FontAwesomeIcon icon={faPercent} className="mr-1" />
              Platform Fee ({PLATFORM_FEE_PERCENT}%)
            </span>
            <span className="text-white/50">{fees.platformFee.toFixed(4)} EGLD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">
              <FontAwesomeIcon icon={faPercent} className="mr-1" />
              Organizer Royalty ({ORGANIZER_FEE_PERCENT}%)
            </span>
            <span className="text-white/50">{fees.organizerFee.toFixed(4)} EGLD</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="gradient-text">{fees.buyerPays.toFixed(4)} EGLD</span>
          </div>
        </div>

        {/* Seller info */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
          <div className="flex items-center gap-2 text-emerald-300 text-sm">
            <FontAwesomeIcon icon={faShieldHalved} />
            <span>Seller receives: {fees.sellerReceives.toFixed(4)} EGLD</span>
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="btn-accent w-full flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheck} />
              Confirm Purchase
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const ResaleMarketplace = () => {
  const isLoggedIn = useGetIsLoggedIn();
  const { address } = useGetAccountInfo();
  const [listings, setListings] = useState<ResaleTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<ResaleTicket | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const data = await getResaleListings();
      setListings(data);
    } catch (error) {
      console.error('Failed to load resale listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = (ticket: ResaleTicket) => {
    if (!isLoggedIn) {
      return;
    }
    setSelectedTicket(ticket);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedTicket || !address) return;

    setIsProcessing(true);
    try {
      const result = await buyResaleTicket(selectedTicket.id, address);
      
      if (result.success) {
        setPurchaseSuccess(true);
        // Remove from listings
        setListings(listings.filter(l => l.id !== selectedTicket.id));
        setTimeout(() => {
          setSelectedTicket(null);
          setPurchaseSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredListings = listings.filter(ticket =>
    ticket.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticketType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthRedirectWrapper requireAuth={false}>
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <FontAwesomeIcon icon={faExchangeAlt} className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">
                  Resale <span className="gradient-text">Marketplace</span>
                </h1>
                <p className="text-white/60">Buy and sell tickets securely on the blockchain</p>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="glass-card p-4 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
                <FontAwesomeIcon icon={faInfoCircle} />
                How Resale Works
              </div>
              <p className="text-white/60 text-sm">
                All resale transactions include a {PLATFORM_FEE_PERCENT}% platform fee and {ORGANIZER_FEE_PERCENT}% organizer royalty. 
                Tickets are transferred instantly via blockchain smart contract.
              </p>
            </div>
            {isLoggedIn && (
              <Link 
                to={RouteNamesEnum.dashboard}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTicket} />
                List My Ticket
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="glass-card p-4 mb-8">
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search by event or ticket type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Results */}
          <div className="mb-6 text-white/60">
            {isLoading ? 'Loading...' : `${filteredListings.length} tickets available for resale`}
          </div>

          {/* Listings */}
          {isLoading ? (
            <div className="text-center py-16">
              <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-400 animate-spin mb-4" />
              <p className="text-white/50">Loading resale listings...</p>
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="space-y-4">
              {filteredListings.map((ticket) => (
                <ResaleCard 
                  key={ticket.id} 
                  ticket={ticket} 
                  onBuy={handleBuy}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold mb-2">No tickets available</h3>
              <p className="text-white/50 mb-6">
                {searchQuery ? 'No tickets match your search' : 'No tickets are currently listed for resale'}
              </p>
              <Link to={RouteNamesEnum.tickets} className="btn-primary inline-flex items-center gap-2">
                <FontAwesomeIcon icon={faTicket} />
                Buy from Organizer
              </Link>
            </div>
          )}

          {/* Not logged in notice */}
          {!isLoggedIn && listings.length > 0 && (
            <div className="mt-8 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
              <p className="text-purple-300 mb-3">Connect your wallet to purchase tickets</p>
              <Link to={RouteNamesEnum.unlock} className="btn-primary inline-flex items-center gap-2">
                <FontAwesomeIcon icon={faWallet} />
                Connect Wallet
              </Link>
            </div>
          )}
        </div>

        {/* Purchase Modal */}
        {selectedTicket && (
          <PurchaseModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onConfirm={handleConfirmPurchase}
            isProcessing={isProcessing}
          />
        )}

        {/* Success overlay */}
        {purchaseSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="text-center animate-slide-up">
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCheck} className="text-4xl text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Purchase Successful!</h3>
              <p className="text-white/60">Your ticket has been transferred to your wallet</p>
            </div>
          </div>
        )}
      </div>
    </AuthRedirectWrapper>
  );
};

export default ResaleMarketplace;

