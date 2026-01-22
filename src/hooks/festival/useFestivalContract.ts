import { useState, useEffect, useCallback } from 'react';
import { contractAddress, API_URL, FESTIVAL_ID } from 'config';
import { 
  FestivalData, 
  TicketPrice, 
  FestivalEvent, 
  FestivalProduct,
  weiToEgld 
} from 'types/festival.types';

// ========================================================
// BINARY PARSER (Based on working Gemini implementation)
// ========================================================
const BinaryParser = {
  // Convert Base64 to Uint8Array
  fromBase64: (base64: string): Uint8Array => {
    if (!base64) return new Uint8Array(0);
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch {
      return new Uint8Array(0);
    }
  },

  // Read a String (prefixed by 4-byte length)
  readString: (buffer: Uint8Array, offset: number): { value: string; newOffset: number } => {
    if (offset >= buffer.length) return { value: '', newOffset: offset };
    const length = (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3];
    offset += 4;
    let str = '';
    for (let i = 0; i < length; i++) {
      str += String.fromCharCode(buffer[offset + i]);
    }
    return { value: str, newOffset: offset + length };
  },

  // Read a BigUint (prefixed by 4-byte length)
  readBigInt: (buffer: Uint8Array, offset: number): { value: bigint; newOffset: number } => {
    if (offset >= buffer.length) return { value: BigInt(0), newOffset: offset };
    const length = (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3];
    offset += 4;
    let hex = '0x';
    for (let i = 0; i < length; i++) {
      let h = buffer[offset + i].toString(16);
      if (h.length === 1) h = '0' + h;
      hex += h;
    }
    return { value: hex === '0x' ? BigInt(0) : BigInt(hex), newOffset: offset + length };
  },

  // Read a 64-bit Integer (8 bytes, Big Endian)
  readU64: (buffer: Uint8Array, offset: number): { value: number; newOffset: number } => {
    if (offset + 8 > buffer.length) return { value: 0, newOffset: offset };
    const view = new DataView(buffer.buffer, buffer.byteOffset + offset, 8);
    const value = Number(view.getBigUint64(0, false)); // Big Endian
    return { value, newOffset: offset + 8 };
  },

  // Read a single byte (u8)
  readU8: (buffer: Uint8Array, offset: number): { value: number; newOffset: number } => {
    if (offset >= buffer.length) return { value: 0, newOffset: offset };
    return { value: buffer[offset], newOffset: offset + 1 };
  }
};

/**
 * Convert festival ID to hex string for API args
 */
const toHexArg = (num: number): string => {
  let hex = num.toString(16);
  if (hex.length % 2 !== 0) hex = '0' + hex;
  return hex;
};

/**
 * Hook to fetch festival data from the smart contract
 */
export const useFestivalData = (festivalId: number = FESTIVAL_ID) => {
  const [festivalData, setFestivalData] = useState<FestivalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFestivalData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scAddress: contractAddress,
          funcName: 'getFestivalData',
          args: [toHexArg(festivalId)]
        })
      });

      const json = await response.json();
      console.log('Festival data response:', json);
      
      // The contract returns ONE packed buffer
      const packedData = json.returnData ? json.returnData[0] : null;
      if (!packedData) {
        setFestivalData(null);
        setError('Festival not found');
        return;
      }

      // Parse the packed binary data
      // Contract returns: (id, name, start, end, max, sold, inside)
      const buffer = BinaryParser.fromBase64(packedData);
      let offset = 0;

      // 1. ID (u64)
      const idRes = BinaryParser.readU64(buffer, offset);
      offset = idRes.newOffset;

      // 2. Name (ManagedBuffer - has length prefix)
      const nameRes = BinaryParser.readString(buffer, offset);
      offset = nameRes.newOffset;

      // 3. Start Time (u64)
      const startRes = BinaryParser.readU64(buffer, offset);
      offset = startRes.newOffset;

      // 4. End Time (u64)
      const endRes = BinaryParser.readU64(buffer, offset);
      offset = endRes.newOffset;

      // 5. Max Tickets (u64)
      const maxRes = BinaryParser.readU64(buffer, offset);
      offset = maxRes.newOffset;

      // 6. Sold (u64)
      const soldRes = BinaryParser.readU64(buffer, offset);
      offset = soldRes.newOffset;

      // 7. Inside (u64)
      const insideRes = BinaryParser.readU64(buffer, offset);

      console.log('Decoded festival:', {
        id: idRes.value,
        name: nameRes.value,
        startTime: startRes.value,
        endTime: endRes.value,
        maxTickets: maxRes.value,
        soldTickets: soldRes.value,
        insideCount: insideRes.value
      });

      setFestivalData({
        id: idRes.value || festivalId,
        name: nameRes.value || 'Unknown Festival',
        startTime: startRes.value,
        endTime: endRes.value,
        maxTickets: maxRes.value,
        soldTickets: soldRes.value,
        insideCount: insideRes.value
      });
    } catch (err) {
      console.error('Error fetching festival data:', err);
      setError('Failed to fetch festival data');
      setFestivalData(null);
    } finally {
      setIsLoading(false);
    }
  }, [festivalId]);

  useEffect(() => {
    fetchFestivalData();
  }, [fetchFestivalData]);

  return { festivalData, isLoading, error, refetch: fetchFestivalData };
};

/**
 * Hook to fetch ticket prices from the smart contract
 */
export const useTicketPrices = (festivalId: number = FESTIVAL_ID) => {
  const [ticketPrices, setTicketPrices] = useState<TicketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicketPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scAddress: contractAddress,
          funcName: 'getTicketPrices',
          args: [toHexArg(festivalId)]
        })
      });

      const json = await response.json();
      console.log('Ticket prices response:', json);
      
      const rawData = json.returnData || [];
      const prices: TicketPrice[] = [];

      // Each item in rawData is a packed tuple
      for (const item of rawData) {
        const buffer = BinaryParser.fromBase64(item);
        let offset = 0;

        // 1. Name (ManagedBuffer)
        const nameRes = BinaryParser.readString(buffer, offset);
        offset = nameRes.newOffset;

        // 2. Phase (ManagedBuffer)
        const phaseRes = BinaryParser.readString(buffer, offset);
        offset = phaseRes.newOffset;

        // 3. Price (BigUint)
        const priceRes = BinaryParser.readBigInt(buffer, offset);
        offset = priceRes.newOffset;

        // 4. Sale Start (u64)
        const saleStartRes = BinaryParser.readU64(buffer, offset);
        offset = saleStartRes.newOffset;

        // 5. Sale End (u64)
        const saleEndRes = BinaryParser.readU64(buffer, offset);
        offset = saleEndRes.newOffset;

        // 6. Ticket Type (u8)
        const typeRes = BinaryParser.readU8(buffer, offset);

        const priceWei = priceRes.value.toString();

        console.log('Decoded ticket price:', {
          name: nameRes.value,
          phase: phaseRes.value,
          priceWei,
          saleStart: saleStartRes.value,
          saleEnd: saleEndRes.value,
          ticketType: typeRes.value
        });

        if (nameRes.value) {
          prices.push({
            name: nameRes.value,
            phase: phaseRes.value,
            price: priceWei,
            priceDisplay: weiToEgld(priceWei),
            saleStart: saleStartRes.value,
            saleEnd: saleEndRes.value,
            ticketType: typeRes.value
          });
        }
      }
      
      setTicketPrices(prices);
    } catch (err) {
      console.error('Error fetching ticket prices:', err);
      setError('Failed to fetch ticket prices');
      setTicketPrices([]);
    } finally {
      setIsLoading(false);
    }
  }, [festivalId]);

  useEffect(() => {
    fetchTicketPrices();
  }, [fetchTicketPrices]);

  return { ticketPrices, isLoading, error, refetch: fetchTicketPrices };
};

/**
 * Hook to fetch events within a festival
 */
export const useFestivalEvents = (festivalId: number = FESTIVAL_ID) => {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scAddress: contractAddress,
          funcName: 'getEventsForFestival',
          args: [toHexArg(festivalId)]
        })
      });

      const json = await response.json();
      console.log('Events response:', json);
      
      const rawData = json.returnData || [];
      const fetchedEvents: FestivalEvent[] = [];

      // Each item is a packed tuple: (name, location, start_time, end_time)
      for (const item of rawData) {
        const buffer = BinaryParser.fromBase64(item);
        let offset = 0;

        // 1. Name (ManagedBuffer)
        const nameRes = BinaryParser.readString(buffer, offset);
        offset = nameRes.newOffset;

        // 2. Location (ManagedBuffer)
        const locationRes = BinaryParser.readString(buffer, offset);
        offset = locationRes.newOffset;

        // 3. Start Time (u64)
        const startRes = BinaryParser.readU64(buffer, offset);
        offset = startRes.newOffset;

        // 4. End Time (u64)
        const endRes = BinaryParser.readU64(buffer, offset);

        if (nameRes.value) {
          fetchedEvents.push({
            name: nameRes.value,
            location: locationRes.value,
            startTime: startRes.value,
            endTime: endRes.value
          });
        }
      }
      
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [festivalId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents };
};

/**
 * Hook to fetch products within a festival
 * Contract: getProducts returns (product_id, name, price, description, image_url)
 */
export const useFestivalProducts = (festivalId: number = FESTIVAL_ID) => {
  const [products, setProducts] = useState<FestivalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scAddress: contractAddress,
          funcName: 'getProducts',
          args: [toHexArg(festivalId)]
        })
      });

      const json = await response.json();
      console.log('Products response:', json);
      
      const rawData = json.returnData || [];
      const fetchedProducts: FestivalProduct[] = [];

      // Each item is a packed tuple: (product_id, name, price, description, image_url)
      for (const item of rawData) {
        const buffer = BinaryParser.fromBase64(item);
        let offset = 0;

        // 1. Product ID (u64)
        const idRes = BinaryParser.readU64(buffer, offset);
        offset = idRes.newOffset;

        // 2. Name (ManagedBuffer)
        const nameRes = BinaryParser.readString(buffer, offset);
        offset = nameRes.newOffset;

        // 3. Price (BigUint)
        const priceRes = BinaryParser.readBigInt(buffer, offset);
        offset = priceRes.newOffset;

        // 4. Description (ManagedBuffer)
        const descRes = BinaryParser.readString(buffer, offset);
        offset = descRes.newOffset;

        // 5. Image URL (ManagedBuffer)
        const imageRes = BinaryParser.readString(buffer, offset);

        const priceWei = priceRes.value.toString();

        console.log('Decoded product:', {
          productId: idRes.value,
          name: nameRes.value,
          priceWei,
          description: descRes.value,
          imageUrl: imageRes.value
        });

        if (nameRes.value) {
          fetchedProducts.push({
            productId: idRes.value,
            name: nameRes.value,
            price: priceWei,
            priceDisplay: weiToEgld(priceWei),
            description: descRes.value,
            imageUrl: imageRes.value
          });
        }
      }
      
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [festivalId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
};

/**
 * Hook to fetch ALL festivals from the smart contract
 */
export const useAllFestivals = () => {
  const [festivals, setFestivals] = useState<FestivalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllFestivals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allFestivals: FestivalData[] = [];
      
      // Try fetching festivals 1-10 (adjust max if needed)
      for (let id = 1; id <= 10; id++) {
        try {
          const response = await fetch(`${API_URL}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scAddress: contractAddress,
              funcName: 'getFestivalData',
              args: [toHexArg(id)]
            })
          });

          const json = await response.json();
          const packedData = json.returnData ? json.returnData[0] : null;
          
          if (!packedData) continue; // No festival at this ID
          
          const buffer = BinaryParser.fromBase64(packedData);
          if (buffer.length === 0) continue;
          
          // Contract returns: (id, name, start, end, max, sold, inside)
          let offset = 0;
          
          // 1. ID (u64)
          const idRes = BinaryParser.readU64(buffer, offset);
          offset = idRes.newOffset;
          
          // 2. Name (ManagedBuffer)
          const nameRes = BinaryParser.readString(buffer, offset);
          offset = nameRes.newOffset;
          
          // Skip if no name (invalid festival)
          if (!nameRes.value) continue;
          
          // 3-7: start, end, max, sold, inside (all u64)
          const startRes = BinaryParser.readU64(buffer, offset);
          offset = startRes.newOffset;
          const endRes = BinaryParser.readU64(buffer, offset);
          offset = endRes.newOffset;
          const maxRes = BinaryParser.readU64(buffer, offset);
          offset = maxRes.newOffset;
          const soldRes = BinaryParser.readU64(buffer, offset);
          offset = soldRes.newOffset;
          const insideRes = BinaryParser.readU64(buffer, offset);

          allFestivals.push({
            id: idRes.value || id,
            name: nameRes.value,
            startTime: startRes.value,
            endTime: endRes.value,
            maxTickets: maxRes.value,
            soldTickets: soldRes.value,
            insideCount: insideRes.value
          });
        } catch (err) {
          // Skip this ID if there's an error
          continue;
        }
      }
      
      // Sort by ID in decreasing order (newest first)
      allFestivals.sort((a, b) => b.id - a.id);
      
      setFestivals(allFestivals);
    } catch (err) {
      console.error('Error fetching all festivals:', err);
      setError('Failed to fetch festivals');
      setFestivals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllFestivals();
  }, [fetchAllFestivals]);

  return { festivals, isLoading, error, refetch: fetchAllFestivals };
};

export default useFestivalData;
