-- ============================================================
-- FACILE DATA MIGRATION TO SUPABASE
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vvakqdswljajctulrdrb/sql/new
-- ============================================================

-- -------------------------------------------------------
-- STEP 1: Fix role check constraint on users table
-- -------------------------------------------------------
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- -------------------------------------------------------
-- STEP 2: Users
-- -------------------------------------------------------
INSERT INTO public.users (id, email, name, password, role, enabled, created_at)
VALUES
  (1,  'otptest@example.com',          'OTP Test User',    '$2a$10$B.MBksnnjHLxyns7AiC2cuXjeNr4YTW0xC8iOV7k1VDY286nwxb9y', 'USER',   true,  '2026-07-14 08:01:45.769866'),
  (2,  'kritagyaarora4782@gmail.com',  'Kritagya Arora',   '$2a$10$yiRi9tgcd4y4jq66fTlzM.ilgX7j6C/4wTppKXimvpYvT9WAdCWqS', 'USER',   false, '2026-07-14 08:02:14.853182'),
  (3,  'kritagyaarora4872@gmail.com',  'Kritagya Arora',   '$2a$10$gyyDAvmwiOJF1BhnWOXe8OOe/K7v4nf3CMbh82JWcDqAtX2KwRFSy', 'USER',   false, '2026-07-14 08:10:28.361851'),
  (4,  'kritagyaarora42@gmail.com',    'Kritagya Arora',   '$2a$10$lWNW0.DlpjGL5BiE.noUKOjWAL1HM7kWXKMPjA/V2A4SxYcz15BJO', 'ADMIN',  true,  '2026-07-14 08:17:06.438033'),
  (5,  'me_test@example.com',          'Me Endpoint User', '$2a$10$EUbRp.743QK1j7NF9KU67uo50.tejIGi6/obzdFWak1RQJmIc/8Lu', 'USER',   true,  '2026-07-14 08:25:27.042352'),
  (6,  'arora.kritagyaa@gmail.com',    'Kritagya',         '$2a$10$G5rZotSBBF5WqC494ocY0.v/AnZRA2bEQFp989ZMZn3fesKxuPI2e', 'USER',   false, '2026-07-14 10:35:17.490464'),
  (7,  'shubhamkatyan123@gmail.com',   'krit',             '$2a$10$fIfvjXqRb4uDh.y19s4lt.Gea5bGpvQwH9bFjxFLYFogHBvJHIDHK', 'USER',   true,  '2026-07-14 17:09:36.901014'),
  (11, 'ananyatamta26@gmail.com',      'Charms_lover',     '$2a$10$X9lbfl6mEK0L8kptkkSvWuiOYJog7sdKdTLU8fcch8/SWH2WZ4LLa', 'SELLER', true,  '2026-07-15 07:09:45.968795'),
  (13, 'admin@facile.com',             'Facile Admin',     '$2a$10$l9WhpFD5D7ukiX6GYwJgOueRbBcLrHylxpMNO.y.bnaOuB0eQsW.K', 'ADMIN',  true,  '2026-07-15 07:26:11.687912'),
  (14, 'jewelmars@gmail.com',          'jewwelmars',       '$2a$10$BZkqK5hg6BqzaU.44EOhfuijg8rHEwH1tZ0LjMFuIg3re/E7In4MG', 'SELLER', true,  '2026-07-15 08:10:18.285593')
ON CONFLICT (id) DO NOTHING;

-- Sync ID sequence
SELECT setval(pg_get_serial_sequence('public.users', 'id'), (SELECT MAX(id) FROM public.users));


-- -------------------------------------------------------
-- STEP 3: Subcategories (Apparel & Kitchenware are NOT seeded by DataInitializer)
-- -------------------------------------------------------
INSERT INTO public.sub_categories (id, name, category_id)
VALUES
  (6, 'Apparel',     2),
  (7, 'Kitchenware', 3)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('public.sub_categories', 'id'), (SELECT MAX(id) FROM public.sub_categories));


-- -------------------------------------------------------
-- STEP 4: Products
-- -------------------------------------------------------
INSERT INTO public.products (id, title, description, mrp, selling_price, image, category_id, sub_category_id)
VALUES
  (1,  'Smart Watch Series 5',  'Smart Watch with Health Tracking',                     129.99, 89.99, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400',                          1, 1),
  (2,  'Wireless Headphones',   'High fidelity wireless noise-cancelling headphones',    89.99, 59.99, 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=400',                      1, 2),
  (3,  'Travel Backpack',       'Waterproof travel backpack with multiple compartments', 59.99, 39.99, 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=400',                      6, 3),
  (4,  'Running Shoes',         'Lightweight running shoes for athletes',                79.99, 49.99, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400',                      5, 4),
  (5,  'Luxury Perfume',        'Exquisite long-lasting luxury fragrance',               49.99, 29.99, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400',                      4, 5),
  (15, 'Rings',                 'Silver rings',                                         100.00, 75.00, 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=300&auto=format&fit=crop', 2, 6)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('public.products', 'id'), (SELECT MAX(id) FROM public.products));


-- -------------------------------------------------------
-- STEP 5: Inventories
-- -------------------------------------------------------
INSERT INTO public.inventories (id, product_id, stock)
VALUES
  (1, 1,  50),
  (2, 2,  50),
  (3, 3,  50),
  (4, 4,  50),
  (5, 5,  50),
  (6, 15, 100)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('public.inventories', 'id'), (SELECT MAX(id) FROM public.inventories));
