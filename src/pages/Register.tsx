import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

/* ---------- типы и schema ---------- */
interface FormValues {
  username:        string;
  password:        string;
  confirmPassword: string;
}

const schema: yup.ObjectSchema<FormValues> = yup.object({
  username: yup.string().required('Введите логин'),
  password: yup
    .string()
    .min(6, 'Пароль минимум 6 символов')
    .required('Введите пароль'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли не совпадают')
    .required('Повторите пароль')
});

export default function Register() {
  const { register: reg } = useAuth();   // переименовали, чтобы не конфликтовало с useForm.register
  const notify            = useNotification();
  const navigate          = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit: SubmitHandler<FormValues> = async vals => {
    try {
      await reg(vals.username, vals.password);
      notify('Регистрация прошла успешно', 'success');
      navigate('/');                   // сразу на главную со списком событий
    } catch (e: any) {
      const msg =
        e.response?.data?.message || 'Ошибка при регистрации';
      notify(msg, 'error');
    }
  };

  /* ---------- UI ---------- */
  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, border: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, #2196F3,rgb(33, 243, 191)) 1',
        borderRadius: 2, }}>
        <Typography variant="h5" align="center" gutterBottom>
          Регистрация
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Логин */}
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Логин"
                error={!!errors.username}
                helperText={errors.username?.message}
                fullWidth
              />
            )}
          />

          {/* Пароль */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Пароль"
                type="password"
                error={!!errors.password}
                helperText={errors.password?.message}
                fullWidth
              />
            )}
          />

          {/* Повтор пароля */}
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Повторите пароль"
                type="password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                fullWidth
              />
            )}
          />

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
