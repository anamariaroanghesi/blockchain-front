import { useState, useEffect, useCallback } from 'react';
import { contractAddress, API_URL, FESTIVAL_ID } from 'config';
import { 
  FestivalData, 
  TicketPrice, 
  FestivalEvent, 
  weiToEgld 
} from 'types/festival.types';

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
      // Query contract via MultiversX API
      const response = await fetch(
        `${API_URL}/vm-values/query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scAddress: contractAddress,
            funcName: 'getFestivalData',
            args: [festivalId.toString(16).padStart(16, '0')]
          })
        }
      );

      const result = await response.json();
      
      if (result.data?.data?.returnData && result.data.data.returnData.length > 0) {
        // Decode the response - it returns a tuple
        const returnData = result.data.data.returnData;
        
        // Parse the hex-encoded values
        const name = Buffer.from(returnData[0] || '', 'base64').toString('utf8');
        const startTime = parseInt(Buffer.from(returnData[1] || '', 'base64').toString('hex') || '0', 16);
        const endTime = parseInt(Buffer.from(returnData[2] || '', 'base64').toString('hex') || '0', 16);
        const maxTickets = parseInt(Buffer.from(returnData[3] || '', 'base64').toString('hex') || '0', 16);
        const soldTickets = parseInt(Buffer.from(returnData[4] || '', 'base64').toString('hex') || '0', 16);
        const insideCount = parseInt(Buffer.from(returnData[5] || '', 'base64').toString('hex') || '0', 16);

        setFestivalData({
          id: festivalId,
          name: name || 'Festival',
          startTime,
          endTime,
          maxTickets,
          soldTickets,
          insideCount
        });
      } else {
        // Use default/mock data if contract returns empty
        setFestivalData({
          id: festivalId,
          name: 'Electric Dreams Festival 2026',
          startTime: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
          endTime: Math.floor(Date.now() / 1000) + 86400 * 33, // 33 days from now
          maxTickets: 10000,
          soldTickets: 0,
          insideCount: 0
        });
      }
    } catch (err) {
      console.error('Error fetching festival data:', err);
      setError('Failed to fetch festival data');
      // Set default data on error
      setFestivalData({
        id: festivalId,
        name: 'Electric Dreams Festival 2026',
        startTime: Math.floor(Date.now() / 1000) + 86400 * 30,
        endTime: Math.floor(Date.now() / 1000) + 86400 * 33,
        maxTickets: 10000,
        soldTickets: 0,
        insideCount: 0
      });
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
      const response = await fetch(
        `${API_URL}/vm-values/query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scAddress: contractAddress,
            funcName: 'getTicketPrices',
            args: [festivalId.toString(16).padStart(16, '0')]
          })
        }
      );

      const result = await response.json();
      
      if (result.data?.data?.returnData && result.data.data.returnData.length > 0) {
        // Parse ticket prices from return data
        const prices: TicketPrice[] = [];
        const returnData = result.data.data.returnData;
        
        // Each ticket price is a tuple of (name, phase, price)
        // The exact parsing depends on how the contract encodes the multi-value
        for (let i = 0; i < returnData.length; i += 3) {
          if (returnData[i] && returnData[i + 1] && returnData[i + 2]) {
            const name = Buffer.from(returnData[i], 'base64').toString('utf8');
            const phase = Buffer.from(returnData[i + 1], 'base64').toString('utf8');
            const priceHex = Buffer.from(returnData[i + 2], 'base64').toString('hex');
            const priceWei = BigInt('0x' + (priceHex || '0')).toString();
            
            prices.push({
              name,
              phase,
              price: priceWei,
              priceDisplay: weiToEgld(priceWei)
            });
          }
        }
        
        if (prices.length > 0) {
          setTicketPrices(prices);
        } else {
          // Set default prices if none found
          setDefaultPrices();
        }
      } else {
        setDefaultPrices();
      }
    } catch (err) {
      console.error('Error fetching ticket prices:', err);
      setError('Failed to fetch ticket prices');
      setDefaultPrices();
    } finally {
      setIsLoading(false);
    }
  }, [festivalId]);

  const setDefaultPrices = () => {
    setTicketPrices([
      { 
        name: 'General Admission', 
        phase: 'Early Bird', 
        price: '50000000000000000', // 0.05 EGLD
        priceDisplay: '0.0500' 
      },
      { 
        name: 'VIP', 
        phase: 'Early Bird', 
        price: '100000000000000000', // 0.1 EGLD
        priceDisplay: '0.1000' 
      },
      { 
        name: 'Backstage', 
        phase: 'Early Bird', 
        price: '250000000000000000', // 0.25 EGLD
        priceDisplay: '0.2500' 
      }
    ]);
  };

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
      const response = await fetch(
        `${API_URL}/vm-values/query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scAddress: contractAddress,
            funcName: 'getEvents',
            args: [festivalId.toString(16).padStart(16, '0')]
          })
        }
      );

      const result = await response.json();
      
      if (result.data?.data?.returnData && result.data.data.returnData.length > 0) {
        const fetchedEvents: FestivalEvent[] = [];
        const returnData = result.data.data.returnData;
        
        // Each event is (name, location, start_time, end_time)
        for (let i = 0; i < returnData.length; i += 4) {
          if (returnData[i]) {
            const name = Buffer.from(returnData[i], 'base64').toString('utf8');
            const location = Buffer.from(returnData[i + 1] || '', 'base64').toString('utf8');
            const startHex = Buffer.from(returnData[i + 2] || '', 'base64').toString('hex');
            const endHex = Buffer.from(returnData[i + 3] || '', 'base64').toString('hex');
            
            fetchedEvents.push({
              name,
              location,
              startTime: parseInt(startHex || '0', 16),
              endTime: parseInt(endHex || '0', 16)
            });
          }
        }
        
        if (fetchedEvents.length > 0) {
          setEvents(fetchedEvents);
        } else {
          setDefaultEvents();
        }
      } else {
        setDefaultEvents();
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
      setDefaultEvents();
    } finally {
      setIsLoading(false);
    }
  }, [festivalId]);

  const setDefaultEvents = () => {
    const baseTime = Math.floor(Date.now() / 1000) + 86400 * 30;
    setEvents([
      { 
        name: 'Opening Ceremony', 
        location: 'Main Stage',
        startTime: baseTime,
        endTime: baseTime + 3600 * 2
      },
      { 
        name: 'DJ Shadow Set', 
        location: 'Electronic Tent',
        startTime: baseTime + 3600 * 3,
        endTime: baseTime + 3600 * 5
      },
      { 
        name: 'Headliner Performance', 
        location: 'Main Stage',
        startTime: baseTime + 3600 * 6,
        endTime: baseTime + 3600 * 8
      }
    ]);
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents };
};

export default useFestivalData;

