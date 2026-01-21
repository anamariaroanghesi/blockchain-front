import { useState, useCallback } from 'react';
import {
  deleteTransactionToast,
  removeAllSignedTransactions,
  removeAllTransactionsToSign
} from '@multiversx/sdk-dapp/services/transactions/clearTransactions';
import { contractAddress, FESTIVAL_ID } from 'config';
import { signAndSendTransactions } from 'helpers/signAndSendTransactions';
import {
  useGetAccountInfo,
  useGetNetworkConfig,
  useTrackTransactionStatus
} from 'hooks/sdkDappHooks';
import { GAS_PRICE, VERSION } from 'localConstants';
import { getChainId } from 'utils/getChainId';
import { smartContract } from 'utils/smartContract';
import { Address, TokenTransfer } from 'utils/sdkDappCore';
import { newTransaction } from 'helpers/sdkDappHelpers';
import { egldToWei } from 'types/festival.types';

const SESSION_KEY_BUY_TICKET = 'festival_buyTicket';
const SESSION_KEY_PARTICIPANT = 'festival_createParticipant';
const SESSION_KEY_CHECKIN = 'festival_checkIn';
const SESSION_KEY_CHECKOUT = 'festival_checkOut';
const SESSION_KEY_PUT_FOR_SALE = 'festival_putForSale';
const SESSION_KEY_BUY_RESALE = 'festival_buyResale';
const SESSION_KEY_CLAIM_FLASH = 'festival_claimFlash';

const BUY_TICKET_INFO = {
  processingMessage: 'Processing ticket purchase...',
  errorMessage: 'Ticket purchase failed',
  successMessage: 'Ticket purchased successfully! 🎫'
};

const CREATE_PARTICIPANT_INFO = {
  processingMessage: 'Creating participant profile...',
  errorMessage: 'Failed to create participant',
  successMessage: 'Participant profile created! ✅'
};

const CHECK_IN_INFO = {
  processingMessage: 'Checking in to festival...',
  errorMessage: 'Check-in failed',
  successMessage: 'Successfully checked in! 🎉'
};

const CHECK_OUT_INFO = {
  processingMessage: 'Checking out from festival...',
  errorMessage: 'Check-out failed',
  successMessage: 'Successfully checked out!'
};

const PUT_FOR_SALE_INFO = {
  processingMessage: 'Listing ticket for sale...',
  errorMessage: 'Failed to list ticket',
  successMessage: 'Ticket listed for sale! 💰'
};

const BUY_RESALE_INFO = {
  processingMessage: 'Purchasing resale ticket...',
  errorMessage: 'Resale purchase failed',
  successMessage: 'Resale ticket purchased! 🎫'
};

const CLAIM_FLASH_INFO = {
  processingMessage: 'Claiming flash event points...',
  errorMessage: 'Failed to claim points',
  successMessage: 'Flash event points claimed! ⚡'
};

/**
 * Hook for festival transaction operations
 */
export const useFestivalTransactions = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { network } = useGetNetworkConfig();
  const { address, account } = useGetAccountInfo();

  const transactionStatus = useTrackTransactionStatus({
    transactionId: sessionId ?? '0'
  });

  const clearAllTransactions = useCallback(() => {
    removeAllSignedTransactions();
    removeAllTransactionsToSign();
    if (sessionId) {
      deleteTransactionToast(sessionId);
    }
  }, [sessionId]);

  /**
   * Buy a ticket from the festival
   */
  const buyTicket = useCallback(
    async (
      festivalId: number,
      ticketPriceName: string,
      amountEgld: string,
      callbackRoute: string
    ) => {
      clearAllTransactions();

      // Convert ticket name to hex
      const ticketNameHex = Buffer.from(ticketPriceName).toString('hex');

      const transaction = newTransaction({
        value: egldToWei(amountEgld),
        data: `buyTicket@${festivalId.toString(16).padStart(16, '0')}@${ticketNameHex}`,
        receiver: contractAddress,
        gasLimit: 20000000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: BUY_TICKET_INFO
      });

      sessionStorage.setItem(SESSION_KEY_BUY_TICKET, newSessionId);
      setSessionId(newSessionId);
      return newSessionId;
    },
    [address, account.nonce, network.chainId, clearAllTransactions]
  );

  /**
   * Create a participant profile
   */
  const createParticipant = useCallback(
    async (username: string, callbackRoute: string) => {
      clearAllTransactions();

      const usernameHex = Buffer.from(username).toString('hex');

      const transaction = newTransaction({
        value: '0',
        data: `createParticipant@${usernameHex}`,
        receiver: contractAddress,
        gasLimit: 10000000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: CREATE_PARTICIPANT_INFO
      });

      sessionStorage.setItem(SESSION_KEY_PARTICIPANT, newSessionId);
      setSessionId(newSessionId);
      return newSessionId;
    },
    [address, account.nonce, network.chainId, clearAllTransactions]
  );

  /**
   * Check in to the festival
   */
  const checkIn = useCallback(
    async (festivalId: number = FESTIVAL_ID, callbackRoute: string) => {
      clearAllTransactions();

      const transaction = newTransaction({
        value: '0',
        data: `checkIn@${festivalId.toString(16).padStart(16, '0')}`,
        receiver: contractAddress,
        gasLimit: 10000000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: CHECK_IN_INFO
      });

      sessionStorage.setItem(SESSION_KEY_CHECKIN, newSessionId);
      setSessionId(newSessionId);
      return newSessionId;
    },
    [address, account.nonce, network.chainId, clearAllTransactions]
  );

  /**
   * Check out from the festival
   */
  const checkOut = useCallback(
    async (festivalId: number = FESTIVAL_ID, callbackRoute: string) => {
      clearAllTransactions();

      const transaction = newTransaction({
        value: '0',
        data: `checkOut@${festivalId.toString(16).padStart(16, '0')}`,
        receiver: contractAddress,
        gasLimit: 10000000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: CHECK_OUT_INFO
      });

      sessionStorage.setItem(SESSION_KEY_CHECKOUT, newSessionId);
      setSessionId(newSessionId);
      return newSessionId;
    },
    [address, account.nonce, network.chainId, clearAllTransactions]
  );

  /**
   * Put a ticket up for resale
   * @param festivalId - The festival ID
   * @param ticketNonce - The NFT nonce of the ticket
   * @param tokenIdentifier - The token identifier (e.g., "FEST-abc123")
   * @param priceEgld - The price in EGLD
   */
  const putTicketForSale = useCallback(
    async (
      festivalId: number,
      ticketNonce: number,
      tokenIdentifier: string,
      priceEgld: string,
      callbackRoute: string
    ) => {
      clearAllTransactions();

      // For ESDT/NFT transfer, we need to use ESDTNFTTransfer
      // Format: ESDTNFTTransfer@tokenId@nonce@amount@destAddress@funcName@args...
      const tokenIdHex = Buffer.from(tokenIdentifier).toString('hex');
      const nonceHex = ticketNonce.toString(16).padStart(16, '0');
      const amountHex = '01'; // 1 NFT
      const destHex = new Address(contractAddress).hex();
      const funcHex = Buffer.from('putTicketForSale').toString('hex');
      const festivalIdHex = festivalId.toString(16).padStart(16, '0');
      const priceHex = BigInt(egldToWei(priceEgld)).toString(16);

      const transaction = newTransaction({
        value: '0',
        data: `ESDTNFTTransfer@${tokenIdHex}@${nonceHex}@${amountHex}@${destHex}@${funcHex}@${festivalIdHex}@${priceHex}`,
        receiver: address, // For ESDTNFTTransfer, receiver is sender
        gasLimit: 20000000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: PUT_FOR_SALE_INFO
      });

      sessionStorage.setItem(SESSION_KEY_PUT_FOR_SALE, newSessionId);
      setSessionId(newSessionId);
      return newSessionId;
    },
    [address, account.nonce, network.chainId, clearAllTransactions]
  );

  /**
   * Buy a resale ticket
   */
  const buyResaleTicket = useCallback(
    async (ticketNonce: number, amountEgld: string, callbackRoute: string) => {
      clearAllTransactions();

      const transaction = newTransaction({
        value: egldToWei(amountEgld),
        data: `buyResaleTicket@${ticketNonce.toString(16).padStart(16, '0')}`,
        receiver: contractAddress,
        gasLimit: 20000000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: BUY_RESALE_INFO
      });

      sessionStorage.setItem(SESSION_KEY_BUY_RESALE, newSessionId);
      setSessionId(newSessionId);
      return newSessionId;
    },
    [address, account.nonce, network.chainId, clearAllTransactions]
  );

  /**
   * Claim flash event points
   */
  const claimFlashEventPoints = useCallback(
    async (
      festivalId: number,
      flashEventIndex: number,
      callbackRoute: string
    ) => {
      clearAllTransactions();

      const transaction = newTransaction({
        value: '0',
        data: `claimFlashEventPoints@${festivalId.toString(16).padStart(16, '0')}@${flashEventIndex.toString(16).padStart(8, '0')}`,
        receiver: contractAddress,
        gasLimit: 10000000,
        gasPrice: GAS_PRICE,
        chainID: network.chainId,
        nonce: account.nonce,
        sender: address,
        version: VERSION
      });

      const newSessionId = await signAndSendTransactions({
        transactions: [transaction],
        callbackRoute,
        transactionsDisplayInfo: CLAIM_FLASH_INFO
      });

      sessionStorage.setItem(SESSION_KEY_CLAIM_FLASH, newSessionId);
      setSessionId(newSessionId);
      return newSessionId;
    },
    [address, account.nonce, network.chainId, clearAllTransactions]
  );

  return {
    buyTicket,
    createParticipant,
    checkIn,
    checkOut,
    putTicketForSale,
    buyResaleTicket,
    claimFlashEventPoints,
    transactionStatus,
    sessionId
  };
};

export default useFestivalTransactions;

