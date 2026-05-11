/*
  # Fix managers RLS and seed initial data

  1. Security Changes
    - Add anon read policy on managers table (login uses anon key)
    - Add anon read policy on complaints table (chatbot reads complaints)
  
  2. Data Seeding
    - Insert default manager: admin / admin123
    - Insert 9 rooms across 3 categories with proper room numbers
    - Insert 5 facilities with correct names matching chatbot buttons
    - Insert 5 emergency info entries
*/

-- Fix: Allow anon (unauthenticated) users to read managers for login
CREATE POLICY "Anon read managers for login" ON managers FOR SELECT TO anon USING (true);

-- Fix: Allow anon to read complaints (chatbot needs this)
CREATE POLICY "Anon read complaints" ON complaints FOR SELECT TO anon, authenticated USING (true);

-- Seed default manager (upsert to avoid duplicates)
INSERT INTO managers (username, password_hash, display_name)
VALUES ('admin', 'admin123', 'Hotel Manager')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, display_name = EXCLUDED.display_name;

-- Seed rooms
INSERT INTO rooms (room_number, category, price_per_night, features, status) VALUES
  ('101', 'Deluxe', 299, ARRAY['King Bed', 'City View', '65 sqm', 'Free Minibar'], 'empty'),
  ('102', 'Deluxe', 299, ARRAY['King Bed', 'City View', '65 sqm', 'Free Minibar'], 'empty'),
  ('103', 'Deluxe', 299, ARRAY['King Bed', 'Garden View', '65 sqm', 'Free Minibar'], 'empty'),
  ('104', 'Deluxe', 299, ARRAY['Twin Bed', 'City View', '65 sqm', 'Free Minibar'], 'empty'),
  ('105', 'Deluxe', 299, ARRAY['King Bed', 'Pool View', '65 sqm', 'Free Minibar'], 'empty'),
  ('301', 'Royal', 599, ARRAY['King Bed', 'Ocean View', '120 sqm', 'Private Lounge', 'Butler Service'], 'empty'),
  ('302', 'Royal', 599, ARRAY['King Bed', 'Ocean View', '120 sqm', 'Private Lounge', 'Butler Service'], 'empty'),
  ('303', 'Royal', 599, ARRAY['King Bed', 'Panoramic View', '120 sqm', 'Private Lounge', 'Butler Service'], 'empty'),
  ('501', 'Presidential', 999, ARRAY['Super King Bed', 'Panoramic View', '250 sqm', 'Private Pool', 'Personal Chef', 'Helipad Access'], 'empty')
ON CONFLICT (room_number) DO NOTHING;

-- Seed facilities with names matching chatbot buttons exactly
INSERT INTO facilities (name, timings, is_open, maintenance_status, rules, location, description) VALUES
  ('Swimming Pool', '6 AM - 10 PM daily', true, 'operational', 'No glass containers. Children under 12 must be accompanied.', 'Ground Floor East Wing', 'Heated outdoor infinity pool, 25m lap lane. Towels provided. Poolside bar open 9 AM - 9 PM.'),
  ('Spa', '8 AM - 9 PM', true, 'operational', 'Advance booking recommended. Arrive 15 min early.', 'Floor 2 West Wing', 'Services: Swedish Massage, Deep Tissue, Aromatherapy, Facial Treatments. Book via reception or dial ext. 108.'),
  ('Gym', '24/7', true, 'operational', 'Wipe equipment after use. Proper attire required.', 'Floor 3 East Wing', 'Treadmills, Free Weights, Resistance Machines, Yoga Studio. Personal trainer available 7 AM - 7 PM.'),
  ('Rooftop Lounge', '4 PM - 1 AM', true, 'operational', 'Smart Casual dress code. No sportswear.', 'Floor 50 Rooftop', 'Signature cocktails, panoramic city views. Live DJ on Fri & Sat. Dress code: Smart Casual.'),
  ('Valet Parking', '24/7', true, 'operational', 'Hotel guests only. Present room key.', 'Ground Floor Main Entrance', 'Available 24/7. Rate: ₹500/day for hotel guests. Request pickup via reception or dial ext. 101.')
ON CONFLICT (name) DO NOTHING;

-- Seed emergency info
INSERT INTO emergency_info (type, contacts, directions, instructions) VALUES
  ('Fire Exit', 'Ext. 100 / 911', 'Nearest fire exit is marked with green signs on each floor. Assembly point is the main parking lot.', 'Do not use elevators. Follow illuminated exit signs. Proceed to assembly point.'),
  ('Medical Emergency', 'Ext. 109 / 911', 'First aid kit located at reception. AED on Floor 1 lobby.', 'Call ext. 109 immediately. Stay with the person. Do not move if spinal injury suspected.'),
  ('Security Help', 'Ext. 110 / 911', 'Security office on Ground Floor near main entrance.', 'Lock your door. Do not open for strangers. Call security immediately.'),
  ('Lost Item', 'Ext. 112', 'Lost and found at reception desk.', 'Report immediately to reception. Provide description and last known location.'),
  ('Navigation Help', 'Ext. 0', 'Maps available at reception. Digital kiosks on each floor.', 'Follow color-coded signage: Blue=Rooms, Gold=Dining, Green=Facilities, Red=Emergency.')
ON CONFLICT DO NOTHING;
