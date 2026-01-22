import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGetIsLoggedIn, useGetAccountInfo } from 'hooks';
import { 
  useFestivalData, 
  useFestivalTransactions, 
  useUserTickets,
  useResaleListings,
  ResaleListing
} from 'hooks/festival';
import { RouteNamesEnum } from 'localConstants';
import { FESTIVAL_ID } from 'config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExchangeAlt,
  faTicket,
  faWallet,
  faInfoCircle,
  faShieldHalved,
  faTimes,
  faSpinner,
  faCheck,
  faPercent,
  faUser,
  faPlus
} from '@fortawesome/free-solid-svg-icons';

// Tax rates from smart contract
const PLATFORM_TAX_NORMAL = 5;
const PLATFORM_TAX_SOLD_OUT = 10;

export const ResaleMarketplace = () => {
  const location = useLocation();
  const isLoggedIn = useGetIsLoggedIn();
  const { address } = useGetAccountInfo();
  
  const { festivalData } = useFestivalData(FESTIVAL_ID);
  const { listings, isLoading, refetch } = useResaleListings();
  const { tickets: userTickets } = useUserTickets();
  const { putTicketForSale, buyResaleTicket } = useFestivalTransactions();
  
  const [selectedListing, setSelectedListing] = useState<ResaleListing | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [listPrice, setListPrice] = useState('');
  const [selectedTicketToList, setSelectedTicketToList] = useState<any>(null);

  const handleBuy = (listing: ResaleListing) => {
    if (!isLoggedIn) return;
    setSelectedListing(listing);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedListing || !address) return;

    setIsProcessing(true);
    try {
      await buyResaleTicket(
        selectedListing.nonce,
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

  const handleListTicket = async () => {
    if (!address || !selectedTicketToList || !listPrice) return;

    setIsProcessing(true);
    try {
      await putTicketForSale(
        selectedTicketToList.nonce,
        selectedTicketToList.tokenId,
        listPrice,
        location.pathname
      );
      
      setShowListModal(false);
      setListPrice('');
      setSelectedTicketToList(null);
      refetch();
    } catch (error) {
      console.error('Listing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <FontAwesomeIcon icon={faExchangeAlt} className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Resale <span className="gradient-text">Marketplace</span>
              </h1>
              <p className="text-white/60 text-sm">Buy and sell tickets via smart contract</p>
            </div>
          </div>
        </div>

        {/* Info + List Button */}
        <div className="glass-card p-4 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
              <FontAwesomeIcon icon={faInfoCircle} />
              How Resale Works
            </div>
            <p className="text-white/60 text-sm">
              All transactions use the smart contract with a {PLATFORM_TAX_NORMAL}% platform tax 
              ({PLATFORM_TAX_SOLD_OUT}% when sold out). NFT tickets transfer instantly.
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

        {/* Results Count */}
        <div className="mb-4 text-white/60 text-sm">
          {isLoading ? 'Loading...' : `${listings.length} tickets available`}
        </div>

        {/* Listings */}
        {isLoading ? (
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-400 animate-spin mb-4" />
            <p className="text-white/50">Loading listings...</p>
          </div>
        ) : listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.nonce} className="glass-card p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                  <FontAwesomeIcon icon={faTicket} className="text-2xl text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Festival Ticket #{listing.nonce}</div>
                  <div className="text-white/50 text-sm flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                    {listing.seller}
                  </div>
                  <div className="text-white/40 text-xs">
                    Original price: {listing.originalPriceDisplay} EGLD
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold gradient-text">{listing.priceDisplay} EGLD</div>
                  <button
                    onClick={() => handleBuy(listing)}
                    disabled={!isLoggedIn}
                    className="btn-primary text-sm mt-2"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-card">
            <div className="text-5xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold mb-2">No tickets available</h3>
            <p className="text-white/50 mb-6">No tickets are currently listed for resale</p>
            <Link to={`/tickets/${FESTIVAL_ID}`} className="btn-primary inline-flex items-center gap-2">
              <FontAwesomeIcon icon={faTicket} />
              Buy from Organizer
            </Link>
          </div>
        )}

        {/* Not logged in notice */}
        {!isLoggedIn && (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedListing(null)} />
          <div className="relative w-full max-w-md glass-card p-6">
            <button 
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <h3 className="text-xl font-bold mb-4">Confirm Purchase</h3>

            <div className="p-4 rounded-xl bg-white/5 mb-4">
              <div className="font-semibold">Festival Ticket #{selectedListing.nonce}</div>
              <div className="text-white/50 text-sm">Seller: {selectedListing.seller}</div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Price</span>
                <span>{selectedListing.priceDisplay} EGLD</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span className="text-white/40">Original price</span>
                <span>{selectedListing.originalPriceDisplay} EGLD</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span><FontAwesomeIcon icon={faPercent} className="mr-1" />Platform Tax</span>
                <span>Included ({PLATFORM_TAX_NORMAL}%)</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="gradient-text">{selectedListing.priceDisplay} EGLD</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4 text-sm">
              <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400 mr-2" />
              <span className="text-emerald-300">NFT transfers via smart contract</span>
            </div>

            <button
              onClick={handleConfirmPurchase}
              disabled={isProcessing}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Processing...</>
              ) : (
                <><FontAwesomeIcon icon={faCheck} /> Confirm - {selectedListing.price} EGLD</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* List Ticket Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowListModal(false)} />
          <div className="relative w-full max-w-md glass-card p-6">
            <button 
              onClick={() => setShowListModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <h3 className="text-xl font-bold mb-4">List Ticket for Sale</h3>

            {/* Ticket selection */}
            <div className="mb-4">
              <label className="text-sm text-white/60 block mb-2">Select Ticket</label>
              <div className="space-y-2">
                {userTickets.map((ticket, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTicketToList(ticket)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedTicketToList?.nonce === ticket.nonce
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
            </div>

            {/* Price input */}
            {selectedTicketToList && (
              <div className="mb-4">
                <label className="text-sm text-white/60 block mb-2">Sale Price (EGLD)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  placeholder="0.00"
                  className="input-field w-full"
                />
                <p className="text-xs text-white/40 mt-2">
                  You'll receive {listPrice ? (parseFloat(listPrice) * (1 - PLATFORM_TAX_NORMAL / 100)).toFixed(4) : '0'} EGLD after {PLATFORM_TAX_NORMAL}% tax
                </p>
              </div>
            )}

            <button
              onClick={handleListTicket}
              disabled={isProcessing || !selectedTicketToList || !listPrice}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Listing...</>
              ) : (
                <><FontAwesomeIcon icon={faPlus} /> List for {listPrice || '0'} EGLD</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success overlay */}
      {purchaseSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faCheck} className="text-3xl text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Transaction Sent!</h3>
            <p className="text-white/60">Your ticket will appear shortly</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResaleMarketplace;
