// src/components/RsvpAndRating.tsx
import { useState, useEffect } from 'react';
import { Box, Button, Rating, Typography } from '@mui/material';
import { useRsvp } from '../hooks/useRsvp';
import { useAuth } from '../contexts/AuthContext';

interface RsvpAndRatingProps {
  eventId: number;
  disabled?: boolean;
  onRated?: () => void;
}

export default function RsvpAndRating({
  eventId,
  disabled = false,
  onRated,
}: RsvpAndRatingProps) {
  const { info, rate } = useRsvp(eventId);
  const { isAuthenticated } = useAuth();

  const [myRating, setMyRating] = useState<number | null>(info.userRating);

  useEffect(() => {
    setMyRating(info.userRating);
  }, [info.userRating]);

  const handleRate = async () => {
    if (myRating == null) return;
    await rate(myRating);
    onRated?.();
  };

  if (!isAuthenticated) return null;

  return (
    <Box sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
      <Typography sx={{ mr: 1 }}>Ваша оценка:</Typography>
      <Rating
        value={myRating}
        onChange={(_, v) => setMyRating(v)}
        disabled={disabled}
      />
      <Button
        sx={{ ml: 2 }}
        variant="outlined"
        disabled={disabled || myRating == null}
        onClick={handleRate}
      >
        Оценить
      </Button>
    </Box>
  );
}
