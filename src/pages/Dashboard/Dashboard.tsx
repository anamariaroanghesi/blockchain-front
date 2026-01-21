import { useState } from 'react';
import { AuthRedirectWrapper } from 'wrappers';
import { useScrollToElement } from 'hooks';
import { useGetAccountInfo } from 'hooks/sdkDappHooks';
import { useUserTickets } from 'hooks/festival/useUserTickets';
import { useFestivalData } from 'hooks/festival/useFestivalContract';
import { OwnedTicketNFT } from 'types/festival.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faTicket,
  faQrcode,
  faCalendar,
  faMapMarkerAlt,
  faCopy,
  faCheckCircle,
  faExternalLinkAlt,
  faHistory,
  faTimes,
  faShieldHalved,
  faSpinner,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { RouteNamesEnum } from 'localConstants';
import { environment } from 'config';

const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

const getExplorerUrl = () => {
  return environment === 'devnet' 
    ? 'https://devnet-explorer.multiversx.com'
    : 'https://testnet-explorer.multiversx.com';
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
            href={`${getExplorerUrl()}/accounts/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-center text-sm"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2" />
            Explorer
          </a>
          <a 
            href={`${getExplorerUrl()}/accounts/${address}/transactions`}
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

const TicketCard = ({ ticket, onViewQR }: { ticket: OwnedTicketNFT; onViewQR: () => void }) => {
  return (
    <div className="ticket-card overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left side - Ticket Visual */}
        <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
          <FontAwesomeIcon icon={faTicket} className="text-6xl text-white/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-800/90 hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800/90 to-transparent md:hidden" />
          
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className="badge-success flex items-center gap-1">
              <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
              Valid
            </span>
          </div>
        </div>

        {/* Right side - Content */}
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold mb-1">{ticket.name || 'Festival Ticket'}</h3>
              <span className="badge-primary text-xs">NFT #{ticket.nonce}</span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <FontAwesomeIcon icon={faTicket} className="text-purple-400" />
              <span>Token: {ticket.tokenId}</span>
            </div>
            {ticket.attributes && (
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-pink-400" />
                <span>Attributes: {ticket.attributes}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="font-mono text-xs text-white/40">
              Nonce: {ticket.nonce}
            </div>
            <button
              onClick={onViewQR}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faQrcode} />
              Show QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QRModal = ({ ticket, onClose }: { ticket: OwnedTicketNFT; onClose: () => void }) => {
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

        <h3 className="text-2xl font-bold mb-2">{ticket.name || 'Festival Ticket'}</h3>
        <p className="text-white/50 mb-6">NFT #{ticket.nonce}</p>

        {/* QR Code placeholder */}
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
            <div className="font-mono text-sm break-all">{ticket.tokenId}</div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-white/50 text-xs">Nonce</div>
              <div className="text-sm">{ticket.nonce}</div>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-white/50 text-xs">Balance</div>
              <div className="text-sm">{ticket.balance}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400" />
          <span className="text-emerald-300 text-sm">
            This ticket is verified on the blockchain
          </span>
        </div>

        <Link 
          to={RouteNamesEnum.checkin}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faQrcode} />
          Go to Check-In
        </Link>
      </div>
    </div>
  );
};

const StatsWidget = ({ tickets }: { tickets: OwnedTicketNFT[] }) => {
  const totalTickets = tickets.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Tickets', value: totalTickets, icon: faTicket, color: 'from-purple-500 to-indigo-500' },
        { label: 'Active', value: totalTickets, icon: faCheckCircle, color: 'from-emerald-500 to-teal-500' },
        { label: 'Used', value: 0, icon: faHistory, color: 'from-amber-500 to-orange-500' },
        { label: 'NFTs Owned', value: totalTickets, icon: faWallet, color: 'from-pink-500 to-rose-500' }
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
  const { tickets, isLoading, refetch } = useUserTickets();
  const { festivalData } = useFestivalData();
  const [selectedTicket, setSelectedTicket] = useState<OwnedTicketNFT | null>(null);

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
            <StatsWidget tickets={tickets} />
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
                  {festivalData && (
                    <span className="text-sm font-normal text-white/50">
                      for {festivalData.name}
                    </span>
                  )}
                </h2>

                <button
                  onClick={refetch}
                  className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faHistory} />
                  Refresh
                </button>
              </div>

              {isLoading ? (
                <div className="glass-card p-12 text-center">
                  <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-400 animate-spin mb-4" />
                  <p className="text-white/60">Loading your tickets from blockchain...</p>
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <TicketCard 
                      key={`${ticket.tokenId}-${ticket.nonce}`} 
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
                    You don't have any NFT tickets in your wallet yet
                  </p>
                  <Link to={RouteNamesEnum.tickets} className="btn-primary inline-flex items-center gap-2">
                    <FontAwesomeIcon icon={faTicket} />
                    Buy Tickets
                    <FontAwesomeIcon icon={faArrowRight} />
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
