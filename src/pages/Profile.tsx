// src/pages/Profile.tsx
import { useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Button,
  CircularProgress,
  Rating,                      // ← добавили
} from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import api from '../api/axios';
import { GENDERS } from '../constants';
import { useNotification } from '../contexts/NotificationContext';

/* ---------- типы ---------- */
interface FormValues {
  ownerRating: number;   // рейтинг организатора (read‑only)
  username:    string;
  fullName:    string;
  gender:      string;
  email:       string;
  phone:       string;
  birthDate:   string;   // YYYY‑MM‑DD
  ownerRatingCount: number;
}

/* ---------- yup‑схема ---------- */
const schema: yup.ObjectSchema<FormValues> = yup.object({
  ownerRating: yup.number().notRequired(),
  ownerRatingCount: yup.number().notRequired(),
  username:    yup.string().notRequired(),
  fullName:    yup.string().required('Обязательно'),
  gender:      yup.string().required('Обязательно'),
  email:       yup.string().email('Неверный e‑mail').required('Обязательно'),
  phone:       yup.string().required('Обязательно'),
  birthDate:   yup
    .string()
    .required('Обязательно')
    .test('is-date', 'Неверная дата', v => !!v && !isNaN(Date.parse(v))),
}).required();

/* ---------- компонент ---------- */
export default function Profile() {
  const notify = useNotification();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      ownerRating: 0,
      ownerRatingCount: 0,
      username:    '',
      fullName:    '',
      gender:      '',
      email:       '',
      phone:       '',
      birthDate:   '',
    },
  });

  const cnt = watch('ownerRatingCount');
  const avg = watch('ownerRating');

  /* ---- загрузка профиля ---- */
  useEffect(() => {
    api
      .get<FormValues>('/users/me')
      .then(({ data }) => {
        const normalized = {
          ...data,
          birthDate: data.birthDate ? data.birthDate.slice(0, 10) : '',
        };
        Object.entries(normalized).forEach(([k, v]) =>
          setValue(k as keyof FormValues, v as never)
        );
      })
      .catch(() => notify('Не удалось загрузить профиль', 'error'));
  }, [setValue, notify]);

  /* ---- отправка формы ---- */
  const onSubmit: SubmitHandler<FormValues> = async ({
    ownerRating,                                     // eslint-disable-line @typescript-eslint/no-unused-vars
    ...vals                                          // убираем rating из отправки
  }) => {
    try {
      await api.put('/users/me', {
        ...vals,
        birthDate: vals.birthDate || null,
      });
      notify('Профиль сохранён', 'success');
    } catch {
      notify('Ошибка при сохранении', 'error');
    }
  };

  /* ---------- UI ---------- */
  return (
    <Paper sx={{
        p: 4,
        maxWidth: 600,
        mx: 'auto',
        mt: 2,
        border: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, #2196F3, rgb(33,243,191)) 1',
        borderRadius: 2,
      }}>
      <Typography variant="h4" gutterBottom>
        Профиль
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {/* рейтинг организатора (read‑only) */}
        <Controller
          name="ownerRating"
          control={control}
          render={({ field }) => (
            <Box sx={{mb:1}}>
              <Typography variant="body2">Ваш рейтинг как организатора</Typography>
              <Box sx={{display:'flex',alignItems:'center'}}>
                <Rating value={field.value ?? 0} precision={0.1} readOnly/>
                <Typography variant="caption" sx={{ml: 0.5,  mt: 0.5}}>
                  {(avg ?? 0).toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5,  mt: 0.5}}>
                  ({cnt ?? 0})
                </Typography>
              </Box>
            </Box>
          )}
          />

        {/* логин (read‑only) */}
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Логин" disabled />
          )}
        />

        {/* ФИО */}
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="ФИО"
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />
          )}
        />

        {/* Пол */}
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.gender}>
              <InputLabel>Пол</InputLabel>
              <Select {...field} label="Пол">
                {GENDERS.map((g) => (
                  <MenuItem key={g.value} value={g.value}>
                    {g.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.gender?.message}</FormHelperText>
            </FormControl>
          )}
        />

        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="E‑mail"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />

        {/* Телефон */}
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Телефон"
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          )}
        />

        {/* Дата рождения */}
        <Controller
          name="birthDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="date"
              label="Дата рождения"
              InputLabelProps={{ shrink: true }}
              error={!!errors.birthDate}
              helperText={errors.birthDate?.message}
            />
          )}
        />

        <Box sx={{ display: 'flex', mt: 2 }}>
          <Button variant="contained" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
