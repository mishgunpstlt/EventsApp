// src/components/EventCard.tsx
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Rating
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Event } from '../types/Event';
import { CATEGORIES, FORMATS, LEVELS } from '../constants';

export default function EventCard({ event }: { event: Event }) {
  return (
    <Card
    sx={{
        border: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, #2196F3,rgb(33, 243, 191)) 1',
        borderRadius: 2,
      }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {event.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: .5 }}>
          <Rating
            value={event.ownerRating ?? 0}
            precision={0.1}
            readOnly
            size="small"
          />
          <Typography variant="caption" sx={{ ml: 0.5,  mt: 0.5 }}>
            {(event.ownerRating ?? 0).toFixed(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5,  mt: 0.5 }}>
            ({event.ownerRatingCount ?? 0})
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {new Date(event.date).toLocaleString()}
        </Typography>
        <Typography variant="body2">
          Сфера: {CATEGORIES.find(c => c.value === event.category)?.label ?? event.category}
        </Typography>
        <Typography variant="body2">
          Уровень: {LEVELS.find(l => l.value === event.level)?.label ?? event.level}
        </Typography>
        <Typography variant="body2">
          Формат: {FORMATS.find(f => f.value === event.format)?.label ?? event.format}
        </Typography>
        <Typography
          variant="body2"
          sx={{ minHeight: '1.5em' }} // или подберите нужную вам высоту
        >
          {event.format === 'offline'
            ? `Город: ${event.city}`
            : '\u00A0'  /* неразрывный пробел, чтобы блок не схлопнулся */}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/events/${event.id}`}>
          Подробнее
        </Button>
      </CardActions>
    </Card>
  );
}
