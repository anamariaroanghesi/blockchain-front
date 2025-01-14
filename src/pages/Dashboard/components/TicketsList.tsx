import React from 'react';
import { List, ListItem } from '@mui/material';
import OwnedTicketCard from './OwnedTicketCard';

type Ticket = {
  id: string;
  eventName: string;
  eventDate: string;
};

const TicketsList = () => {
  const tickets: Ticket[] = [
    { id: '1', eventName: 'Concert A', eventDate: '2025-01-20' },
    { id: '2', eventName: 'Concert B', eventDate: '2025-02-10' },
    { id: '3', eventName: 'Concert C', eventDate: '2025-03-15' },
  ];

  const handleResellTicket = (ticketId: string) => {
    console.log(`Reselling ticket with ID: ${ticketId}`);
    // Add your resell logic here
  };

  const handleViewDetails = (ticketId: string) => {
    console.log(`Viewing details for ticket with ID: ${ticketId}`);
    // Add your detail viewing logic here
  };

  return (
    <List>
      {tickets.map((ticket) => (
        <ListItem key={ticket.id} sx={{ padding: '1rem 0' }}>
          <OwnedTicketCard
            ticketId={ticket.id}
            eventName={ticket.eventName}
            eventDate={ticket.eventDate}
            onResell={() => handleResellTicket(ticket.id)}
            onDetails={() => handleViewDetails(ticket.id)}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default TicketsList;
