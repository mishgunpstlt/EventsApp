// src/pages/CreateEvent.tsx
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Button, Paper, Typography, TextField, MenuItem, FormControl,
  InputLabel, Select, FormHelperText, IconButton
} from '@mui/material';
import CloseIcon     from '@mui/icons-material/Close';
import PhotoCamera   from '@mui/icons-material/PhotoCamera';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import api, { authHeader }              from '../api/axios';
import { Event }                        from '../types/Event';
import { CITIES, CATEGORIES, FORMATS, LEVELS } from '../constants';
import { useNotification }              from '../contexts/NotificationContext';
import {
  uploadEventImages,
  uploadRequestImages
}                                       from '../api/events';
import { YMaps }                        from 'react-yandex-maps';
import { useAuth }                      from '../contexts/AuthContext';

/* ---------- типы ---------- */

interface FormValues {
  title          : string;
  description    : string;
  date           : string;   // YYYY-MM-DDTHH:mm
  category       : string;
  format         : 'offline' | 'online';
  address        : string;
  conferenceLink : string;
  capacity       : number;
  level          : string;
}

/* ---------- yup-схема ---------- */

const schema = yup.object<FormValues>({
  title       : yup.string().required(),
  description : yup.string().required(),
  date        : yup.string()
                    .required()
                    .test('date','Неверный формат',v=>!!v && !isNaN(new Date(v).getTime())),
  category    : yup.string().required(),
  format      : yup.mixed<'offline'|'online'>().oneOf(['offline','online']).required(),
  address     : yup.string().when('format',{
                  is :'offline', then:s=>s.required('Адрес обязателен'),
                  otherwise     :s=>s.notRequired()
                }),
  conferenceLink:yup.string().when('format',{
                  is :'online',
                  then:s=>s.required('Ссылка обязательна').url('Неверный URL'),
                  otherwise:s=>s.notRequired()
                }),
  capacity    : yup.number().typeError('Число')
                    .required().min(1),
  level       : yup.string().required()
});

/* ====================================================================== */

export default function CreateEvent() {

  /* ---------- routing ---------- */
  const [params]  = useSearchParams();
  const editId    = params.get('id');           // id события или заявки
  const srcParam  = params.get('src');          // 'event' | 'request' | null
  // по-умолчанию, если параметра нет:
  const src       = (srcParam as 'event'|'request'|null)
                    ?? (editId ? 'event' : 'event');

  const isEdit    = Boolean(editId);

  /* ---------- misc ---------- */
  const navigate  = useNavigate();
  const notify    = useNotification();
  const { user }  = useAuth();
  const isAdmin   = user?.roles?.some(r=>r.name==='ROLE_ADMIN') ?? false;

  /* ---------- state для картинок ---------- */
  const [origImages,   setOrigImages]   = useState<string[]>([]);
  const [removedUrls,  setRemovedUrls]  = useState<string[]>([]);
  const [newFiles,     setNewFiles]     = useState<FileList|null>(null);

  /* ---------- react-hook-form ---------- */
  const { control, handleSubmit, setValue, watch,
          formState:{ errors, isSubmitting } } =
      useForm<FormValues>({
        resolver     : yupResolver(schema),
        defaultValues: {
          title:'', description:'', date:'', category:'',
          format:'offline', address:'', conferenceLink:'',
          capacity:1, level:''
        }
      });

  const format = watch('format');
  const addressRef = useRef<HTMLInputElement>(null);
  const [coords,setCoords] = useState<[number,number]|null>(null);

  /* ---------- Загрузка данных при редактировании ---------- */
  useEffect(()=>{
    if (!isEdit) return;

    const url = (isAdmin || src==='event')
                  ? `/events/${editId}`
                  : `/event-requests/${editId}`;

    api.get(url,{ headers: authHeader() })
       .then(({data})=>{
          setValue('title',data.title);
          setValue('description',data.description);
          setValue('date',data.date.slice(0,16));
          setValue('category',data.category);
          setValue('format',data.format);
          setValue('address',data.address ?? '');
          setValue('conferenceLink',data.conferenceLink ?? '');
          setValue('capacity',data.capacity);
          setValue('level',data.level);
          setOrigImages(data.imageUrls ?? []);
          if (data.latitude && data.longitude)
            setCoords([data.latitude,data.longitude]);
       })
       .catch(()=>notify('Не удалось загрузить данные','error'));
  },[isEdit,editId,src,isAdmin,setValue,notify]);

  /* ---------- Yandex suggest ---------- */
  useEffect(()=>{
    const ready = ()=>{
      if (!addressRef.current || !(window as any).ymaps) return;
      const sv = new (window as any).ymaps.SuggestView(addressRef.current);
      sv.events.add('select',(e:any)=>{
        const v = e.get('item').value;
        setValue('address',v,{shouldValidate:true});
        (window as any).ymaps.geocode(v,{results:1})
          .then((res:any)=>{
            const c:[number,number] =
              res.geoObjects.get(0).geometry.getCoordinates();
            setCoords(c);
          });
      });
    };
    (window as any).ymaps?.ready(ready);
  },[setValue]);

  /* ---------- helpers ---------- */
  const delPreview = (u:string)=>setRemovedUrls(p=>[...p,u]);

  /* ------------------------------------------------------------------ */
  const onSubmit = async (v:FormValues)=>{
    /* базовый payload */
    const base = {
      title:v.title, description:v.description,
      date:new Date(v.date).toISOString(),
      category:v.category, format:v.format,
      capacity:v.capacity, level:v.level
    };

    const payload =
      v.format==='offline'
        ? (()=>{                         // offline
            const parts = v.address.split(',').map(s=>s.trim());
            const city  = parts.find(p=>CITIES.includes(p)) ?? parts[0];
            return {...base,address:v.address,city,
                    latitude:coords?.[0], longitude:coords?.[1]};
          })()
        : {...base, conferenceLink:v.conferenceLink}; // online

    /* === Администратор: сразу событие =========================== */
    if (isAdmin){
      let id:number;
      if (isEdit){
        await api.put(`/events/${editId}`,payload,{headers:authHeader()});
        id = Number(editId);
        notify('Событие обновлено','success');
      }else{
        id = (await api.post<{id:number}>('/events',payload,
                                          {headers:authHeader()})).data.id;
        notify('Событие создано','success');
      }
      /* картинки */
      if (newFiles?.length) await uploadEventImages(id,newFiles);
      if (removedUrls.length){
        await Promise.all(removedUrls.map(u=>{
          const fn=u.split('/').pop()!;
          return api.delete(`/events/${id}/images/${fn}`,
                            {headers:authHeader()});
        }));
      }
      navigate(`/events/${id}`,{replace:true});
      return;
    }

    /* === Обычный пользователь: заявка =========================== */
    const body = {
      ...payload,
      type : isEdit ? 'EDIT' : 'CREATE',
      // если редактируем опубликованное событие (src==='event')
      originalEventId : (isEdit && src==='event') ? Number(editId) : undefined
    };

    try{
      const {id:reqId} =
        await api.post<{id:number}>('/event-requests',body,
                                    {headers:authHeader()})
                 .then(r=>r.data);

      if (newFiles?.length) await uploadRequestImages(reqId,newFiles);

      if (removedUrls.length){
        await Promise.all(removedUrls.map(u=>{
          const fn=u.split('/').pop()!;
          return api.delete(`/event-requests/${reqId}/images/${fn}`,
                            {headers:authHeader()});
        }));
      }

      notify(isEdit?'Заявка обновлена':'Заявка отправлена','info');
      navigate('/',{replace:true});
    }catch(e:any){
      const msg = e?.response?.data?.message ?? 'Ошибка при сохранении';
      notify(msg,'error');
    }
  };
  /* ------------------------------------------------------------------ */

  return (
    <Paper sx={{p:4,maxWidth:600,mx:'auto',mt:4,
                border:'2px solid transparent',
                borderImage:'linear-gradient(135deg,#2196F3,#21f3bf) 1',
                borderRadius:2}}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Редактировать событие' : 'Создать новое событие'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}
           sx={{display:'flex',flexDirection:'column',gap:2}}>

        {/* --- поля формы (без изменений) -------------------------------- */}
        {/* Заголовок */}
        <Controller name="title" control={control}
          render={({field})=>
            <TextField {...field} label="Заголовок" fullWidth
                       error={!!errors.title}
                       helperText={errors.title?.message}/>
        }/>
        {/* Описание */}
        <Controller name="description" control={control}
          render={({field})=>
            <TextField {...field} label="Описание" fullWidth multiline rows={4}
                       error={!!errors.description}
                       helperText={errors.description?.message}/>
        }/>
        {/* Дата/время */}
        <Controller name="date" control={control}
          render={({field})=>
            <TextField {...field} type="datetime-local"
                       label="Дата и время"
                       InputLabelProps={{shrink:true}} fullWidth
                       error={!!errors.date}
                       helperText={errors.date?.message}/>
        }/>
        {/* Сфера */}
        <Controller name="category" control={control}
          render={({field})=>
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Сфера</InputLabel>
              <Select {...field} label="Сфера">
                {CATEGORIES.map(c=>
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </Select>
              <FormHelperText>{errors.category?.message}</FormHelperText>
            </FormControl>
        }/>
        {/* Формат */}
        <Controller name="format" control={control}
          render={({field})=>
            <FormControl fullWidth error={!!errors.format}>
              <InputLabel>Формат</InputLabel>
              <Select {...field} label="Формат">
                {FORMATS.map(f=>
                  <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
              </Select>
              <FormHelperText>{errors.format?.message}</FormHelperText>
            </FormControl>
        }/>

        {/* Адрес офлайн */}
        {format==='offline' &&
          <YMaps query={{apikey:import.meta.env.VITE_YANDEX_API_KEY}} preload>
            <Controller name="address" control={control}
              render={({field})=>
                <TextField {...field} label="Адрес"
                           placeholder="Наприме: Москва, ул. Народного Ополчения, 32"
                           inputRef={addressRef} fullWidth
                           error={!!errors.address}
                           helperText={errors.address?.message}/>
            }/>
          </YMaps>
        }

        {/* Ссылка онлайн */}
        {format==='online' &&
          <Controller name="conferenceLink" control={control}
            render={({field})=>
              <TextField {...field} label="Ссылка"
                         fullWidth placeholder="https://zoom.us/..."
                         error={!!errors.conferenceLink}
                         helperText={errors.conferenceLink?.message}/>
        }/>}

        {/* Вместимость */}
        <Controller name="capacity" control={control}
          render={({field})=>
            <TextField {...field} label="Вместимость" type="number" fullWidth
                       error={!!errors.capacity}
                       helperText={errors.capacity?.message}/>
        }/>
        {/* Уровень */}
        <Controller name="level" control={control}
          render={({field})=>
            <FormControl fullWidth error={!!errors.level}>
              <InputLabel>Уровень</InputLabel>
              <Select {...field} label="Уровень">
                {LEVELS.map(l=>
                  <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
              </Select>
              <FormHelperText>{errors.level?.message}</FormHelperText>
            </FormControl>
        }/>

        {/* --- превью старых картинок --- */}
        {origImages.filter(u=>!removedUrls.includes(u)).length>0 &&
          <Box sx={{display:'flex',gap:1,flexWrap:'wrap'}}>
            {origImages.filter(u=>!removedUrls.includes(u)).map(u=>(
              <Box key={u} sx={{position:'relative',width:100,height:100}}>
                <Box component="img" src={u}
                     sx={{width:1,height:1,objectFit:'cover',borderRadius:1}}/>
                <IconButton size="small"
                            sx={{position:'absolute',top:2,right:2,
                                 bgcolor:'rgba(32,32,32,.7)',color:'#fff'}}
                            onClick={()=>delPreview(u)}>
                  <CloseIcon fontSize="small"/>
                </IconButton>
              </Box>
            ))}
          </Box>}

        {/* --- новые файлы --- */}
        <input hidden id="img-upl" type="file" multiple accept="image/*"
               onChange={e=>setNewFiles(e.target.files)}/>
        <label htmlFor="img-upl">
          <Button variant="outlined" component="span"
                  startIcon={<PhotoCamera/>}>
            Выберите изображения
          </Button>
        </label>
        {newFiles &&
          <Typography variant="body2" sx={{mt:1}}>
            {Array.from(newFiles).map(f=>f.name).join(', ')}
          </Typography>}

        {/* --- действия --- */}
        <Box sx={{display:'flex',gap:2,mt:1}}>
          <Button variant="contained" type="submit" disabled={isSubmitting}>
            {isEdit?'Сохранить':'Создать'}
          </Button>
          <Button component={RouterLink}
                  to={isEdit ? `/events/${editId}` : '/'}>
            Отмена
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
