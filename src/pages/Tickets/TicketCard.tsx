import React from 'react';
import { Card, CardContent, Typography, CardActions, Button } from '@mui/material';

type TicketCardProps = {
  ticketId: string;
  price: string;
  onBuy: () => void;
};

const TicketCard = ({ ticketId, price, onBuy }: TicketCardProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardContent>
        <Typography variant="h5" component="div">
          Ticket ID: {ticketId}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ marginBottom: '1rem' }}>
          Price: {price} EGLD
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="large" color="primary" variant="contained" onClick={onBuy}>
          Buy Ticket
        </Button>
      </CardActions>
    </Card>
  );
};

export default TicketCard;
