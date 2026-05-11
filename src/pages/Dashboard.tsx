import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bed, Utensils, Building, AlertTriangle, ConciergeBell,
  Wrench, Calendar, Bot, Bell, Megaphone, LogOut, Menu, X,
  Plus, Pencil, Trash2, Check, Ban, ToggleLeft, ToggleRight,
  Loader2, Crown, ChevronDown, Save, Search
} from 'lucide-react';
import { api } from '../lib/api';

// ────────────────────────────── Constants ──────────────────────────────

const gold = '#D4AF37';
const goldDark = '#B8941F';
const bg = '#050505';

const SECTIONS = [
  { key: 'rooms', label: 'Room Management', icon: Bed },
  { key: 'restaurant', label: 'Restaurant Management', icon: Utensils },
  { key: 'facilities', label: 'Facilities Management', icon: Building },
  { key: 'emergency', label: 'Emergency Management', icon: AlertTriangle },
  { key: 'reception', label: 'Reception Services', icon: ConciergeBell },
  { key: 'complaints', label: 'Complaints Panel', icon: Wrench },
  { key: 'roomstatus', label: 'Room Status', icon: Bed },
  { key: 'bookings', label: 'Booking Requests', icon: Calendar },
  { key: 'chatbot', label: 'Chatbot Knowledge', icon: Bot },
  { key: 'notifications', label: 'Notifications Center', icon: Bell },
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

const ROOM_CATEGORIES = ['Deluxe', 'Royal', 'Presidential'];
const ROOM_STATUSES = ['empty', 'occupied', 'maintenance'];
const MENU_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Beverages'];
const KB_CATEGORIES = ['FAQ', 'Policy', 'Discount', 'Promotional Offer', 'Custom Response'];
const NOTIF_TYPES = ['info', 'warning', 'emergency'];

// ────────────────────────────── Shared Styles ──────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '1rem',
  padding: '1.5rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.5rem',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
};

const goldBtn: React.CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  border: 'none',
  background: `linear-gradient(135deg, ${gold}, ${goldDark})`,
  color: bg,
  fontWeight: 600,
  fontSize: '0.8rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  transition: 'opacity 0.2s, transform 0.1s',
};

const dangerBtn: React.CSSProperties = {
  ...goldBtn,
  background: 'rgba(239,68,68,0.15)',
  color: '#ef4444',
  border: '1px solid rgba(239,68,68,0.3)',
};

const smallBtn: React.CSSProperties = {
  padding: '0.35rem 0.65rem',
  borderRadius: '0.375rem',
  border: 'none',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  transition: 'opacity 0.2s',
};

const statusBadge = (status: string): React.CSSProperties => {
  const s = status.toLowerCase();
  let bg = 'rgba(255,255,255,0.1)';
  let color = '#aaa';
  if (['active', 'approved', 'completed', 'empty', 'available', 'confirmed'].includes(s)) {
    bg = 'rgba(34,197,94,0.15)'; color = '#22c55e';
  } else if (['pending', 'maintenance', 'reserved'].includes(s)) {
    bg = 'rgba(234,179,8,0.15)'; color = '#eab308';
  } else if (['rejected', 'emergency', 'closed', 'occupied'].includes(s)) {
    bg = 'rgba(239,68,68,0.15)'; color = '#ef4444';
  }
  return { padding: '0.2rem 0.6rem', borderRadius: '9999px', background: bg, color, fontSize: '0.75rem', fontWeight: 600 };
};

const tableTh: React.CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  color: gold,
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  borderBottom: '1px solid rgba(212,175,55,0.2)',
};

const tableTd: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontSize: '0.85rem',
  color: 'rgba(255,255,255,0.85)',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
};

// ────────────────────────────── Toast Component ──────────────────────────────

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    style={{
      position: 'fixed',
      top: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      padding: '0.875rem 1.25rem',
      borderRadius: '0.75rem',
      background: type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
      border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      color: type === 'success' ? '#22c55e' : '#ef4444',
      fontWeight: 600,
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backdropFilter: 'blur(12px)',
    }}
  >
    {type === 'success' ? <Check size={16} /> : <X size={16} />}
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem' }}>
      <X size={14} />
    </button>
  </motion.div>
);

// ────────────────────────────── Section: Room Management ──────────────────────────────

const RoomManagement = ({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ room_number: '', category: 'Standard', price: '', features: '', image_url: '', status: 'empty' });

  const load = useCallback(async () => {
    try { setLoading(true); setRooms(await api.getRooms()); } catch { toast('Failed to load rooms', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ room_number: '', category: 'Standard', price: '', features: '', image_url: '', status: 'empty' }); setShowForm(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), features: form.features.split(',').map(f => f.trim()).filter(Boolean) };
      if (editing) { await api.updateRoom(editing.id, payload); toast('Room updated', 'success'); }
      else { await api.addRoom(payload); toast('Room added', 'success'); }
      resetForm(); load();
    } catch { toast('Operation failed', 'error'); }
  };

  const handleEdit = (room: any) => {
    setEditing(room);
    setForm({ room_number: room.room_number, category: room.category, price: String(room.price), features: (room.features || []).join(', '), image_url: room.image_url || '', status: room.status });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this room?')) return;
    try { await api.deleteRoom(id); toast('Room deleted', 'success'); load(); } catch { toast('Delete failed', 'error'); }
  };

  if (loading) return <CenterLoader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: gold, fontSize: '1.25rem', fontWeight: 700 }}>Rooms ({rooms.length})</h2>
        <button style={goldBtn} onClick={() => { resetForm(); setShowForm(true); }}><Plus size={15} /> Add Room</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ color: gold, fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{editing ? 'Edit Room' : 'Add Room'}</h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <input style={inputStyle} placeholder="Room Number" value={form.room_number} onChange={e => setForm({ ...form, room_number: e.target.value })} required />
                <select style={selectStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {ROOM_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#222' }}>{c}</option>)}
                </select>
                <input style={inputStyle} type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                <input style={inputStyle} placeholder="Features (comma-separated)" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} />
                <input style={inputStyle} placeholder="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                <select style={selectStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {ROOM_STATUSES.map(s => <option key={s} value={s} style={{ background: '#222' }}>{s}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                  <button type="submit" style={goldBtn}><Save size={14} /> {editing ? 'Update' : 'Add'}</button>
                  <button type="button" style={{ ...smallBtn, background: 'rgba(255,255,255,0.1)', color: '#aaa' }} onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ ...glassCard, padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Room #', 'Category', 'Price', 'Status', 'Actions'].map(h => <th key={h} style={tableTh}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td style={tableTd}>{room.room_number}</td>
                <td style={tableTd}>{room.category}</td>
                <td style={tableTd}>${room.price}</td>
                <td style={tableTd}><span style={statusBadge(room.status)}>{room.status}</span></td>
                <td style={tableTd}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ ...smallBtn, background: 'rgba(212,175,55,0.15)', color: gold }} onClick={() => handleEdit(room)}><Pencil size={13} /> Edit</button>
                    <button style={{ ...smallBtn, ...dangerBtn, padding: '0.35rem 0.65rem' }} onClick={() => handleDelete(room.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && <tr><td colSpan={5} style={{ ...tableTd, textAlign: 'center', color: '#666' }}>No rooms found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ────────────────────────────── Section: Restaurant Management ──────────────────────────────

const RestaurantManagement = ({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', category: 'Appetizer', price: '', description: '', is_available: true, is_chef_special: false, image_url: '' });

  const load = useCallback(async () => {
    try { setLoading(true); setItems(await api.getMenuItems()); } catch { toast('Failed to load menu', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ name: '', category: 'Appetizer', price: '', description: '', is_available: true, is_chef_special: false, image_url: '' }); setShowForm(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editing) { await api.updateMenuItem(editing.id, payload); toast('Item updated', 'success'); }
      else { await api.addMenuItem(payload); toast('Item added', 'success'); }
      resetForm(); load();
    } catch { toast('Operation failed', 'error'); }
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ name: item.name, category: item.category, price: String(item.price), description: item.description || '', is_available: item.is_available, is_chef_special: item.is_chef_special, image_url: item.image_url || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try { await api.deleteMenuItem(id); toast('Item deleted', 'success'); load(); } catch { toast('Delete failed', 'error'); }
  };

  const toggleAvailability = async (item: any) => {
    try { await api.updateMenuItem(item.id, { is_available: !item.is_available }); toast('Availability toggled', 'success'); load(); } catch { toast('Toggle failed', 'error'); }
  };

  if (loading) return <CenterLoader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: gold, fontSize: '1.25rem', fontWeight: 700 }}>Menu Items ({items.length})</h2>
        <button style={goldBtn} onClick={() => { resetForm(); setShowForm(true); }}><Plus size={15} /> Add Item</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ color: gold, fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{editing ? 'Edit Item' : 'Add Item'}</h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <input style={inputStyle} placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                <select style={selectStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {MENU_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#222' }}>{c}</option>)}
                </select>
                <input style={inputStyle} type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                <input style={inputStyle} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <input style={inputStyle} placeholder="Image URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_available} onChange={e => setForm({ ...form, is_available: e.target.checked })} /> Available
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_chef_special} onChange={e => setForm({ ...form, is_chef_special: e.target.checked })} /> Chef Special
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                  <button type="submit" style={goldBtn}><Save size={14} /> {editing ? 'Update' : 'Add'}</button>
                  <button type="button" style={{ ...smallBtn, background: 'rgba(255,255,255,0.1)', color: '#aaa' }} onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ ...glassCard, padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Name', 'Category', 'Price', 'Available', 'Chef Special', 'Actions'].map(h => <th key={h} style={tableTh}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={tableTd}>{item.name}</td>
                <td style={tableTd}>{item.category}</td>
                <td style={tableTd}>${item.price}</td>
                <td style={tableTd}>
                  <button onClick={() => toggleAvailability(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.is_available ? '#22c55e' : '#ef4444' }}>
                    {item.is_available ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </td>
                <td style={tableTd}>{item.is_chef_special ? <span style={{ color: gold, fontWeight: 600 }}>Yes</span> : 'No'}</td>
                <td style={tableTd}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ ...smallBtn, background: 'rgba(212,175,55,0.15)', color: gold }} onClick={() => handleEdit(item)}><Pencil size={13} /> Edit</button>
                    <button style={{ ...smallBtn, ...dangerBtn, padding: '0.35rem 0.65rem' }} onClick={() => handleDelete(item.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ ...tableTd, textAlign: 'center', color: '#666' }}>No menu items found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ────────────────────────────── Section: Facilities Management ──────────────────────────────

const FacilitiesManagement = ({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ timings: '', is_open: true, under_maintenance: false });

  const load = useCallback(async () => {
    try { setLoading(true); setFacilities(await api.getFacilities()); } catch { toast('Failed to load facilities', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleEdit = (facility: any) => {
    setEditing(facility);
    setForm({ timings: facility.timings || '', is_open: facility.is_open, under_maintenance: facility.under_maintenance });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.updateFacility(editing.id, form);
      toast('Facility updated', 'success');
      setEditing(null);
      load();
    } catch { toast('Update failed', 'error'); }
  };

  if (loading) return <CenterLoader />;

  return (
    <div>
      <h2 style={{ color: gold, fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Facilities ({facilities.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {facilities.map(facility => (
          <motion.div key={facility.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={glassCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
              <h3 style={{ color: gold, fontSize: '1.05rem', fontWeight: 700 }}>{facility.name}</h3>
              <span style={statusBadge(facility.is_open ? 'open' : 'closed')}>{facility.is_open ? 'Open' : 'Closed'}</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Timings: {facility.timings || 'N/A'}</p>
            {facility.under_maintenance && <p style={{ color: '#eab308', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Under Maintenance</p>}
            <button style={{ ...smallBtn, background: 'rgba(212,175,55,0.15)', color: gold, marginTop: '0.5rem' }} onClick={() => handleEdit(facility)}><Pencil size={13} /> Edit</button>
          </motion.div>
        ))}
        {facilities.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>No facilities found</p>}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
            onClick={() => setEditing(null)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              style={{ ...glassCard, width: '100%', maxWidth: '420px', margin: '1rem' }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ color: gold, fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Edit: {editing.name}</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input style={inputStyle} placeholder="Timings" value={form.timings} onChange={e => setForm({ ...form, timings: e.target.value })} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_open} onChange={e => setForm({ ...form, is_open: e.target.checked })} /> Open
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.under_maintenance} onChange={e => setForm({ ...form, under_maintenance: e.target.checked })} /> Under Maintenance
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" style={goldBtn}><Save size={14} /> Save</button>
                  <button type="button" style={{ ...smallBtn, background: 'rgba(255,255,255,0.1)', color: '#aaa' }} onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ────────────────────────────── Section: Emergency Management ──────────────────────────────

const EmergencyManagement = ({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) => {
  const [info, setInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ type: 'fire', contact_number: '', directions: '', instructions: '' });

  const load = useCallback(async () => {
    try { setLoading(true); setInfo(await api.getEmergencyInfo()); } catch { toast('Failed to load emergency info', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ type: 'fire', contact_number: '', directions: '', instructions: '' }); setShowForm(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.updateEmergencyInfo(editing.id, form); toast('Emergency info updated', 'success'); }
      else { await api.addEmergencyInfo(form); toast('Emergency info added', 'success'); }
      resetForm(); load();
    } catch { toast('Operation failed', 'error'); }
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ type: item.type, contact_number: item.contact_number || '', directions: item.directions || '', instructions: item.instructions || '' });
    setShowForm(true);
  };

  const EMERGENCY_TYPES = ['fire', 'medical', 'natural_disaster', 'security', 'general'];

  if (loading) return <CenterLoader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: gold, fontSize: '1.25rem', fontWeight: 700 }}>Emergency Info ({info.length})</h2>
        <button style={goldBtn} onClick={() => { resetForm(); setShowForm(true); }}><Plus size={15} /> Add Entry</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ color: gold, fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{editing ? 'Edit' : 'Add'} Emergency Info</h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <select style={selectStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {EMERGENCY_TYPES.map(t => <option key={t} value={t} style={{ background: '#222' }}>{t.replace('_', ' ')}</option>)}
                </select>
                <input style={inputStyle} placeholder="Contact Number" value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} />
                <input style={inputStyle} placeholder="Directions" value={form.directions} onChange={e => setForm({ ...form, directions: e.target.value })} />
                <input style={inputStyle} placeholder="Instructions" value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} />
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                  <button type="submit" style={goldBtn}><Save size={14} /> {editing ? 'Update' : 'Add'}</button>
                  <button type="button" style={{ ...smallBtn, background: 'rgba(255,255,255,0.1)', color: '#aaa' }} onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {info.map(item => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={glassCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={16} color="#ef4444" />
                  <span style={{ color: gold, fontWeight: 700, textTransform: 'capitalize' }}>{item.type.replace('_', ' ')}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Contact: {item.contact_number || 'N/A'}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Directions: {item.directions || 'N/A'}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Instructions: {item.instructions || 'N/A'}</p>
              </div>
              <button style={{ ...smallBtn, background: 'rgba(212,175,55,0.15)', color: gold }} onClick={() => handleEdit(item)}><Pencil size={13} /> Edit</button>
            </div>
          </motion.div>
        ))}
        {info.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>No emergency info found</p>}
      </div>
    </div>
  );
};

// ────────────────────────────── Section: Reception Services ──────────────────────────────

const ReceptionServices = ({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setLoading(true); setServices(await api.getReceptionServices()); } catch { toast('Failed to load services', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try { await api.updateReceptionService(id, { status }); toast(`Status updated to ${status}`, 'success'); load(); } catch { toast('Update failed', 'error'); }
  };

  if (loading) return <CenterLoader />;

  return (
    <div>
      <h2 style={{ color: gold, fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Reception Requests ({services.length})</h2>
      <div style={{ ...glassCard, padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Type', 'Guest', 'Room', 'Status', 'Actions'].map(h => <th key={h} style={tableTh}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {services.map(svc => (
              <tr key={svc.id}>
                <td style={tableTd}>{svc.service_type}</td>
                <td style={tableTd}>{svc.guest_name || 'N/A'}</td>
                <td style={tableTd}>{svc.room_number || 'N/A'}</td>
                <td style={tableTd}><span style={statusBadge(svc.status)}>{svc.status}</span></td>
                <td style={tableTd}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {svc.status !== 'confirmed' && <button style={{ ...smallBtn, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }} onClick={() => updateStatus(svc.id, 'confirmed')}><Check size={12} /> Confirm</button>}
                    {svc.status !== 'completed' && <button style={{ ...smallBtn, background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }} onClick={() => updateStatus(svc.id, 'completed')}><Check size={12} /> Complete</button>}
                    {svc.status === 'pending' && <button style={{ ...smallBtn, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }} onClick={() => updateStatus(svc.id, 'rejected')}><Ban size={12} /> Reject</button>}
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && <tr><td colSpan={5} style={{ ...tableTd, textAlign: 'center', color: '#666' }}>No requests found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ────────────────────────────── Section: Complaints Panel ──────────────────────────────

const ComplaintsPanel = ({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: '', technician: '' });

  const load = useCallback(async () => {
    try { setLoading(true); setComplaints(await api.getComplaints()); } catch { toast('Failed to load complaints', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async (id: string) => {
    try { await api.updateComplaint(id, editForm); toast('Complaint updated', 'success'); setEditingId(null); load(); } catch { toast('Update failed', 'error'); }
  };

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setEditForm({ status: c.status, technician: c.assigned_technician || '' });
  };

  if (loading) return <CenterLoader />;

  return (
    <div>
      <h2 style={{ color: gold, fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Complaints ({complaints.length})</h2>
      <div style={{ ...glassCard, padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Room #', 'Issue', 'Description', 'Status', 'Technician', 'Actions'].map(h => <th key={h} style={tableTh}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id}>
                <td style={tableTd}>{c.room_number}</td>
                <td style={tableTd}>{c.issue_type || c.issue}</td>
                <td style={{ ...tableTd, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</td>
                <td style={tableTd}>
                  {editingId === c.id ? (
                    <select style={{ ...selectStyle, width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                      {['pending', 'in_progress', 'resolved'].map(s => <option key={s} value={s} style={{ background: '#222' }}>{s}</option>)}
                    </select>
                  ) : <span style={statusBadge(c.status)}>{c.status}</span>}
                </td>
                <td style={tableTd}>
                  {editingId === c.id ? (
                    <input style={{ ...inputStyle, width: '120px', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} value={editForm.technician} onChange={e => setEditForm({ ...editForm, technician: e.target.value })} placeholder="Technician" />
                  ) : c.assigned_technician || 'Unassigned'}
                </td>
                <td style={tableTd}>
                  {editingId === c.id ? (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button style={{ ...smallBtn, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }} onClick={() => handleUpdate(c.id)}><Check size={12} /> Save</button>
                      <button style={{ ...smallBtn, background: 'rgba(255,255,255,0.1)', color: '#aaa' }} onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button style={{ ...smallBtn, background: 'rgba(212,175,55,0.15)', color: gold }} onClick={() => startEdit(c)}><Pencil size={13} /> Edit</button>
                  )}
                </td>
              </tr>
            ))}
            {complaints.length === 0 && <tr><td colSpan={6} style={{ ...tableTd, textAlign: 'center', color: '#666' }}>No complaints found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ────────────────────────────── Section: Room Status Panel ──────────────────────────────

const RoomStatusPanel = ({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setLoading(true); setRooms(await api.getRooms()); } catch { toast('Failed to load rooms', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const next = currentStatus === 'empty' ? 'occupied' : currentStatus === 'occupied' ? 'maintenance' : 'empty';
    try {
      await api.updateRoomStatus(id, next);
      toast(`Room status updated to ${next}`, 'success');
      load();
    } catch { toast('Update failed', 'error'); }
  };

  const statusLabel = (s: string) => {
    if (s === 'empty') return 'Available';
    if (s === 'occupied') return 'Occupied';
    return 'Maintenance';
  };

  if (loading) return <CenterLoader />;

  return (
    <div>
      <h2 style={{ color: gold, fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Room Status ({rooms.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {rooms.map(room => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={glassCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ color: gold, fontSize: '1.05rem', fontWeight: 700 }}>Room {room.room_number}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{room.category} - ${room.price_per_night}/night</p>
              </div>
              <span style={statusBadge(room.status === 'empty' ? 'available' : room.status)}>{statusLabel(room.status)}</span>
            </div>
            <button
              onClick={() => toggleStatus(room.id, room.status)}
              style={{ ...smallBtn, background: 'rgba(212,175,55,0.15)', color: gold, width: '100%', justifyContent: 'center' }}
            >
              Set {statusLabel(room.status === 'empty' ? 'occupied' : room.status === 'occupied' ? 'maintenance' : 'empty')}
            </button>
          </motion.div>
        ))}
        {rooms.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>No rooms found</p>}
      </div>
    </div>
  );
};

// ────────────────────────────── Section: Booking Requests ──────────────────────────────

const BookingRequests = ({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setLoading(true); setBookings(await api.getBookings()); } catch { toast('Failed to load bookings', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, status: string) => {
    try { await api.updateBooking(id, { status }); toast(`Booking ${status}`, 'success'); load(); } catch { toast('Action failed', 'error'); }
  };

  if (loading) return <CenterLoader />;

  return (
    <div>
      <h2 style={{ color: gold, fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Booking Requests ({bookings.length})</h2>
      <div style={{ ...glassCard, padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Room', 'Category', 'WhatsApp', 'Status', 'Time', 'Actions'].map(h => <th key={h} style={tableTh}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td style={tableTd}>{b.room_number || 'N/A'}</td>
                <td style={tableTd}>{b.category || 'N/A'}</td>
                <td style={tableTd}>{b.whatsapp_number || b.phone || 'N/A'}</td>
                <td style={tableTd}><span style={statusBadge(b.status)}>{b.status}</span></td>
                <td style={tableTd}>{b.created_at ? new Date(b.created_at).toLocaleString() : 'N/A'}</td>
                <td style={tableTd}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {b.status === 'pending' && (
                      <>
                        <button style={{ ...smallBtn, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }} onClick={() => handleAction(b.id, 'approved')}><Check size={12} /> Approve</button>
                        <button style={{ ...smallBtn, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }} onClick={() => handleAction(b.id, 'rejected')}><Ban size={12} /> Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && <tr><td colSpan={6} style={{ ...tableTd, textAlign: 'center', color: '#666' }}>No bookings found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ────────────────────────────── Section: Chatbot Knowledge ──────────────────────────────

const ChatbotKnowledge = ({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ category: 'FAQ', question: '', answer: '', keywords: '' });

  const load = useCallback(async () => {
    try { setLoading(true); setEntries(await api.getChatbotKnowledge()); } catch { toast('Failed to load knowledge', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ category: 'FAQ', question: '', answer: '', keywords: '' }); setShowForm(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean), is_active: true };
      if (editing) { await api.updateChatbotKnowledge(editing.id, payload); toast('Entry updated', 'success'); }
      else { await api.addChatbotKnowledge(payload); toast('Entry added', 'success'); }
      resetForm(); load();
    } catch { toast('Operation failed', 'error'); }
  };

  const handleEdit = (entry: any) => {
    setEditing(entry);
    setForm({ category: entry.category, question: entry.question || '', answer: entry.answer || '', keywords: (entry.keywords || []).join(', ') });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try { await api.deleteChatbotKnowledge(id); toast('Entry deleted', 'success'); load(); } catch { toast('Delete failed', 'error'); }
  };

  const filteredByCategory = KB_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = entries.filter(e => e.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return <CenterLoader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: gold, fontSize: '1.25rem', fontWeight: 700 }}>Knowledge Base ({entries.length})</h2>
        <button style={goldBtn} onClick={() => { resetForm(); setShowForm(true); }}><Plus size={15} /> Add Entry</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ color: gold, fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{editing ? 'Edit' : 'Add'} Knowledge Entry</h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <select style={selectStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {KB_CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#222' }}>{c}</option>)}
                </select>
                <input style={inputStyle} placeholder="Question" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required />
                <input style={inputStyle} placeholder="Answer" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} required />
                <input style={inputStyle} placeholder="Keywords (comma-separated)" value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} />
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                  <button type="submit" style={goldBtn}><Save size={14} /> {editing ? 'Update' : 'Add'}</button>
                  <button type="button" style={{ ...smallBtn, background: 'rgba(255,255,255,0.1)', color: '#aaa' }} onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {KB_CATEGORIES.map(cat => {
        const catEntries = filteredByCategory[cat];
        if (catEntries.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: gold, fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChevronDown size={16} /> {cat} ({catEntries.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {catEntries.map(entry => (
                <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ ...glassCard, padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{entry.question}</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{entry.answer}</p>
                      {entry.keywords?.length > 0 && <p style={{ color: 'rgba(212,175,55,0.7)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Keywords: {(entry.keywords || []).join(', ')}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button style={{ ...smallBtn, background: 'rgba(212,175,55,0.15)', color: gold }} onClick={() => handleEdit(entry)}><Pencil size={13} /></button>
                      <button style={{ ...smallBtn, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }} onClick={() => handleDelete(entry.id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
      {entries.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>No knowledge entries found</p>}
    </div>
  );
};

// ────────────────────────────── Section: Notifications Center ──────────────────────────────

const NotificationsCenter = ({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info' });

  const load = useCallback(async () => {
    try { setLoading(true); setNotifications(await api.getNotifications()); } catch { toast('Failed to load notifications', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ title: '', message: '', type: 'info' }); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.addNotification({ ...form, is_active: true }); toast('Notification added', 'success'); resetForm(); load(); } catch { toast('Add failed', 'error'); }
  };

  const toggleActive = async (n: any) => {
    try { await api.updateNotification(n.id, { is_active: !n.is_active }); toast('Notification toggled', 'success'); load(); } catch { toast('Toggle failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return;
    try { await api.deleteNotification(id); toast('Notification deleted', 'success'); load(); } catch { toast('Delete failed', 'error'); }
  };

  const typeColor = (t: string) => {
    if (t === 'emergency') return '#ef4444';
    if (t === 'warning') return '#eab308';
    return '#3b82f6';
  };

  if (loading) return <CenterLoader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: gold, fontSize: '1.25rem', fontWeight: 700 }}>Notifications ({notifications.length})</h2>
        <button style={goldBtn} onClick={() => setShowForm(true)}><Plus size={15} /> Add Notification</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ color: gold, fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Add Notification</h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <input style={inputStyle} placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                <input style={inputStyle} placeholder="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                <select style={selectStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {NOTIF_TYPES.map(t => <option key={t} value={t} style={{ background: '#222' }}>{t}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                  <button type="submit" style={goldBtn}><Save size={14} /> Add</button>
                  <button type="button" style={{ ...smallBtn, background: 'rgba(255,255,255,0.1)', color: '#aaa' }} onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifications.map(n => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...glassCard, borderLeft: `3px solid ${typeColor(n.type)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{n.title}</span>
                  <span style={{ ...statusBadge(n.type), fontSize: '0.7rem' }}>{n.type}</span>
                  {!n.is_active && <span style={{ ...statusBadge('closed'), fontSize: '0.7rem' }}>inactive</span>}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{n.message}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <button onClick={() => toggleActive(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: n.is_active ? '#22c55e' : '#666' }}>
                  {n.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                <button style={{ ...smallBtn, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }} onClick={() => handleDelete(n.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>No notifications found</p>}
      </div>
    </div>
  );
};

// ────────────────────────────── Section: Announcements ──────────────────────────────

const Announcements = ({ toast }: { toast: (msg: string, type: 'success' | 'error') => void }) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', description: '', event_date: '', is_active: true });

  const load = useCallback(async () => {
    try { setLoading(true); setAnnouncements(await api.getAnnouncements()); } catch { toast('Failed to load announcements', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ title: '', description: '', event_date: '', is_active: true }); setShowForm(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, event_date: form.event_date || null };
      if (editing) { await api.updateAnnouncement(editing.id, payload); toast('Announcement updated', 'success'); }
      else { await api.addAnnouncement(payload); toast('Announcement added', 'success'); }
      resetForm(); load();
    } catch { toast('Operation failed', 'error'); }
  };

  const handleEdit = (a: any) => {
    setEditing(a);
    setForm({ title: a.title, description: a.description || '', event_date: a.event_date || '', is_active: a.is_active });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try { await api.deleteAnnouncement(id); toast('Announcement deleted', 'success'); load(); } catch { toast('Delete failed', 'error'); }
  };

  if (loading) return <CenterLoader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: gold, fontSize: '1.25rem', fontWeight: 700 }}>Announcements ({announcements.length})</h2>
        <button style={goldBtn} onClick={() => { resetForm(); setShowForm(true); }}><Plus size={15} /> Add Announcement</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ ...glassCard, padding: '1.25rem' }}>
              <h3 style={{ color: gold, fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{editing ? 'Edit' : 'Add'} Announcement</h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <input style={inputStyle} placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                <input style={inputStyle} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <input style={inputStyle} type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} placeholder="Event Date" />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ccc', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                  <button type="submit" style={goldBtn}><Save size={14} /> {editing ? 'Update' : 'Add'}</button>
                  <button type="button" style={{ ...smallBtn, background: 'rgba(255,255,255,0.1)', color: '#aaa' }} onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {announcements.map(a => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={glassCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{a.title}</span>
                  <span style={statusBadge(a.is_active ? 'active' : 'closed')}>{a.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{a.description}</p>
                {a.event_date && <p style={{ color: 'rgba(212,175,55,0.7)', fontSize: '0.8rem' }}>Event: {new Date(a.event_date).toLocaleDateString()}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button style={{ ...smallBtn, background: 'rgba(212,175,55,0.15)', color: gold }} onClick={() => handleEdit(a)}><Pencil size={13} /> Edit</button>
                <button style={{ ...smallBtn, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }} onClick={() => handleDelete(a.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          </motion.div>
        ))}
        {announcements.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>No announcements found</p>}
      </div>
    </div>
  );
};

// ────────────────────────────── Utility ──────────────────────────────

const CenterLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
    <Loader2 size={32} color={gold} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
  </div>
);

// ────────────────────────────── Main Dashboard ──────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionKey>('rooms');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [managerName, setManagerName] = useState('Manager');
  const [toastData, setToastData] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auth check
  useEffect(() => {
    const stored = localStorage.getItem('wildwings_manager');
    if (!stored) {
      navigate('/manager-login');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setManagerName(parsed.displayName || parsed.username || 'Manager');
    } catch {
      navigate('/manager-login');
    }
  }, [navigate]);

  // Toast helper
  const toast = useCallback((message: string, type: 'success' | 'error') => {
    setToastData({ message, type });
    setTimeout(() => setToastData(null), 3000);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('wildwings_manager');
    navigate('/manager-login');
  };

  const currentSection = SECTIONS.find(s => s.key === activeSection);

  const renderSection = () => {
    switch (activeSection) {
      case 'rooms': return <RoomManagement toast={toast} />;
      case 'restaurant': return <RestaurantManagement toast={toast} />;
      case 'facilities': return <FacilitiesManagement toast={toast} />;
      case 'emergency': return <EmergencyManagement toast={toast} />;
      case 'reception': return <ReceptionServices toast={toast} />;
      case 'complaints': return <ComplaintsPanel toast={toast} />;
      case 'roomstatus': return <RoomStatusPanel toast={toast} />;
      case 'bookings': return <BookingRequests toast={toast} />;
      case 'chatbot': return <ChatbotKnowledge toast={toast} />;
      case 'notifications': return <NotificationsCenter toast={toast} />;
      case 'announcements': return <Announcements toast={toast} />;
      default: return null;
    }
  };

  // Sidebar nav item
  const navItem = (section: typeof SECTIONS[number]) => {
    const Icon = section.icon;
    const isActive = activeSection === section.key;
    return (
      <button
        key={section.key}
        onClick={() => { setActiveSection(section.key); setSidebarOpen(false); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%',
          padding: '0.7rem 1.25rem',
          border: 'none',
          background: isActive ? 'rgba(212,175,55,0.12)' : 'transparent',
          color: isActive ? gold : 'rgba(255,255,255,0.6)',
          fontWeight: isActive ? 600 : 400,
          fontSize: '0.85rem',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.2s',
          borderLeft: isActive ? `3px solid ${gold}` : '3px solid transparent',
          fontFamily: 'inherit',
        }}
      >
        <Icon size={18} />
        {section.label}
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, color: '#fff', fontFamily: 'inherit' }}>
      {/* Toast */}
      <AnimatePresence>
        {toastData && <Toast message={toastData.message} type={toastData.type} onClose={() => setToastData(null)} />}
      </AnimatePresence>

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 60,
          display: 'none',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          cursor: 'pointer',
        }}
        className="md-hide"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 39 }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '16rem',
          height: '100vh',
          background: '#0a0a0a',
          borderRight: '1px solid rgba(212,175,55,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          transition: 'transform 0.3s',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          <Crown size={32} color={gold} style={{ marginBottom: '0.5rem' }} />
          <h1 style={{ color: gold, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.03em' }}>WildWings</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Premium Hotel</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          {SECTIONS.map(navItem)}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.65rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(239,68,68,0.2)',
              background: 'rgba(239,68,68,0.08)',
              color: '#ef4444',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '16rem', minHeight: '100vh', padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ color: gold, fontSize: '1.5rem', fontWeight: 700 }}>{currentSection?.label || 'Dashboard'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.25rem' }}>WildWings Premium Hotel - Management Console</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${gold}, ${goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: bg, fontWeight: 700, fontSize: '0.9rem' }}>
              {managerName.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{managerName}</span>
          </div>
        </div>

        {/* Section content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Responsive CSS */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 768px) {
          .md-hide { display: flex !important; }
          aside.sidebar-closed {
            transform: translateX(-100%) !important;
          }
          aside.sidebar-open {
            transform: translateX(0) !important;
          }
          main {
            margin-left: 0 !important;
            padding: 1rem !important;
            padding-top: 3.5rem !important;
          }
        }
        @media (min-width: 769px) {
          .md-hide { display: none !important; }
          aside.sidebar-closed {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
}
