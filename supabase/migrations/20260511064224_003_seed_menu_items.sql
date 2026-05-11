/*
  # Seed menu items and add restaurant column

  1. New Column
    - `menu_items.restaurant` (text, default 'The Emerald')
      - Values: 'The Golden Fork', 'Sky Lounge', 'The Emerald'
      - Identifies which restaurant serves each item

  2. Data
    - 25 menu items across 5 categories (Breakfast, Lunch, Dinner, Desserts, Beverages)
    - Each item has: name, category, price (INR), is_available (true), is_chef_special, restaurant
    - Only inserted if the table is empty (count = 0)

  3. Security
    - No RLS changes (existing policies remain)
    - Anon read access already exists from previous migration

  4. Important Notes
    1) The restaurant column is added with IF NOT EXISTS check
    2) Seed data is only inserted when the table has zero rows
    3) Chef special items: Eggs Benedict, Truffle Pasta, Wagyu Beef Tenderloin,
       Chef's Tasting Menu, Dark Chocolate Fondant, Craft Cocktail
*/

-- Add restaurant column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'restaurant'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN restaurant text DEFAULT 'The Emerald';
  END IF;
END $$;

-- Seed menu items only if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1) THEN
    INSERT INTO menu_items (name, category, price, is_available, is_chef_special, restaurant) VALUES
      -- BREAKFAST (The Emerald)
      ('Continental Spread', 'Breakfast', 850, true, false, 'The Emerald'),
      ('Eggs Benedict', 'Breakfast', 650, true, true, 'The Emerald'),
      ('Avocado Toast', 'Breakfast', 550, true, false, 'The Emerald'),
      ('Fresh Fruit Platter', 'Breakfast', 450, true, false, 'The Emerald'),
      ('Pancake Stack', 'Breakfast', 600, true, false, 'The Emerald'),

      -- LUNCH (The Emerald)
      ('Grilled Chicken Caesar', 'Lunch', 1100, true, false, 'The Emerald'),
      ('Truffle Pasta', 'Lunch', 1350, true, true, 'The Emerald'),
      ('Pan-Seared Salmon', 'Lunch', 1600, true, false, 'The Emerald'),
      ('Margherita Pizza', 'Lunch', 900, true, false, 'The Emerald'),
      ('Mezze Platter', 'Lunch', 1050, true, false, 'The Emerald'),

      -- DINNER (The Golden Fork)
      ('Wagyu Beef Tenderloin', 'Dinner', 4500, true, true, 'The Golden Fork'),
      ('Lobster Thermidor', 'Dinner', 3800, true, false, 'The Golden Fork'),
      ('Rack of Lamb', 'Dinner', 3200, true, false, 'The Golden Fork'),
      ('Mushroom Risotto', 'Dinner', 1800, true, false, 'The Golden Fork'),
      ('Chef''s Tasting Menu', 'Dinner', 6500, true, true, 'The Golden Fork'),

      -- DESSERTS (The Golden Fork)
      ('Crème Brûlée', 'Desserts', 650, true, false, 'The Golden Fork'),
      ('Dark Chocolate Fondant', 'Desserts', 700, true, true, 'The Golden Fork'),
      ('Mango Sorbet', 'Desserts', 500, true, false, 'The Golden Fork'),
      ('Tiramisu', 'Desserts', 750, true, false, 'The Golden Fork'),
      ('Cheese Board', 'Desserts', 1200, true, false, 'The Golden Fork'),

      -- BEVERAGES (Sky Lounge)
      ('Fresh Juice', 'Beverages', 400, true, false, 'Sky Lounge'),
      ('Mocktail', 'Beverages', 550, true, false, 'Sky Lounge'),
      ('House Wine (glass)', 'Beverages', 950, true, false, 'Sky Lounge'),
      ('Craft Cocktail', 'Beverages', 1100, true, true, 'Sky Lounge'),
      ('Artisan Coffee', 'Beverages', 350, true, false, 'Sky Lounge');
  END IF;
END $$;
