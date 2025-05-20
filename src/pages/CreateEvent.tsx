// src/pages/CreateEvent.tsx
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Button, Paper, Typography,
  TextField, MenuItem, FormControl, InputLabel, Select, FormHelperText,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../api/axios';
import { Event } from '../types/Event';
import { CITIES, CATEGORIES, FORMATS, LEVELS } from '../constants';
import { useNotification } from '../contexts/NotificationContext';
import { uploadEventImages } from '../api/events';
import { YMaps } from 'react-yandex-maps';

// все поля обязательно присутствуют в форме, даже если не используются
interface FormValues {
  title: string;
  description: string;
  date: string;      // ISO без часового пояса, для <input type=datetime-local>
  category: string;
  format: string;    // "online" | "offline"
  address: string;
  conferenceLink: string;
  capacity: number;
  level: string;
}

const schema = yup.object<FormValues>({
  title: yup.string().required('Заголовок обязателен'),
  description: yup.string().required('Описание обязательно'),
  date: yup.string()
    .required('Дата и время обязательны')
    .test('valid-date', 'Неверный формат даты', v => !!v && !isNaN(new Date(v).getTime())),
  category: yup.string().required('Сфера обязательна'),
  format: yup.string().oneOf(['offline','online']).required('Формат обязателен'),
  address: yup.string()
    .when('format', {
      is: 'offline',
      then: s => s.required('Адрес обязателен для офлайн'),
      otherwise: s => s.notRequired()
    }),
  conferenceLink: yup.string()
    .when('format', {
      is: 'online',
      then: s => s.required('Ссылка обязательна для онлайн').url('Неверный формат URL'),
      otherwise: s => s.notRequired()
    }),
  capacity: yup.number()
    .typeError('Вместимость должна быть числом')
    .required('Вместимость обязательна')
    .min(1, 'Минимальная вместимость — 1'),
  level: yup.string().required('Уровень обязателен'),
}).required();

export default function CreateEvent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const notify = useNotification();      // теперь сразу функция
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);
  const [files, setFiles] = useState<FileList | null>(null);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages]   = useState<string[]>([]);
  const [newFiles, setNewFiles]             = useState<FileList | null>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState<[number,number] | null>(null);

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: yupResolver(schema),
        defaultValues: {
        title: '',
        description: '',
        date: '',
        category: '',
        format: 'offline',
        address: '',
        conferenceLink: '',
        capacity: 1,
        level: ''
    }
  });

  const format = watch('format');

  // Если редактируем — подгружаем данные
  useEffect(() => {
    if (!isEdit) return;
    api.get<Event>(`/events/${editId}`)
      .then(({ data }) => {
        setValue('title', data.title);
        setValue('description', data.description);
        setValue('date', data.date.slice(0,16)); // YYYY‑MM‑DDTHH:mm
        setValue('category', data.category);
        setValue('format', data.format as any);
        setValue('address', data.address || '');
        setValue('conferenceLink', data.conferenceLink || '');
        setValue('capacity', data.capacity);
        setValue('level', data.level);
        setOriginalImages(data.imageUrls || []);
        if (data.latitude && data.longitude) {
          setCoords([data.latitude, data.longitude]);
        }
      })
      .catch(() => notify('Не удалось загрузить данные для редактирования', 'error'));
  }, [isEdit, editId, setValue, notify]);

  const handleDeleteImage = async (url: string) => {
    setRemovedImages(prev => [...prev, url]);
  };

  // подсказки Yandex по адресу
  useEffect(() => {
    const onReady = () => {
      if (!addressRef.current || !(window as any).ymaps) return;
      const suggest = new (window as any).ymaps.SuggestView(
        addressRef.current,
        { provider: 'yandex#map' }
      );
      suggest.events.add('select', (e: any) => {
        const val = e.get('item').value;
        setValue('address', val, { shouldValidate: true });
        (window as any).ymaps.geocode(val, { results: 1 })
          .then((res: any) => {
            const c: [number, number] = res.geoObjects.get(0).geometry.getCoordinates();
            setCoords(c);
          });
      });
    };
    (window as any).ymaps?.ready(onReady);
  }, [setValue]);

  const onSubmit = async (vals: FormValues) => {
    const base = {
    title:      vals.title,
    description:vals.description,
    date:       new Date(vals.date).toISOString(),
    category:   vals.category,
    format:     vals.format,
    capacity:   vals.capacity,
    level:      vals.level,
    };

    let payload: Partial<Event>;
    if (vals.format === 'offline') {
      // для оффлайна — добавляем address, city, coords
      const parts = vals.address.split(',').map(s=>s.trim());
      const city = parts.find(p=>CITIES.includes(p)) || parts[0];
      payload = {
        ...base,
        city,
        address:        vals.address,
        latitude:       coords?.[0],
        longitude:      coords?.[1],
      };
    } else {
      // для онлайна — добавляем только ссылку
      payload = {
        ...base,
        conferenceLink: vals.conferenceLink
      };
    }

    try {
      let newEventId: number;
      if (isEdit) {
        await api.put(`/events/${editId}`, payload);
        notify('Событие обновлено', 'success');
        newEventId = Number(editId);
      } else {
        const resp = await api.post<{ id: number }>('/events', payload);
        notify('Событие создано', 'success');
        newEventId = isEdit ? Number(editId) : (await resp).data.id;
        
      }
      if (files?.length) {
        await uploadEventImages(newEventId, files);
      }
      if (removedImages.length) {
        await Promise.all(
          removedImages.map(url => {
            const filename = url.split('/').pop()!;
            return api.delete(`/events/${newEventId}/images/${filename}`);
          })
        );
      }

      // 2b. Загрузка новых
      if (newFiles && newFiles.length) {
        await uploadEventImages(newEventId, newFiles);
      }
      // Переходим на страницу события
      navigate(`/events/${newEventId}`, { replace: true });
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Ошибка при сохранении';
      notify(msg, 'error');
    }
  };

  return (
    <Paper sx={{ p:4, maxWidth:600, mx:'auto', mt:4, border:'2px solid transparent', borderImage:'linear-gradient(135deg,#2196F3, rgb(33,243,191)) 1', borderRadius:2 }}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Редактировать событие' : 'Создать новое событие'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display:'flex', flexDirection:'column', gap:2 }}>
        {/* Заголовок */}
        <Controller name="title" control={control} render={({ field }) =>
          <TextField {...field} label="Заголовок" fullWidth error={!!errors.title} helperText={errors.title?.message} />
        } />

        {/* Описание */}
        <Controller name="description" control={control} render={({ field }) =>
          <TextField {...field} label="Описание" fullWidth multiline rows={4} error={!!errors.description} helperText={errors.description?.message} />
        } />

        {/* Дата и время */}
        <Controller name="date" control={control} render={({ field }) =>
          <TextField {...field} label="Дата и время" type="datetime-local" InputLabelProps={{ shrink:true }} fullWidth error={!!errors.date} helperText={errors.date?.message} />
        } />

        {/* Сфера */}
        <Controller name="category" control={control} render={({ field }) =>
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>Сфера</InputLabel>
            <Select {...field} label="Сфера">
              {CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </Select>
            <FormHelperText>{errors.category?.message}</FormHelperText>
          </FormControl>
        } />

        {/* Формат */}
        <Controller name="format" control={control} render={({ field }) =>
          <FormControl fullWidth error={!!errors.format}>
            <InputLabel>Формат</InputLabel>
            <Select {...field} label="Формат">
              {FORMATS.map(f => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
            </Select>
            <FormHelperText>{errors.format?.message}</FormHelperText>
          </FormControl>
        } />

        {/* Адрес для офлайн */}
        {format === 'offline' && (
          <YMaps query={{ apikey: import.meta.env.VITE_YANDEX_API_KEY }} preload>
            <Controller name="address" control={control} render={({ field }) =>
              <TextField
                {...field}
                label="Адрес"
                placeholder="Например: Москва, ул. Народного Ополчения, 32"
                inputRef={addressRef}
                fullWidth
                error={!!errors.address}
                helperText={errors.address?.message || 'Начните вводить и выберите адрес'}
              />
            } />
          </YMaps>
        )}

        {/* Ссылка для online */}
        {format === 'online' && (
          <Controller name="conferenceLink" control={control} render={({ field }) =>
            <TextField
              {...field}
              label="Ссылка на конференцию"
              fullWidth
              error={!!errors.conferenceLink}
              helperText={errors.conferenceLink?.message}
              placeholder="https://zoom.us/..."
            />
          } />
        )}

        {/* Вместимость */}
        <Controller name="capacity" control={control} render={({ field }) =>
          <TextField {...field} label="Вместимость" type="number" fullWidth error={!!errors.capacity} helperText={errors.capacity?.message} />
        } />

        {/* Уровень */}
        <Controller name="level" control={control} render={({ field }) =>
          <FormControl fullWidth error={!!errors.level}>
            <InputLabel>Уровень</InputLabel>
            <Select {...field} label="Уровень">
              {LEVELS.map(l => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
            </Select>
            <FormHelperText>{errors.level?.message}</FormHelperText>
          </FormControl>
        } />

        {originalImages.filter(url => !removedImages.includes(url)).length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {originalImages
              .filter(url => !removedImages.includes(url))
              .map(url => {
                return (
                  <Box key={url} sx={{ position: 'relative', width: 100, height: 100 }}>
                    <Box
                      component="img"
                      src={url}
                      sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(32, 32, 32, 0.7)', color:'white' }}
                      onClick={() => handleDeleteImage(url)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
          </Box>
        )}
        <Box sx={{ my: 0 }}>
          <input
            accept="image/*"
            id="event-images-upload"
            type="file"
            multiple
            hidden
            onChange={e => setNewFiles(e.target.files)}
          />
          <label htmlFor="event-images-upload">
            <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
              Выберите изображения
            </Button>
          </label>
          {newFiles && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {Array.from(newFiles).map(f => f.name).join(', ')}
            </Typography>
          )}
        </Box>

        <Box sx={{ display:'flex', gap:2, mt:1 }}>
          <Button variant="contained" type="submit" disabled={isSubmitting}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
          <Button component={RouterLink} to={isEdit ? `/events/${editId}` : '/'}>
            Отмена
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
