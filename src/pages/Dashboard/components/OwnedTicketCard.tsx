import React from 'react';
import { Card, CardContent, Typography, CardActions, Button } from '@mui/material';

type OwnedTicketCardProps = {
  ticketId: string;
  eventName: string;
  eventDate: string;
  onResell: () => void;
  onDetails: () => void;
};

const OwnedTicketCard = ({ ticketId, eventName, eventDate, onResell, onDetails }: OwnedTicketCardProps) => {
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
        <Typography variant="body1" color="text.secondary">
          Event: {eventName}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ marginBottom: '1rem' }}>
          Date: {eventDate}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="large" color="primary" variant="contained" onClick={onDetails}>
          Details
        </Button>
        <Button size="large" color="secondary" variant="contained" onClick={onResell}>
          Resell
        </Button>
      </CardActions>
    </Card>
  );
};

export default OwnedTicketCard;
