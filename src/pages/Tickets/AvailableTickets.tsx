import React from 'react';
import TicketCard from './TicketCard';
import { Container, Typography, List, ListItem, Divider } from '@mui/material';
import { AuthRedirectWrapper } from 'wrappers';

const AvailableTicketsPage = () => {
  // Hardcoded tickets for testing
  const tickets = [
    { id: '1', price: '20', title: 'Concert A', description: 'A great concert experience.' },
    { id: '2', price: '35', title: 'Concert B', description: 'An amazing music festival.' },
    { id: '3', price: '50', title: 'Concert C', description: 'An unforgettable night.' },
  ];

  const handleBuyTicket = (ticketId: string) => {
    console.log(`Buying ticket with ID: ${ticketId}`);
    // Implement buy logic here
  };

  return (
    <AuthRedirectWrapper>
      <Container sx={{ padding: '2rem', maxWidth: '900px' }}>
        <Typography variant="h4" gutterBottom>
          Available Tickets
        </Typography>
        <List>
          {tickets.map((ticket) => (
            <React.Fragment key={ticket.id}>
              <ListItem sx={{ padding: '0 0 2rem 0' }}>
                <TicketCard
                  ticketId={ticket.id}
                  price={ticket.price}
                  onBuy={() => handleBuyTicket(ticket.id)}
                />
              </ListItem>
              {ticket.id !== tickets[tickets.length - 1].id && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Container>
    </AuthRedirectWrapper>
  );
};

export default AvailableTicketsPage;
