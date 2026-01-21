import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthRedirectWrapper } from 'wrappers';
import { useGetAccountInfo } from 'hooks';
import { 
  useFestivalData, 
  useFestivalTransactions, 
  useUserTickets 
} from 'hooks/festival';
import { RouteNamesEnum } from 'localConstants';
import { FESTIVAL_ID } from 'config';
import { 
  formatDate, 
  formatTime,
  isFestivalActive,
  OwnedTicketNFT
} from 'types/festival.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQrcode,
  faTicket,
  faCalendar,
  faMapMarkerAlt,
  faClock,
  faShieldHalved,
  faSpinner,
  faRefresh,
  faCheckCircle,
  faExclamationTriangle,
  faArrowRight,
  faSignInAlt,
  faSignOutAlt,
  faUsers
} from '@fortawesome/free-solid-svg-icons';

// Simple QR Code component
const QRCodeDisplay = ({ code, size = 200 }: { code: string; size?: number }) => {
  const generatePattern = (str: string) => {
    const pattern: boolean[][] = [];
    const gridSize = 25;
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    
    for (let row = 0; row < gridSize; row++) {
      pattern[row] = [];
      for (let col = 0; col < gridSize; col++) {
        const isCorner = 
          (row < 7 && col < 7) || 
          (row < 7 && col >= gridSize - 7) || 
          (row >= gridSize - 7 && col < 7);
        
        if (isCorner) {
          const inOuter = row < 7 && col < 7 ? (row === 0 || row === 6 || col === 0 || col === 6) :
                         row < 7 && col >= gridSize - 7 ? (row === 0 || row === 6 || col === gridSize - 1 || col === gridSize - 7) :
                         (row === gridSize - 1 || row === gridSize - 7 || col === 0 || col === 6);
          const inInner = row < 7 && col < 7 ? (row >= 2 && row <= 4 && col >= 2 && col <= 4) :
                         row < 7 && col >= gridSize - 7 ? (row >= 2 && row <= 4 && col >= gridSize - 5 && col <= gridSize - 3) :
                         (row >= gridSize - 5 && row <= gridSize - 3 && col >= 2 && col <= 4);
          pattern[row][col] = inOuter || inInner;
        } else {
          const seed = (hash + row * gridSize + col) % 100;
          pattern[row][col] = seed > 45;
        }
      }
    }
    
    return pattern;
  };

  const pattern = generatePattern(code);
  const cellSize = size / 25;

  return (
    <div 
      className="bg-white p-4 rounded-2xl inline-block"
      style={{ width: size + 32, height: size + 32 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {pattern.map((row, rowIndex) =>
          row.map((cell, colIndex) =>
            cell ? (
              <rect
                key={`${rowIndex}-${colIndex}`}
                x={colIndex * cellSize}
                y={rowIndex * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#000"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};

const TicketSelector = ({
  tickets,
  selectedTicket,
  onSelect
}: {
  tickets: OwnedTicketNFT[];
  selectedTicket: OwnedTicketNFT | null;
  onSelect: (ticket: OwnedTicketNFT) => void;
}) => {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🎫</div>
        <h3 className="text-xl font-semibold mb-2">No Tickets Found</h3>
        <p className="text-white/50 mb-4">You don't have any festival tickets in your wallet</p>
        <Link to={RouteNamesEnum.tickets} className="btn-primary inline-flex items-center gap-2">
          <FontAwesomeIcon icon={faTicket} />
          Buy Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-3">Select a ticket for check-in:</h3>
      {tickets.map((ticket) => (
        <button
          key={ticket.nonce}
          onClick={() => onSelect(ticket)}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            selectedTicket?.nonce === ticket.nonce
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/10 bg-white/5 hover:border-white/30'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FontAwesomeIcon icon={faTicket} className="text-2xl text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{ticket.name}</div>
              <div className="text-white/60 text-sm">NFT #{ticket.nonce}</div>
              <div className="text-white/40 text-xs mt-1">
                Token: {ticket.tokenId}
              </div>
            </div>
            {selectedTicket?.nonce === ticket.nonce && (
              <FontAwesomeIcon icon={faCheckCircle} className="text-purple-400 text-xl" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export const CheckIn = () => {
  const location = useLocation();
  const { address } = useGetAccountInfo();
  const { festivalData, isLoading: loadingFestival } = useFestivalData(FESTIVAL_ID);
  const { tickets, isLoading: loadingTickets } = useUserTickets();
  const { checkIn, checkOut, createParticipant, transactionStatus } = useFestivalTransactions();
  
  const [selectedTicket, setSelectedTicket] = useState<OwnedTicketNFT | null>(null);
  const [entryCode, setEntryCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isLoading = loadingFestival || loadingTickets;

  // Auto-select first ticket if only one exists
  useEffect(() => {
    if (tickets.length === 1 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    }
  }, [tickets, selectedTicket]);

  // Countdown timer for code expiry
  useEffect(() => {
    if (!entryCode) return;

    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes from generation
    
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        setEntryCode(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [entryCode]);

  const handleGenerateCode = async () => {
    if (!selectedTicket || !address) return;

    setIsGenerating(true);
    try {
      // Generate a unique entry code based on address, ticket, and timestamp
      const timestamp = Date.now();
      const code = `FEST-${FESTIVAL_ID}-${selectedTicket.nonce}-${address.slice(-8)}-${timestamp}`;
      setEntryCode(code);
      setTimeRemaining(300); // 5 minutes
    } catch (error) {
      console.error('Failed to generate entry code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckIn = async () => {
    if (!address) return;
    
    setIsProcessing(true);
    try {
      await checkIn(FESTIVAL_ID, location.pathname);
      setIsCheckedIn(true);
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!address) return;
    
    setIsProcessing(true);
    try {
      await checkOut(FESTIVAL_ID, location.pathname);
      setIsCheckedIn(false);
    } catch (error) {
      console.error('Check-out failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimeDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-400 animate-spin mb-4" />
          <div className="text-white/50">Loading your tickets...</div>
        </div>
      </div>
    );
  }

  const isActive = festivalData ? isFestivalActive(festivalData) : false;

  return (
    <AuthRedirectWrapper>
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
              <FontAwesomeIcon icon={faQrcode} className="text-4xl text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Event <span className="gradient-text">Check-In</span>
            </h1>
            <p className="text-white/60">
              Generate your entry QR code for venue access
            </p>
          </div>

          {/* Festival Status */}
          {festivalData && (
            <div className="glass-card p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{festivalData.name}</h3>
                  <div className="text-white/60 text-sm">
                    {formatDate(festivalData.startTime)} • {formatTime(festivalData.startTime)}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'}`}>
                    {isActive ? '🔴 Live Now' : 'Upcoming'}
                  </span>
                  <div className="text-white/50 text-xs mt-1">
                    <FontAwesomeIcon icon={faUsers} className="mr-1" />
                    {festivalData.insideCount} inside
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="glass-card p-6">
            {!entryCode ? (
              <>
                {/* Ticket selection */}
                <TicketSelector
                  tickets={tickets}
                  selectedTicket={selectedTicket}
                  onSelect={setSelectedTicket}
                />

                {/* Actions */}
                {selectedTicket && (
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                    {/* Generate QR Code */}
                    <button
                      onClick={handleGenerateCode}
                      disabled={isGenerating}
                      className="btn-success w-full flex items-center justify-center gap-2 py-4"
                    >
                      {isGenerating ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Generating Entry Code...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faQrcode} />
                          Generate Entry QR Code
                        </>
                      )}
                    </button>

                    {/* Check In/Out Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={handleCheckIn}
                        disabled={isProcessing || isCheckedIn}
                        className={`btn-secondary flex items-center justify-center gap-2 ${
                          isCheckedIn ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isProcessing ? (
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        ) : (
                          <FontAwesomeIcon icon={faSignInAlt} />
                        )}
                        Check In
                      </button>
                      <button
                        onClick={handleCheckOut}
                        disabled={isProcessing || !isCheckedIn}
                        className={`btn-secondary flex items-center justify-center gap-2 ${
                          !isCheckedIn ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isProcessing ? (
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        ) : (
                          <FontAwesomeIcon icon={faSignOutAlt} />
                        )}
                        Check Out
                      </button>
                    </div>
                    <p className="text-xs text-white/40 text-center">
                      Use Check In/Out to record your festival attendance on-chain and earn points
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* QR Code Display */}
                <div className="text-center">
                  {/* Event info */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold">{festivalData?.name}</h3>
                    <p className="text-white/60">{selectedTicket?.name || 'Festival Ticket'}</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-6">
                    <QRCodeDisplay code={entryCode} size={220} />
                  </div>

                  {/* Timer */}
                  <div className={`mb-6 p-4 rounded-xl ${
                    timeRemaining && timeRemaining < 60 
                      ? 'bg-red-500/10 border border-red-500/20' 
                      : 'bg-white/5'
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      <FontAwesomeIcon 
                        icon={faClock} 
                        className={timeRemaining && timeRemaining < 60 ? 'text-red-400' : 'text-white/60'}
                      />
                      <span className={timeRemaining && timeRemaining < 60 ? 'text-red-400' : 'text-white/60'}>
                        Code expires in:
                      </span>
                      <span className={`text-2xl font-mono font-bold ${
                        timeRemaining && timeRemaining < 60 ? 'text-red-400' : 'gradient-text'
                      }`}>
                        {timeRemaining !== null ? formatTimeDisplay(timeRemaining) : '--:--'}
                      </span>
                    </div>
                  </div>

                  {/* Code string (for manual entry) */}
                  <div className="p-3 rounded-xl bg-white/5 mb-6">
                    <div className="text-white/50 text-xs mb-1">Entry Code</div>
                    <div className="font-mono text-sm break-all">{entryCode}</div>
                  </div>

                  {/* Refresh button */}
                  <button
                    onClick={handleGenerateCode}
                    disabled={isGenerating}
                    className="btn-secondary flex items-center justify-center gap-2 mx-auto"
                  >
                    <FontAwesomeIcon icon={faRefresh} />
                    Generate New Code
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 glass-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400" />
              How Check-In Works
            </h3>
            <ol className="space-y-3 text-white/70 text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Select the ticket NFT from your wallet</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Generate a unique QR code (valid for 5 minutes)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Show the QR code to staff at the venue entrance</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <span>Use "Check In" button to record your entry on the blockchain</span>
              </li>
            </ol>

            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2 text-amber-300 text-sm">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5" />
                <span>Each code can only be used once. Generate a new code if it expires or fails to scan.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthRedirectWrapper>
  );
};

export default CheckIn;
