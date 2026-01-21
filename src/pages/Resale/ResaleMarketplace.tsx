import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthRedirectWrapper } from 'wrappers';
import { useGetIsLoggedIn, useGetAccountInfo } from 'hooks';
import { 
  useFestivalData, 
  useFestivalTransactions, 
  useUserTickets,
  useResaleListings
} from 'hooks/festival';
import { RouteNamesEnum } from 'localConstants';
import { FESTIVAL_ID } from 'config';
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
  faCalendar,
  faPlus,
  faTag
} from '@fortawesome/free-solid-svg-icons';

// Resale fee structure (based on smart contract tax)
const PLATFORM_TAX_NORMAL = 5; // 5% when not sold out
const PLATFORM_TAX_SOLD_OUT = 10; // 10% when sold out

interface ResaleListing {
  ticketNonce: number;
  sellerAddress: string;
  festivalId: number;
  price: string;
  eventName: string;
  ticketType: string;
}

const ResaleCard = ({ 
  listing, 
  onBuy 
}: { 
  listing: ResaleListing;
  onBuy: (listing: ResaleListing) => void;
}) => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Image placeholder */}
        <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
          <FontAwesomeIcon icon={faTicket} className="text-4xl text-purple-400" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-800/90 hidden md:block" />
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold mb-1">{listing.eventName}</h3>
              <span className="badge-primary text-xs">{listing.ticketType || 'Festival Ticket'}</span>
            </div>
            <div className="text-xs text-white/40">
              NFT #{listing.ticketNonce}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faUser} className="text-pink-400" />
              {listing.sellerAddress.slice(0, 10)}...{listing.sellerAddress.slice(-4)}
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-4 p-3 rounded-xl bg-white/5">
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-sm">Resale Price</span>
              <span className="text-xl font-bold gradient-text">{listing.price} EGLD</span>
            </div>
          </div>

          {/* Fee info */}
          <div className="text-xs text-white/40 mb-4">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
            Price includes platform tax ({PLATFORM_TAX_NORMAL}%)
          </div>

          <button
            onClick={() => onBuy(listing)}
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
  listing,
  onClose,
  onConfirm,
  isProcessing
}: {
  listing: ResaleListing;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass-card p-6 animate-slide-up">
        <button 
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h3 className="text-2xl font-bold mb-2">Confirm Resale Purchase</h3>
        <p className="text-white/60 mb-6">Review the transaction details below</p>

        {/* Ticket info */}
        <div className="p-4 rounded-xl bg-white/5 mb-6">
          <div className="font-semibold mb-1">{listing.eventName}</div>
          <div className="text-white/60 text-sm">{listing.ticketType || 'Festival Ticket'}</div>
          <div className="text-white/40 text-xs mt-2">
            NFT Nonce: #{listing.ticketNonce}
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-white/60">Ticket Price</span>
            <span>{listing.price} EGLD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">
              <FontAwesomeIcon icon={faPercent} className="mr-1" />
              Platform Tax ({PLATFORM_TAX_NORMAL}%)
            </span>
            <span className="text-white/50">Included</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="gradient-text">{listing.price} EGLD</span>
          </div>
        </div>

        {/* Smart contract notice */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
          <div className="flex items-center gap-2 text-emerald-300 text-sm">
            <FontAwesomeIcon icon={faShieldHalved} />
            <span>NFT will be transferred to your wallet via smart contract</span>
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
              Confirm Purchase - {listing.price} EGLD
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const ListTicketModal = ({
  tickets,
  onClose,
  onConfirm,
  isProcessing
}: {
  tickets: any[];
  onClose: () => void;
  onConfirm: (ticketNonce: number, tokenId: string, price: string) => void;
  isProcessing: boolean;
}) => {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [price, setPrice] = useState('');

  const handleSubmit = () => {
    if (!selectedTicket || !price) return;
    onConfirm(selectedTicket.nonce, selectedTicket.tokenId, price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass-card p-6 animate-slide-up">
        <button 
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h3 className="text-2xl font-bold mb-2">List Ticket for Sale</h3>
        <p className="text-white/60 mb-6">Select a ticket and set your price</p>

        {/* Ticket selection */}
        <div className="space-y-2 mb-4">
          <label className="text-sm text-white/60">Select Ticket</label>
          {tickets.length > 0 ? (
            <div className="space-y-2">
              {tickets.map((ticket, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedTicket?.nonce === ticket.nonce
                      ? 'border-2 border-purple-500 bg-purple-500/10'
                      : 'border border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faTicket} className="text-purple-400" />
                    <div>
                      <div className="font-semibold">{ticket.name || 'Festival Ticket'}</div>
                      <div className="text-white/50 text-xs">NFT #{ticket.nonce}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-white/50">
              No tickets available to list
            </div>
          )}
        </div>

        {/* Price input */}
        {selectedTicket && (
          <div className="mb-6">
            <label className="text-sm text-white/60 block mb-2">Sale Price (EGLD)</label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faTag} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="number"
                step="0.001"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="input-field pl-12"
              />
            </div>
            <p className="text-xs text-white/40 mt-2">
              Buyer will pay {price || '0'} EGLD. You'll receive {price ? (parseFloat(price) * (1 - PLATFORM_TAX_NORMAL / 100)).toFixed(4) : '0'} EGLD after {PLATFORM_TAX_NORMAL}% platform tax.
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isProcessing || !selectedTicket || !price}
          className="btn-accent w-full flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              Listing...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faTag} />
              List for {price || '0'} EGLD
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const ResaleMarketplace = () => {
  const location = useLocation();
  const isLoggedIn = useGetIsLoggedIn();
  const { address } = useGetAccountInfo();
  
  const { festivalData } = useFestivalData(FESTIVAL_ID);
  const { listings, isLoading, refetch } = useResaleListings();
  const { tickets: userTickets } = useUserTickets();
  const { putTicketForSale, buyResaleTicket, transactionStatus } = useFestivalTransactions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<ResaleListing | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [showListModal, setShowListModal] = useState(false);

  const handleBuy = (listing: ResaleListing) => {
    if (!isLoggedIn) return;
    setSelectedListing(listing);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedListing || !address) return;

    setIsProcessing(true);
    try {
      await buyResaleTicket(
        selectedListing.ticketNonce,
        selectedListing.price,
        location.pathname
      );
      
      setPurchaseSuccess(true);
      setSelectedListing(null);
      
      setTimeout(() => {
        setPurchaseSuccess(false);
        refetch();
      }, 3000);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleListTicket = async (ticketNonce: number, tokenId: string, price: string) => {
    if (!address) return;

    setIsProcessing(true);
    try {
      await putTicketForSale(
        FESTIVAL_ID,
        ticketNonce,
        tokenId,
        price,
        location.pathname
      );
      
      setShowListModal(false);
      refetch();
    } catch (error) {
      console.error('Listing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredListings = listings.filter((listing: ResaleListing) =>
    listing.eventName.toLowerCase().includes(searchQuery.toLowerCase())
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
                <p className="text-white/60">Buy and sell tickets via smart contract</p>
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
                All resale transactions are processed through the smart contract with a {PLATFORM_TAX_NORMAL}% platform tax 
                (or {PLATFORM_TAX_SOLD_OUT}% if tickets are sold out). NFT tickets are transferred instantly.
              </p>
            </div>
            {isLoggedIn && userTickets.length > 0 && (
              <button
                onClick={() => setShowListModal(true)}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                List My Ticket
              </button>
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
                placeholder="Search by event name..."
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
              {filteredListings.map((listing: ResaleListing) => (
                <ResaleCard 
                  key={listing.ticketNonce} 
                  listing={listing} 
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
              <p className="text-purple-300 mb-3">Connect your wallet to purchase or list tickets</p>
              <Link to={RouteNamesEnum.unlock} className="btn-primary inline-flex items-center gap-2">
                <FontAwesomeIcon icon={faWallet} />
                Connect Wallet
              </Link>
            </div>
          )}
        </div>

        {/* Purchase Modal */}
        {selectedListing && (
          <PurchaseModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
            onConfirm={handleConfirmPurchase}
            isProcessing={isProcessing}
          />
        )}

        {/* List Ticket Modal */}
        {showListModal && (
          <ListTicketModal
            tickets={userTickets}
            onClose={() => setShowListModal(false)}
            onConfirm={handleListTicket}
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
              <h3 className="text-2xl font-bold mb-2">Transaction Sent!</h3>
              <p className="text-white/60">Your ticket will appear in your wallet shortly</p>
            </div>
          </div>
        )}
      </div>
    </AuthRedirectWrapper>
  );
};

export default ResaleMarketplace;

