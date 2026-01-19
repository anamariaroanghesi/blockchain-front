import { useState } from 'react';
import { AuthRedirectWrapper } from 'wrappers';
import { useScrollToElement } from 'hooks';
import { useGetAccountInfo } from 'hooks/sdkDappHooks';
import { mockOwnedTickets } from 'data/mockEvents';
import { OwnedTicket } from 'types/ticket.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faTicket,
  faQrcode,
  faCalendar,
  faMapMarkerAlt,
  faCopy,
  faCheckCircle,
  faTimesCircle,
  faExternalLinkAlt,
  faHistory,
  faTimes,
  faShieldHalved,
  faExpand
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { RouteNamesEnum } from 'localConstants';

const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

const AccountWidget = () => {
  const { address, account } = useGetAccountInfo();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const balance = account?.balance 
    ? (parseInt(account.balance) / 1e18).toFixed(4) 
    : '0.0000';

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <FontAwesomeIcon icon={faWallet} className="text-xl text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">My Wallet</h2>
          <p className="text-white/50 text-sm">Connected account details</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Address */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-white/50 text-xs mb-1">Wallet Address</div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm">{formatAddress(address)}</span>
            <button 
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Copy address"
            >
              <FontAwesomeIcon 
                icon={copied ? faCheckCircle : faCopy} 
                className={copied ? 'text-emerald-400' : 'text-white/50'}
              />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-white/50 text-xs mb-1">Balance</div>
          <div className="text-2xl font-bold gradient-text">{balance} EGLD</div>
        </div>

        {/* Quick links */}
        <div className="flex gap-2">
          <a 
            href={`https://testnet-explorer.multiversx.com/accounts/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-center text-sm"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2" />
            Explorer
          </a>
          <a 
            href={`https://testnet-explorer.multiversx.com/accounts/${address}/transactions`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-center text-sm"
          >
            <FontAwesomeIcon icon={faHistory} className="mr-2" />
            History
          </a>
        </div>
      </div>
    </div>
  );
};

const TicketCard = ({ ticket, onViewQR }: { ticket: OwnedTicket; onViewQR: () => void }) => {
  const isExpired = new Date(ticket.eventDate) < new Date();
  
  return (
    <div className={`ticket-card overflow-hidden ${ticket.isUsed ? 'opacity-60' : ''}`}>
      <div className="flex flex-col md:flex-row">
        {/* Left side - Image */}
        <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
          <img 
            src={ticket.imageUrl} 
            alt={ticket.eventName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-800/90 hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800/90 to-transparent md:hidden" />
          
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            {ticket.isUsed ? (
              <span className="badge-danger flex items-center gap-1">
                <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
                Used
              </span>
            ) : isExpired ? (
              <span className="badge-warning flex items-center gap-1">
                <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
                Expired
              </span>
            ) : (
              <span className="badge-success flex items-center gap-1">
                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                Valid
              </span>
            )}
          </div>
        </div>

        {/* Right side - Content */}
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold mb-1">{ticket.eventName}</h3>
              <span className="badge-primary text-xs">{ticket.ticketType}</span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <FontAwesomeIcon icon={faCalendar} className="text-purple-400" />
              <span>{new Date(ticket.eventDate).toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })} at {ticket.eventTime}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-pink-400" />
              <span>{ticket.venue}</span>
            </div>
            {ticket.seatInfo && (
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <FontAwesomeIcon icon={faTicket} className="text-emerald-400" />
                <span>{ticket.seatInfo}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="font-mono text-xs text-white/40">
              {ticket.tokenId}
            </div>
            {!ticket.isUsed && !isExpired && (
              <button
                onClick={onViewQR}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faQrcode} />
                Show QR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QRModal = ({ ticket, onClose }: { ticket: OwnedTicket; onClose: () => void }) => {
  // Generate a simple QR-like pattern (in production, use a real QR library)
  const qrData = `TICKET:${ticket.tokenId}|EVENT:${ticket.eventId}|TYPE:${ticket.ticketType}`;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md glass-card p-6 animate-slide-up text-center">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h3 className="text-2xl font-bold mb-2">{ticket.eventName}</h3>
        <p className="text-white/50 mb-6">{ticket.ticketType}</p>

        {/* QR Code placeholder - in production use react-qr-code or similar */}
        <div className="bg-white p-6 rounded-2xl inline-block mb-6">
          <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Simulated QR pattern */}
            <div className="absolute inset-4 grid grid-cols-8 gap-1">
              {Array.from({ length: 64 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`rounded-sm ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FontAwesomeIcon icon={faQrcode} className="text-5xl text-white/80" />
            </div>
          </div>
        </div>

        <div className="space-y-3 text-left">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-white/50 text-xs">Token ID</div>
            <div className="font-mono text-sm">{ticket.tokenId}</div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-white/50 text-xs">Date</div>
              <div className="text-sm">{ticket.eventDate}</div>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-white/50 text-xs">Time</div>
              <div className="text-sm">{ticket.eventTime}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400" />
          <span className="text-emerald-300 text-sm">
            This ticket is verified on the blockchain
          </span>
        </div>
      </div>
    </div>
  );
};

const StatsWidget = () => {
  const totalTickets = mockOwnedTickets.length;
  const usedTickets = mockOwnedTickets.filter(t => t.isUsed).length;
  const activeTickets = totalTickets - usedTickets;
  const totalSpent = mockOwnedTickets.reduce((sum, t) => sum + parseFloat(t.purchasePrice), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Tickets', value: totalTickets, icon: faTicket, color: 'from-purple-500 to-indigo-500' },
        { label: 'Active', value: activeTickets, icon: faCheckCircle, color: 'from-emerald-500 to-teal-500' },
        { label: 'Used', value: usedTickets, icon: faHistory, color: 'from-amber-500 to-orange-500' },
        { label: 'Total Spent', value: `${totalSpent.toFixed(2)} EGLD`, icon: faWallet, color: 'from-pink-500 to-rose-500' }
      ].map((stat, i) => (
        <div key={i} className="glass-card p-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
            <FontAwesomeIcon icon={stat.icon} className="text-white" />
          </div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-white/50 text-sm">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export const Dashboard = () => {
  useScrollToElement();
  const [selectedTicket, setSelectedTicket] = useState<OwnedTicket | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'used'>('all');

  const filteredTickets = mockOwnedTickets.filter(ticket => {
    if (filter === 'active') return !ticket.isUsed;
    if (filter === 'used') return ticket.isUsed;
    return true;
  });

  return (
    <AuthRedirectWrapper>
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              My <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-white/60 text-lg">
              Manage your NFT tickets and wallet
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <StatsWidget />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column - Account */}
            <div className="lg:col-span-1">
              <AccountWidget />
            </div>

            {/* Right column - Tickets */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <FontAwesomeIcon icon={faTicket} className="text-purple-400" />
                  My Tickets
                </h2>

                {/* Filter tabs */}
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'used', label: 'Used' }
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setFilter(tab.value as typeof filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === tab.value
                          ? 'bg-purple-500 text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTickets.length > 0 ? (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket} 
                      onViewQR={() => setSelectedTicket(ticket)}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <div className="text-6xl mb-4">🎫</div>
                  <h3 className="text-xl font-semibold mb-2">No tickets found</h3>
                  <p className="text-white/50 mb-6">
                    {filter === 'all' 
                      ? "You haven't purchased any tickets yet" 
                      : `No ${filter} tickets`}
                  </p>
                  <Link to={RouteNamesEnum.tickets} className="btn-primary inline-flex items-center gap-2">
                    <FontAwesomeIcon icon={faTicket} />
                    Browse Events
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QR Modal */}
        {selectedTicket && (
          <QRModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
        )}
      </div>
    </AuthRedirectWrapper>
  );
};
