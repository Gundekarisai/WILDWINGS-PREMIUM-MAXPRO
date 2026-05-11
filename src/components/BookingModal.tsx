import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Mail, Phone, BedDouble, Users } from 'lucide-react';
import { api } from '../lib/api';

const gold = '#C9A84C';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomType: string;
}

export default function BookingModal({ isOpen, onClose, roomType }: BookingModalProps) {
  const [form, setForm] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: '1',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(handleClose, 3000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBooking({
        guest_name: form.guestName,
        email: form.email,
        phone: form.phone,
        room_type: roomType,
        check_in: form.checkIn,
        check_out: form.checkOut,
        num_guests: parseInt(form.guests, 10),
        status: 'pending',
        source: 'website',
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Booking save failed:', err);
    }
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ guestName: '', email: '', phone: '', checkIn: '', checkOut: '', guests: '1' });
    onClose();
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-[#2a2a1a] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A84C]/50 transition-colors';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="booking-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleClose}
        >
          <motion.div
            key="booking-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              border: `1px solid ${gold}`,
              borderRadius: '16px',
              padding: '2rem',
              width: 'min(580px, 92vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              zIndex: 100000,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between mb-6"
            >
              <h3 className="text-lg font-semibold" style={{ color: gold, fontFamily: "'Playfair Display', serif" }}>
                Book Your Stay
              </h3>
              <button
                onClick={handleClose}
                className="p-1 rounded-md hover:bg-white/10 transition-colors"
                style={{ color: gold }}
              >
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${gold}20`, border: `1px solid ${gold}44` }}
                >
                  <Calendar size={28} style={{ color: gold }} />
                </div>
                <p className="text-white text-base font-medium mb-2">Booking Request Received</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Your booking for <span style={{ color: gold }} className="font-semibold">{roomType}</span> has been received! We will confirm via email within 2 hours.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-8 py-2.5 rounded-lg text-sm font-semibold tracking-wider transition-colors"
                  style={{ background: `linear-gradient(135deg, ${gold}, #b8941e)`, color: '#0a0a0a' }}
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Room Type (pre-filled, read-only) */}
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 tracking-wider uppercase">Room Type</label>
                  <div
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{ background: `${gold}10`, border: `1px solid ${gold}33`, color: gold }}
                  >
                    <BedDouble size={16} />
                    {roomType}
                  </div>
                </div>

                {/* Guest Name */}
                <div>
                  <label htmlFor="booking-guest-name" className="block text-xs text-white/50 mb-1.5 tracking-wider uppercase">Guest Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      id="booking-guest-name"
                      name="guestName"
                      type="text"
                      required
                      value={form.guestName}
                      onChange={handleChange}
                      placeholder="Full name"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="booking-email" className="block text-xs text-white/50 mb-1.5 tracking-wider uppercase">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      id="booking-email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="booking-phone" className="block text-xs text-white/50 mb-1.5 tracking-wider uppercase">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      id="booking-phone"
                      name="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* Check-in / Check-out */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="booking-checkin" className="block text-xs text-white/50 mb-1.5 tracking-wider uppercase">Check-in</label>
                    <input
                      id="booking-checkin"
                      name="checkIn"
                      type="date"
                      required
                      value={form.checkIn}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="booking-checkout" className="block text-xs text-white/50 mb-1.5 tracking-wider uppercase">Check-out</label>
                    <input
                      id="booking-checkout"
                      name="checkOut"
                      type="date"
                      required
                      value={form.checkOut}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Number of Guests */}
                <div>
                  <label htmlFor="booking-guests" className="block text-xs text-white/50 mb-1.5 tracking-wider uppercase">Number of Guests</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <select
                      id="booking-guests"
                      name="guests"
                      value={form.guests}
                      onChange={handleChange}
                      className={`${inputClass} pl-10`}
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n} style={{ background: '#1a1a1a' }}>
                          {n} {n === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider transition-colors mt-2"
                  style={{ background: `linear-gradient(135deg, ${gold}, #b8941e)`, color: '#0a0a0a' }}
                >
                  Confirm Booking
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
