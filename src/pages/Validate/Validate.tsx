import { useState } from 'react';
import { AuthRedirectWrapper } from 'wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQrcode,
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faTicket,
  faUser,
  faCalendar,
  faMapMarkerAlt,
  faShieldHalved,
  faCamera,
  faKeyboard,
  faHistory,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { mockOwnedTickets } from 'data/mockEvents';
import { OwnedTicket, TicketValidation } from 'types/ticket.types';

const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

// Simulated validation history
const validationHistory: TicketValidation[] = [
  {
    ticketId: 'TICKET-a1b2c3-01',
    isValid: true,
    eventName: 'Electric Dreams Festival 2026',
    ticketType: 'VIP Experience',
    ownerAddress: 'erd1qqqqqqqqqqqqqpgq...',
    validationTime: '2026-01-19T14:30:00'
  },
  {
    ticketId: 'TICKET-invalid-99',
    isValid: false,
    eventName: 'Unknown Event',
    ticketType: 'Unknown',
    ownerAddress: '',
    validationTime: '2026-01-19T14:25:00',
    errorMessage: 'Ticket not found on blockchain'
  }
];

export const Validate = () => {
  const [inputMode, setInputMode] = useState<'manual' | 'scan'>('manual');
  const [ticketId, setTicketId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<TicketValidation | null>(null);
  const [history, setHistory] = useState<TicketValidation[]>(validationHistory);

  const handleValidate = async () => {
    if (!ticketId.trim()) return;
    
    setIsValidating(true);
    setValidationResult(null);
    
    // Simulate blockchain validation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if ticket exists in mock data
    const foundTicket = mockOwnedTickets.find(t => 
      t.tokenId.toLowerCase() === ticketId.toLowerCase() || 
      t.id === ticketId
    );
    
    const result: TicketValidation = foundTicket 
      ? {
          ticketId: foundTicket.tokenId,
          isValid: !foundTicket.isUsed,
          eventName: foundTicket.eventName,
          ticketType: foundTicket.ticketType,
          ownerAddress: 'erd1qqqqqqqqqqqqqpgq8tq5rulzxzje29v8kzmcxx9pgx6kmevmep6qckwthl',
          validationTime: new Date().toISOString(),
          errorMessage: foundTicket.isUsed ? 'Ticket has already been used' : undefined
        }
      : {
          ticketId: ticketId,
          isValid: false,
          eventName: 'Unknown',
          ticketType: 'Unknown',
          ownerAddress: '',
          validationTime: new Date().toISOString(),
          errorMessage: 'Ticket not found on blockchain'
        };
    
    setValidationResult(result);
    setHistory([result, ...history]);
    setIsValidating(false);
  };

  const handleMarkAsUsed = () => {
    if (validationResult && validationResult.isValid) {
      // In production, this would call the smart contract
      alert('Ticket marked as used on the blockchain!');
      setValidationResult({
        ...validationResult,
        isValid: false,
        errorMessage: 'Ticket has been marked as used'
      });
    }
  };

  return (
    <AuthRedirectWrapper>
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faShieldHalved} className="text-4xl text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Ticket <span className="gradient-text">Validation</span>
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Verify NFT tickets on the blockchain instantly. 
              Scan QR codes or enter ticket IDs manually.
            </p>
          </div>

          {/* Input Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setInputMode('manual')}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                  inputMode === 'manual'
                    ? 'bg-purple-500 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={faKeyboard} />
                Manual Entry
              </button>
              <button
                onClick={() => setInputMode('scan')}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                  inputMode === 'scan'
                    ? 'bg-purple-500 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={faCamera} />
                Scan QR
              </button>
            </div>
          </div>

          {/* Validation Input */}
          <div className="glass-card p-8 mb-8">
            {inputMode === 'manual' ? (
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Enter Ticket ID or Token ID
                </label>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <FontAwesomeIcon 
                      icon={faTicket} 
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    />
                    <input
                      type="text"
                      placeholder="TICKET-a1b2c3-01"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                      className="input-field pl-12 text-lg"
                    />
                  </div>
                  <button
                    onClick={handleValidate}
                    disabled={isValidating || !ticketId.trim()}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    ) : (
                      <FontAwesomeIcon icon={faSearch} />
                    )}
                    Validate
                  </button>
                </div>
                <p className="text-white/40 text-sm mt-2">
                  Try: <button 
                    onClick={() => setTicketId('TICKET-a1b2c3-01')} 
                    className="text-purple-400 hover:underline"
                  >
                    TICKET-a1b2c3-01
                  </button> (valid) or <button 
                    onClick={() => setTicketId('TICKET-g7h8i9-03')} 
                    className="text-purple-400 hover:underline"
                  >
                    TICKET-g7h8i9-03
                  </button> (used)
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-64 h-64 mx-auto rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center bg-white/5">
                  <FontAwesomeIcon icon={faQrcode} className="text-6xl text-white/30 mb-4" />
                  <p className="text-white/50">Camera access required</p>
                  <p className="text-white/30 text-sm mt-2">Point camera at QR code</p>
                </div>
                <p className="text-white/40 text-sm mt-4">
                  Camera-based QR scanning would be implemented in production using a library like react-qr-reader
                </p>
              </div>
            )}
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className={`glass-card p-8 mb-8 border-2 animate-slide-up ${
              validationResult.isValid 
                ? 'border-emerald-500/50 bg-emerald-500/5' 
                : 'border-red-500/50 bg-red-500/5'
            }`}>
              <div className="flex items-start gap-6">
                {/* Status Icon */}
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  validationResult.isValid 
                    ? 'bg-emerald-500/20' 
                    : 'bg-red-500/20'
                }`}>
                  <FontAwesomeIcon 
                    icon={validationResult.isValid ? faCheckCircle : faTimesCircle} 
                    className={`text-4xl ${
                      validationResult.isValid ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold mb-2 ${
                    validationResult.isValid ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {validationResult.isValid ? 'Valid Ticket' : 'Invalid Ticket'}
                  </h3>
                  
                  {validationResult.errorMessage && (
                    <p className="text-red-300 mb-4">{validationResult.errorMessage}</p>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-white/5">
                      <div className="text-white/50 text-xs mb-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faTicket} />
                        Event
                      </div>
                      <div className="font-medium">{validationResult.eventName}</div>
                      <div className="text-white/50 text-sm">{validationResult.ticketType}</div>
                    </div>

                    {validationResult.ownerAddress && (
                      <div className="p-3 rounded-xl bg-white/5">
                        <div className="text-white/50 text-xs mb-1 flex items-center gap-2">
                          <FontAwesomeIcon icon={faUser} />
                          Owner
                        </div>
                        <div className="font-mono text-sm">
                          {formatAddress(validationResult.ownerAddress)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 mb-4">
                    <div className="text-white/50 text-xs mb-1">Token ID</div>
                    <div className="font-mono text-sm">{validationResult.ticketId}</div>
                  </div>

                  {validationResult.isValid && (
                    <button
                      onClick={handleMarkAsUsed}
                      className="btn-success flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Mark as Used (Allow Entry)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Validation History */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faHistory} className="text-purple-400" />
              Recent Validations
            </h3>

            {history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 5).map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.isValid ? 'bg-emerald-500/20' : 'bg-red-500/20'
                    }`}>
                      <FontAwesomeIcon 
                        icon={item.isValid ? faCheckCircle : faTimesCircle}
                        className={item.isValid ? 'text-emerald-400' : 'text-red-400'}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.eventName}</div>
                      <div className="text-white/50 text-sm font-mono">{item.ticketId}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className={item.isValid ? 'text-emerald-400' : 'text-red-400'}>
                        {item.isValid ? 'Valid' : 'Invalid'}
                      </div>
                      <div className="text-white/40 text-xs">
                        {item.validationTime && new Date(item.validationTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/50">
                No validation history yet
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthRedirectWrapper>
  );
};

export default Validate;

