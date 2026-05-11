/*
  # WildWings Premium Hotel - Complete Database Schema

  1. New Tables
    - `rooms` - Hotel room inventory with categories, pricing, status, features, images
    - `bookings` - Guest booking requests with room, guest details, WhatsApp, status
    - `complaints` - Guest complaints with room number, issue type, description, status
    - `menu_items` - Restaurant menu with category, pricing, availability, chef specials
    - `dining_reservations` - Table reservations with guest count, timing, WhatsApp
    - `facilities` - Hotel facilities with timings, status, rules, location
    - `emergency_info` - Emergency contacts, directions, instructions by type
    - `notifications` - Manager-pushed live notifications
    - `announcements` - Hotel events, specials, seasonal announcements
    - `chatbot_knowledge` - FAQs, policies, discounts, custom bot responses
    - `reception_services` - Airport pickup, wake-up calls, concierge requests
    - `managers` - Manager credentials for dashboard access

  2. Security
    - RLS enabled on all tables
    - Public read access for rooms, menu_items, facilities, emergency_info, notifications, announcements, chatbot_knowledge
    - Manager-only write access for operational tables
    - Public insert for bookings, complaints, dining_reservations, reception_services (guest submissions)
*/

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('Deluxe', 'Royal', 'Presidential')),
  price_per_night numeric NOT NULL DEFAULT 0,
  features text[] DEFAULT '{}',
  image_url text DEFAULT '',
  status text NOT NULL DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id),
  room_number text NOT NULL,
  category text NOT NULL,
  guest_name text DEFAULT '',
  whatsapp_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'checked_in', 'checked_out')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text NOT NULL,
  issue_type text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'technician_assigned', 'resolved')),
  technician_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Beverages')),
  price numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  is_available boolean DEFAULT true,
  is_chef_special boolean DEFAULT false,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dining reservations table
CREATE TABLE IF NOT EXISTS dining_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text DEFAULT '',
  guest_count integer NOT NULL DEFAULT 1,
  dining_category text NOT NULL,
  timing text NOT NULL,
  whatsapp_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  timings text DEFAULT '',
  is_open boolean DEFAULT true,
  maintenance_status text DEFAULT 'operational' CHECK (maintenance_status IN ('operational', 'under_maintenance', 'closed')),
  rules text DEFAULT '',
  location text DEFAULT '',
  description text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Emergency info table
CREATE TABLE IF NOT EXISTS emergency_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('Fire Exit', 'Medical Emergency', 'Security Help', 'Lost Item', 'Navigation Help')),
  contacts text DEFAULT '',
  directions text DEFAULT '',
  instructions text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'emergency')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  event_date date,
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Chatbot knowledge table
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('FAQ', 'Policy', 'Discount', 'Promotional Offer', 'Custom Response')),
  question text DEFAULT '',
  answer text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Reception services table
CREATE TABLE IF NOT EXISTS reception_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL CHECK (service_type IN ('Airport Pickup', 'Wake-up Call', 'Extend Stay', 'Late Checkout', 'General Support')),
  guest_name text DEFAULT '',
  room_number text DEFAULT '',
  details text DEFAULT '',
  whatsapp_number text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Managers table
CREATE TABLE IF NOT EXISTS managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text DEFAULT 'Manager',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE reception_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;

-- Public read policies (guests need to see these)
CREATE POLICY "Public read rooms" ON rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read menu" ON menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read facilities" ON facilities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read emergency" ON emergency_info FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read announcements" ON announcements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read chatbot knowledge" ON chatbot_knowledge FOR SELECT TO anon, authenticated USING (true);

-- Guest submission policies (anyone can submit bookings, complaints, etc.)
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public insert complaints" ON complaints FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public insert dining reservations" ON dining_reservations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public insert reception services" ON reception_services FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated (manager) write policies
CREATE POLICY "Authenticated manage rooms" ON rooms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update rooms" ON rooms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete rooms" ON rooms FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated manage bookings" ON bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated update bookings" ON bookings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete bookings" ON bookings FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated manage complaints" ON complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated update complaints" ON complaints FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete complaints" ON complaints FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated manage menu" ON menu_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update menu" ON menu_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete menu" ON menu_items FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated manage dining reservations" ON dining_reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated update dining reservations" ON dining_reservations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete dining reservations" ON dining_reservations FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated manage facilities" ON facilities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update facilities" ON facilities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete facilities" ON facilities FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated manage emergency" ON emergency_info FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update emergency" ON emergency_info FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete emergency" ON emergency_info FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated manage notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update notifications" ON notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete notifications" ON notifications FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated manage announcements" ON announcements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update announcements" ON announcements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete announcements" ON announcements FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated manage chatbot knowledge" ON chatbot_knowledge FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update chatbot knowledge" ON chatbot_knowledge FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete chatbot knowledge" ON chatbot_knowledge FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated manage reception" ON reception_services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated update reception" ON reception_services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete reception" ON reception_services FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated read managers" ON managers FOR SELECT TO authenticated USING (true);
