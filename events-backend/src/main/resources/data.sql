TRUNCATE TABLE ticket RESTART IDENTITY CASCADE;
TRUNCATE TABLE rsvp   RESTART IDENTITY CASCADE;
TRUNCATE TABLE event  RESTART IDENTITY CASCADE;
TRUNCATE TABLE user_roles RESTART IDENTITY CASCADE;
TRUNCATE TABLE users  RESTART IDENTITY CASCADE;
TRUNCATE TABLE roles  RESTART IDENTITY CASCADE;

-- ===================================================================
-- 1) Роли
-- ===================================================================

INSERT INTO roles (id, name) VALUES
  (1, 'ROLE_USER'),
  (2, 'ROLE_ADMIN');

-- ===================================================================
-- 2) Пользователи
-- ===================================================================
-- Пароли должны быть в BCrypt-хэше
INSERT INTO users (id, username, password, full_name, email, gender, birth_date, phone) VALUES
  (1, 'alice',  '123456', 'Alice Ivanova',  'alice@example.com',  'FEMALE', '1992-03-15', '+79110000001'),
  (2, 'bob',    'йцукен', 'Bob Petrov',     'bob@example.com',    'MALE',   '1988-07-21', '+79110000002'),
  (3, 'charlie','фывапр', 'Charlie Sidorov','charlie@ex.com',     'MALE',   '1990-11-05', '+79110000003'),
  (4, 'diana',  'ячсмит', 'Diana Kuznetsova','diana@ex.com',       'FEMALE', '1995-01-12', '+79110000004'),
  (5, 'evgeny', 'тимсчя', 'Evgeny Morozov', 'evgeny@ex.com',      'MALE',   '1985-09-30', '+79110000005'),
  (6, 'fedor',  'рпавыф', 'Fedor Smirnov',  'fedor@ex.com',       'MALE',   '1993-04-22', '+79110000006'),
  (7, 'olga',   'некуйц', 'Olga Petrova',   'olga@ex.com',        'FEMALE', '1991-08-17', '+79110000007');

-- ===================================================================
-- 3) Пользователь ↔ Роль
-- ===================================================================
INSERT INTO user_roles (user_id, role_id) VALUES
  (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),
  (2,2),(4,2);

-- ===================================================================
-- 4) События (id 1–15)
-- ===================================================================
INSERT INTO event (id, title, description, date, category, format, level, capacity, owner_id, address, conference_link) VALUES
  -- уже были 1–3
  (4,  'Design Thinking Workshop',         'Погружаемся в дизайн-мышление',       '2025-06-11 11:00:00', 'Design',     'offline', 'Средний',   40, 3, 'ул. Баумана, 20', NULL),
  (5,  'Yoga for Beginners',               'Утренняя практика йоги',             '2025-06-14 07:30:00', 'Wellness',   'offline', 'Начальный', 25, 4, 'парк Победы',      NULL),
  (6,  'Advanced Java Patterns',           'Паттерны проектирования в Java',     '2025-06-18 19:00:00', 'IT',         'online',  'Продвинутый',80, 2, NULL,                'https://meet.ex/456'),
  (7,  'Digital Marketing Masterclass',    'Продвинутая SEO и SMM',              '2025-06-20 15:00:00', 'Marketing',  'online',  'Продвинутый',120,5, NULL,                'https://zoom.ex/789'),
  (8,  'Photography Walk',                 'Уличная фотография в центре города', '2025-06-22 17:00:00', 'Art',        'offline', 'Для всех',  30, 6, 'ул. Арбат, 12',    NULL),
  (9,  'Data Science Intro',               'Старт в Data Science',               '2025-06-25 18:00:00', 'IT',         'online',  'Начальный',100,1, NULL,                'https://teams.ex/101'),
  (10, 'French Language Meetup',           'Практика разговорного французского', '2025-06-27 14:00:00', 'Education',  'offline', 'Средний',   20, 7, 'ул. Профсоюзная,3',NULL),
  (11, 'Blockchain & Crypto',              'Блокчейн-технологии и крипта',       '2025-06-30 20:00:00', 'Finance',    'online',  'Средний',   150,2, NULL,                'https://crypto.ex/111'),
  (12, 'Startup Pitch Night',              'Демонстрация стартапов',             '2025-07-02 18:30:00', 'Business',   'offline', 'Для всех',  60,3, 'коворкинг XYZ',    NULL),
  (13, 'UX/UI Trends 2025',                'Тренды пользовательских интерфейсов','2025-07-05 17:00:00', 'Design',     'online',  'Для всех',  80,5, NULL,                'https://uxui.ex/222'),
  (14, 'Kotlin in Production',            'Использование Kotlin в бэкофисе',    '2025-07-07 19:00:00', 'IT',         'online',  'Средний',   90,6, NULL,                'https://kotlin.ex/333'),
  (15, 'Mindfulness & Meditation',        'Практика осознанности',              '2025-07-10 08:00:00', 'Wellness',   'offline', 'Для всех',  35,4, 'спортивный клуб',  NULL;

-- ===================================================================
-- 5) RSVP (id 1–12)
-- ===================================================================
INSERT INTO rsvp (id, event_id, user_id, "timestamp", rating) VALUES
  -- уже были 1–2
  (3,  4,  1, '2025-06-05 10:00:00', 4),
  (4,  5,  2, '2025-06-06 08:00:00', 5),
  (5,  6,  3, '2025-06-10 19:30:00', NULL),
  (6,  7,  4, '2025-06-12 16:00:00', 3),
  (7,  8,  5, '2025-06-18 17:30:00', NULL),
  (8,  9,  6, '2025-06-20 18:30:00', 5),
  (9, 10,  7, '2025-06-24 14:15:00', 4),
  (10,11,  1, '2025-06-28 20:15:00', 5),
  (11,12,  2, '2025-06-29 19:00:00', NULL),
  (12,13,  3, '2025-07-01 17:45:00', 2);

-- ===================================================================
-- 6) Билеты (id 1–12)
-- ===================================================================
INSERT INTO ticket (id, rsvp_id, code) VALUES
  -- уже были 1–2
  (3,  3, 'TCK-004'),
  (4,  4, 'TCK-005'),
  (5,  5, 'TCK-006'),
  (6,  6, 'TCK-007'),
  (7,  7, 'TCK-008'),
  (8,  8, 'TCK-009'),
  (9,  9, 'TCK-010'),
  (10, 10,'TCK-011'),
  (11, 11,'TCK-012'),
  (12, 12,'TCK-013');
