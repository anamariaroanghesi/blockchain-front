import { useState, useCallback } from 'react';
import { smartContract } from 'utils/smartContract';

export const useGetAvailableTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailableTickets = useCallback(async () => {
    setIsLoading(true);
    console.log(smartContract.methodsExplicit);

    try {
      const result = await smartContract.methodsExplicit
        .getAvailableTickets() // Replace with your actual smart contract method
        .run({}); // Use 'run' for queries instead of 'call'
      setTickets(result?.returnData || []);
    } catch (error) {
      console.error('Failed to fetch available tickets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { tickets, isLoading, fetchAvailableTickets };
};
