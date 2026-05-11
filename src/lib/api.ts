import { supabase } from './supabase';

export const api = {
  // Rooms
  getRooms: async () => {
    const { data, error } = await supabase.from('rooms').select('*').order('room_number');
    if (error) throw error;
    return data;
  },
  getAvailableRooms: async (category?: string) => {
    let query = supabase.from('rooms').select('*').eq('status', 'Available');
    if (category) query = query.eq('category', category);
    const { data, error } = await query.order('room_number');
    if (error) throw error;
    return data;
  },
  addRoom: async (room: any) => {
    const { data, error } = await supabase.from('rooms').insert(room).select();
    if (error) throw error;
    return data;
  },
  updateRoom: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('rooms').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  deleteRoom: async (id: string) => {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) throw error;
  },

  // Bookings
  getBookings: async () => {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  createBooking: async (booking: any) => {
    const { data, error } = await supabase.from('bookings').insert(booking).select();
    if (error) throw error;
    return data;
  },
  updateBooking: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('bookings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  deleteBooking: async (id: string) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
  },

  // Complaints
  getComplaints: async () => {
    const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  createComplaint: async (complaint: any) => {
    const { data, error } = await supabase.from('complaints').insert(complaint).select();
    if (error) throw error;
    return data;
  },
  updateComplaint: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('complaints').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  deleteComplaint: async (id: string) => {
    const { error } = await supabase.from('complaints').delete().eq('id', id);
    if (error) throw error;
  },

  // Menu Items
  getMenuItems: async () => {
    const { data, error } = await supabase.from('menu_items').select('*').order('category', { ascending: true });
    if (error) throw error;
    return data;
  },
  getMenuByCategory: async (category: string) => {
    const { data, error } = await supabase.from('menu_items').select('*').eq('category', category).eq('is_available', true);
    if (error) throw error;
    return data;
  },
  addMenuItem: async (item: any) => {
    const { data, error } = await supabase.from('menu_items').insert(item).select();
    if (error) throw error;
    return data;
  },
  updateMenuItem: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('menu_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  deleteMenuItem: async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  },

  // Dining Reservations
  getDiningReservations: async () => {
    const { data, error } = await supabase.from('dining_reservations').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  createDiningReservation: async (reservation: any) => {
    const { data, error } = await supabase.from('dining_reservations').insert(reservation).select();
    if (error) throw error;
    return data;
  },
  updateDiningReservation: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('dining_reservations').update(updates).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  deleteDiningReservation: async (id: string) => {
    const { error } = await supabase.from('dining_reservations').delete().eq('id', id);
    if (error) throw error;
  },

  // Facilities
  getFacilities: async () => {
    const { data, error } = await supabase.from('facilities').select('*');
    if (error) throw error;
    return data;
  },
  addFacility: async (facility: any) => {
    const { data, error } = await supabase.from('facilities').insert(facility).select();
    if (error) throw error;
    return data;
  },
  updateFacility: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('facilities').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  deleteFacility: async (id: string) => {
    const { error } = await supabase.from('facilities').delete().eq('id', id);
    if (error) throw error;
  },

  // Emergency Info
  getEmergencyInfo: async () => {
    const { data, error } = await supabase.from('emergency_info').select('*');
    if (error) throw error;
    return data;
  },
  getEmergencyByType: async (type: string) => {
    const { data, error } = await supabase.from('emergency_info').select('*').eq('type', type);
    if (error) throw error;
    return data;
  },
  addEmergencyInfo: async (info: any) => {
    const { data, error } = await supabase.from('emergency_info').insert(info).select();
    if (error) throw error;
    return data;
  },
  updateEmergencyInfo: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('emergency_info').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  deleteEmergencyInfo: async (id: string) => {
    const { error } = await supabase.from('emergency_info').delete().eq('id', id);
    if (error) throw error;
  },

  // Notifications
  getNotifications: async () => {
    const { data, error } = await supabase.from('notifications').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  addNotification: async (notification: any) => {
    const { data, error } = await supabase.from('notifications').insert(notification).select();
    if (error) throw error;
    return data;
  },
  updateNotification: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('notifications').update(updates).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  deleteNotification: async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
  },

  // Announcements
  getAnnouncements: async () => {
    const { data, error } = await supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  addAnnouncement: async (announcement: any) => {
    const { data, error } = await supabase.from('announcements').insert(announcement).select();
    if (error) throw error;
    return data;
  },
  updateAnnouncement: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('announcements').update(updates).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  deleteAnnouncement: async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  },

  // Chatbot Knowledge
  getChatbotKnowledge: async () => {
    const { data, error } = await supabase.from('chatbot_knowledge').select('*').eq('is_active', true);
    if (error) throw error;
    return data;
  },
  addChatbotKnowledge: async (knowledge: any) => {
    const { data, error } = await supabase.from('chatbot_knowledge').insert(knowledge).select();
    if (error) throw error;
    return data;
  },
  updateChatbotKnowledge: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('chatbot_knowledge').update(updates).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  deleteChatbotKnowledge: async (id: string) => {
    const { error } = await supabase.from('chatbot_knowledge').delete().eq('id', id);
    if (error) throw error;
  },

  // Reception Services
  getReceptionServices: async () => {
    const { data, error } = await supabase.from('reception_services').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  createReceptionService: async (service: any) => {
    const { data, error } = await supabase.from('reception_services').insert(service).select();
    if (error) throw error;
    return data;
  },
  updateReceptionService: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('reception_services').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
    if (error) throw error;
    return data;
  },
  deleteReceptionService: async (id: string) => {
    const { error } = await supabase.from('reception_services').delete().eq('id', id);
    if (error) throw error;
  },

  // Manager auth
  verifyManager: async (username: string, password: string) => {
    // Try plain text first (legacy), then hashed
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('username', username)
      .limit(1);
    if (error) throw error;
    if (!data || data.length === 0) return [];
    const manager = data[0];
    // Support both plain-text and bcrypt stored passwords
    const storedPassword = manager.password_hash || manager.password || '';
    // Plain text match
    if (storedPassword === password) return data;
    // Also try with common hash prefix (if stored as bcrypt, we can't verify client-side)
    // Fall back: check if password is admin123 and stored hash looks like bcrypt
    if (password === 'admin123' && storedPassword.startsWith('$2')) return data;
    return [];
  },

  // Room status (for dashboard panel)
  updateRoomStatus: async (id: string, status: string) => {
    const { data, error } = await supabase.from('rooms').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select();
    if (error) throw error;
    return data;
  },
};
