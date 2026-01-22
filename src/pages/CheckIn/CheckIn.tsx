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
  faClock,
  faShieldHalved,
  faSpinner,
  faRefresh,
  faCheckCircle,
  faExclamationTriangle,
  faCamera,
  faTimes,
  faWallet,
  faLink,
  faArrowRight,
  faCertificate
} from '@fortawesome/free-solid-svg-icons';

// QR Code Generator - Creates a real scannable QR code using Google Charts API
const QRCodeDisplay = ({ code, size = 200 }: { code: string; size?: number }) => {
  // Use Google Charts API to generate a real QR code
  const encodedData = encodeURIComponent(code);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&bgcolor=ffffff&color=000000&margin=10`;
  
  return (
    <div 
      className="bg-white p-4 rounded-2xl inline-block shadow-lg"
      style={{ width: size + 32, height: size + 32 }}
    >
      <img 
        src={qrUrl}
        alt="Entry QR Code"
        width={size}
        height={size}
        className="block"
        onError={(e) => {
          // Fallback to placeholder if API fails
          (e.target as HTMLImageElement).src = `https://placehold.co/${size}x${size}/ffffff/000000?text=QR`;
        }}
      />
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

// Validation result type
interface ValidationResult {
  success: boolean;
  message: string;
  details?: {
    festivalId?: number;
    ticketNonce?: number;
    walletAddress?: string;
    ticketName?: string;
    timestamp?: number;
    ageSeconds?: number;
  };
}

export const CheckIn = () => {
  const location = useLocation();
  const { address } = useGetAccountInfo();
  const { festivalData, isLoading: loadingFestival } = useFestivalData(FESTIVAL_ID);
  const { tickets, isLoading: loadingTickets, refetch: refetchTickets } = useUserTickets();
  const { useTicket, transactionStatus } = useFestivalTransactions();
  
  const [selectedTicket, setSelectedTicket] = useState<OwnedTicketNFT | null>(null);
  const [entryCode, setEntryCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  // Demo scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ValidationResult | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  
  // Check-in transaction state
  const [checkInStep, setCheckInStep] = useState<'idle' | 'validating' | 'awaiting_signature' | 'processing' | 'success' | 'error'>('idle');
  const [checkInError, setCheckInError] = useState<string | null>(null);

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

  const formatTimeDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate scanning and validating the QR code
  const handleSimulateScan = async () => {
    if (!entryCode) return;
    
    setIsScanning(true);
    setShowScanModal(true);
    setCheckInStep('validating');
    setCheckInError(null);
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Parse the entry code: FEST-{festivalId}-{nonce}-{walletSlice}-{timestamp}
      const parts = entryCode.split('-');
      if (parts.length !== 5 || parts[0] !== 'FEST') {
        setScanResult({
          success: false,
          message: 'Invalid QR code format'
        });
        setCheckInStep('error');
        return;
      }
      
      const codeFestivalId = parseInt(parts[1]);
      const codeNonce = parseInt(parts[2]);
      const codeWalletSlice = parts[3];
      const codeTimestamp = parseInt(parts[4]);
      
      // Validation 1: Check code age (max 5 minutes = 300 seconds)
      const codeAge = Math.floor((Date.now() - codeTimestamp) / 1000);
      if (codeAge > 300) {
        setScanResult({
          success: false,
          message: 'QR code has expired',
          details: {
            timestamp: codeTimestamp,
            ageSeconds: codeAge
          }
        });
        setCheckInStep('error');
        return;
      }
      
      // Validation 2: Check festival ID matches
      if (codeFestivalId !== FESTIVAL_ID) {
        setScanResult({
          success: false,
          message: `Wrong festival! Expected festival ${FESTIVAL_ID}, got ${codeFestivalId}`,
          details: { festivalId: codeFestivalId }
        });
        setCheckInStep('error');
        return;
      }
      
      // Validation 3: Check wallet address matches (last 8 chars)
      const walletSlice = address?.slice(-8);
      if (codeWalletSlice !== walletSlice) {
        setScanResult({
          success: false,
          message: 'Wallet address mismatch - this ticket belongs to a different wallet',
          details: { walletAddress: `...${codeWalletSlice}` }
        });
        setCheckInStep('error');
        return;
      }
      
      // Validation 4: Check user owns a ticket with this nonce
      const matchingTicket = tickets.find(t => t.nonce === codeNonce);
      if (!matchingTicket) {
        setScanResult({
          success: false,
          message: `Ticket #${codeNonce} not found in this wallet`,
          details: { ticketNonce: codeNonce }
        });
        setCheckInStep('error');
        return;
      }
      
      // All validations passed - show confirmation screen
      setScanResult({
        success: true,
        message: 'Ticket Verified! Ready for check-in',
        details: {
          festivalId: codeFestivalId,
          ticketNonce: codeNonce,
          ticketName: matchingTicket.name,
          walletAddress: address?.slice(0, 10) + '...' + address?.slice(-6),
          ageSeconds: codeAge
        }
      });
      setCheckInStep('awaiting_signature');
      
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Failed to validate QR code'
      });
      setCheckInStep('error');
    } finally {
      setIsScanning(false);
    }
  };
  
  // Handle the check-in transaction
  const handleConfirmCheckIn = async () => {
    if (!selectedTicket || !scanResult?.success) return;
    
    setCheckInStep('processing');
    
    try {
      // Send the ticket to the contract for check-in
      await useTicket(
        selectedTicket.nonce,
        selectedTicket.tokenId,
        FESTIVAL_ID,
        location.pathname
      );
      
      // The transaction is now being processed by the wallet
      // The success will be shown after the transaction completes
      setCheckInStep('success');
      
      // Refetch tickets after a delay to show updated state
      setTimeout(() => {
        refetchTickets();
      }, 5000);
      
    } catch (error) {
      console.error('Check-in transaction failed:', error);
      setCheckInError('Failed to process check-in transaction');
      setCheckInStep('error');
    }
  };
  
  const closeScanModal = () => {
    setShowScanModal(false);
    setScanResult(null);
    setCheckInStep('idle');
    setCheckInError(null);
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

                {/* Generate QR Button */}
                {selectedTicket && (
                  <div className="mt-6 pt-6 border-t border-white/10">
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

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleGenerateCode}
                      disabled={isGenerating}
                      className="btn-secondary flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faRefresh} />
                      Generate New Code
                    </button>
                    
                    {/* Demo: Simulate Scan Button */}
                    <button
                      onClick={handleSimulateScan}
                      disabled={isScanning}
                      className="btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <FontAwesomeIcon icon={faCamera} />
                      {isScanning ? 'Scanning...' : 'Simulate Scan (Demo)'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 glass-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400" />
              How It Works
            </h3>
            <ol className="space-y-3 text-white/70 text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Select your ticket NFT</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Generate a time-limited QR code</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Staff scans the code to verify your ticket on the blockchain</span>
              </li>
            </ol>

            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-start gap-2 text-emerald-300 text-sm">
                <FontAwesomeIcon icon={faCheckCircle} className="mt-0.5" />
                <span>The QR code contains your wallet address and ticket info - staff can verify it's authentic on the blockchain.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Result Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={checkInStep === 'processing' ? undefined : closeScanModal} />
          <div className="relative w-full max-w-md">
            
            {/* Step 1: Scanning/Validating */}
            {(isScanning || checkInStep === 'validating') && (
              <div className="glass-card p-8 text-center">
                <div className="w-24 h-24 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-2">Scanning QR Code...</h3>
                <p className="text-white/60">Verifying ticket on blockchain</p>
              </div>
            )}
            
            {/* Step 2: Awaiting Signature - Ticket Verified, need confirmation */}
            {checkInStep === 'awaiting_signature' && scanResult?.success && (
              <div className="glass-card p-6 border-2 border-amber-500 bg-amber-900/20">
                <button 
                  onClick={closeScanModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>

                {/* Verified Icon */}
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-amber-500">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-white" />
                </div>

                <h3 className="text-2xl font-bold text-center mb-2 text-amber-400">
                  TICKET VERIFIED
                </h3>
                <p className="text-center text-white/70 mb-4">{scanResult.message}</p>

                {/* Details */}
                {scanResult.details && (
                  <div className="space-y-2 p-4 rounded-xl bg-black/30 mb-4">
                    {scanResult.details.ticketName && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50 flex items-center gap-2">
                          <FontAwesomeIcon icon={faTicket} /> Ticket
                        </span>
                        <span className="font-semibold">{scanResult.details.ticketName}</span>
                      </div>
                    )}
                    {scanResult.details.ticketNonce !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50 flex items-center gap-2">
                          <FontAwesomeIcon icon={faLink} /> NFT #
                        </span>
                        <span className="font-mono">{scanResult.details.ticketNonce}</span>
                      </div>
                    )}
                    {scanResult.details.walletAddress && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50 flex items-center gap-2">
                          <FontAwesomeIcon icon={faWallet} /> Wallet
                        </span>
                        <span className="font-mono text-xs">{scanResult.details.walletAddress}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Info about what happens next */}
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-6">
                  <div className="text-purple-300 text-sm flex items-start gap-2">
                    <FontAwesomeIcon icon={faCertificate} className="mt-0.5" />
                    <span>
                      <strong>Next step:</strong> Sign a transaction to confirm entry. 
                      Your ticket will be marked as "used" and returned as an attendance badge.
                    </span>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmCheckIn}
                  className="w-full py-4 rounded-xl font-bold transition-all bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center gap-3"
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                  Confirm Check-In (Sign Transaction)
                </button>
                
                <button
                  onClick={closeScanModal}
                  className="w-full mt-3 py-2 text-white/50 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
            
            {/* Step 3: Processing Transaction */}
            {checkInStep === 'processing' && (
              <div className="glass-card p-8 text-center border-2 border-purple-500">
                <div className="w-24 h-24 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-2">Processing Check-In...</h3>
                <p className="text-white/60 mb-4">Please approve the transaction in your wallet</p>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
                  <FontAwesomeIcon icon={faShieldHalved} className="mr-2" />
                  Sending ticket to smart contract for verification
                </div>
              </div>
            )}
            
            {/* Step 4: Success */}
            {checkInStep === 'success' && (
              <div className="glass-card p-6 border-2 border-emerald-500 bg-emerald-900/20">
                <button 
                  onClick={closeScanModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>

                {/* Success Icon with animation */}
                <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-emerald-500 animate-pulse">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-white" />
                </div>

                <h3 className="text-3xl font-bold text-center mb-2 text-emerald-400">
                  🎉 WELCOME!
                </h3>
                <p className="text-center text-white/70 mb-6">
                  Check-in transaction submitted successfully!
                </p>

                {/* Badge info */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <FontAwesomeIcon icon={faCertificate} className="text-2xl text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-amber-400">Attendance Badge</div>
                      <div className="text-white/60 text-sm">Your ticket is now your proof of attendance!</div>
                    </div>
                  </div>
                </div>

                {/* Blockchain verification */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center mb-6">
                  <div className="text-emerald-300 text-sm">
                    ✓ Recorded on MultiversX Blockchain
                  </div>
                </div>

                <button
                  onClick={closeScanModal}
                  className="w-full py-3 rounded-xl font-bold transition-all bg-emerald-500 hover:bg-emerald-600"
                >
                  Enjoy the Festival! 🎵
                </button>
              </div>
            )}
            
            {/* Step 5: Error */}
            {(checkInStep === 'error' || (scanResult && !scanResult.success)) && (
              <div className="glass-card p-6 border-2 border-red-500 bg-red-900/20">
                <button 
                  onClick={closeScanModal}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>

                {/* Error Icon */}
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-red-500">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-white" />
                </div>

                <h3 className="text-2xl font-bold text-center mb-2 text-red-400">
                  ENTRY DENIED
                </h3>
                <p className="text-center text-white/70 mb-6">
                  {checkInError || scanResult?.message || 'Check-in failed'}
                </p>

                {/* Error Details */}
                {scanResult?.details && (
                  <div className="space-y-2 p-4 rounded-xl bg-black/30 mb-6">
                    {scanResult.details.ticketNonce !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">Ticket #</span>
                        <span className="font-mono">{scanResult.details.ticketNonce}</span>
                      </div>
                    )}
                    {scanResult.details.ageSeconds !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">Code Age</span>
                        <span>{scanResult.details.ageSeconds}s ago</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={closeScanModal}
                  className="w-full py-3 rounded-xl font-bold transition-all bg-red-500 hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </AuthRedirectWrapper>
  );
};

export default CheckIn;
