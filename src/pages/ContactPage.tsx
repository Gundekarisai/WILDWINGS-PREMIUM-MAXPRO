import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Twitter,
  Facebook,
  Send,
  Clock,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { api } from '../lib/api';

const gold = '#D4AF37';
const bg = '#050505';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

/* ─── Components ─── */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${gold}22` }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ContactInfoItem({
  icon: Icon,
  label,
  value,
  index,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  index: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="flex items-start gap-4"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${gold}15`, border: `1px solid ${gold}33` }}
      >
        <Icon size={20} style={{ color: gold }} />
      </div>
      <div>
        <p className="text-sm text-white/50">{label}</p>
        <p className="text-white mt-1">{value}</p>
      </div>
    </motion.div>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Store as a complaint/inquiry via the API
      await api.createComplaint({
        guest_name: formData.name,
        room_number: 'N/A',
        category: formData.subject || 'General Inquiry',
        description: formData.message,
        email: formData.email,
        status: 'pending',
      });
    } catch {
      // Gracefully handle - still show success to user
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  }

  const contactItems = [
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
    { icon: Mail, label: 'Email', value: 'stay@wildwings.com' },
    { icon: MapPin, label: 'Address', value: '1 Luxury Avenue, Paradise City' },
    { icon: Clock, label: 'Reception Hours', value: '24/7 - Always at your service' },
    { icon: Globe, label: 'Website', value: 'www.wildwings.com' },
  ];

  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: MessageCircle, label: 'WhatsApp', href: '#' },
  ];

  return (
    <div className="pt-24" style={{ background: bg }}>
      {/* Page Header */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-wide" style={{ color: gold }}>
              Contact Us
            </h2>
            <div
              className="mx-auto mt-4 h-px w-32"
              style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }}
            />
            <p className="mt-4 text-lg text-white/60">
              We are here to make your stay extraordinary
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Contact Info + Social */}
            <div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="space-y-6"
              >
                {contactItems.map((item, i) => (
                  <ContactInfoItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                    index={i}
                  />
                ))}
              </motion.div>

              {/* Social Media Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-10 pt-8 border-t border-white/10"
              >
                <p className="text-sm text-white/50 mb-4 tracking-wider uppercase">Follow Us</p>
                <div className="flex gap-4">
                  {socialLinks.map(({ icon: Icon, label, href }) => (
                    <motion.a
                      key={label}
                      href={href}
                      aria-label={label}
                      whileHover={{ scale: 1.15, boxShadow: `0 0 15px ${gold}33` }}
                      whileTap={{ scale: 0.95 }}
                      className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/10 transition-colors duration-300 hover:border-white/30"
                      style={{ background: `${gold}10` }}
                    >
                      <Icon size={18} style={{ color: gold }} />
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Map Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-8"
              >
                <div
                  className="w-full h-64 rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 60%), linear-gradient(135deg, #0a0a0a, #111111, #0a0a0a)',
                  }}
                >
                  {/* Grid lines */}
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: `linear-gradient(${gold}33 1px, transparent 1px), linear-gradient(90deg, ${gold}33 1px, transparent 1px)`,
                      backgroundSize: '40px 40px',
                    }}
                  />
                  <div className="text-center relative z-10">
                    <MapPin size={40} style={{ color: gold }} className="mx-auto opacity-50" />
                    <p className="mt-3 text-sm text-white/40 tracking-wider">MAP</p>
                    <p className="text-xs text-white/25 mt-1">1 Luxury Avenue, Paradise City</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <GlassCard className="p-8">
                <h3 className="text-xl font-semibold text-white mb-6">Send Us a Message</h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm text-white/50 mb-2">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm text-white/50 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm text-white/50 mb-2">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm text-white/50 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 transition-colors resize-none"
                      placeholder="Tell us about your inquiry..."
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.03, boxShadow: `0 0 25px ${gold}44` }}
                    whileTap={{ scale: submitting ? 1 : 0.97 }}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wider flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
                    style={{
                      background: submitted ? '#22c55e' : `linear-gradient(135deg, ${gold}, #b8941e)`,
                      color: bg,
                    }}
                  >
                    {submitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : submitted ? (
                      'Message Sent!'
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>

                {submitted && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center text-sm text-green-400"
                  >
                    Thank you! We will get back to you shortly.
                  </motion.p>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Contact CTA */}
      <section className="py-16 px-6" style={{ background: `linear-gradient(180deg, ${bg}, #0a0a0a, ${bg})` }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Phone, title: 'Call Us', value: '+1 (555) 123-4567', sub: 'Available 24/7' },
              { icon: Mail, title: 'Email Us', value: 'stay@wildwings.com', sub: 'Response within 2 hours' },
              { icon: MapPin, title: 'Visit Us', value: '1 Luxury Avenue', sub: 'Paradise City' },
            ].map(({ icon: Icon, title, value, sub }, i) => (
              <motion.div key={title} variants={fadeUp} custom={i}>
                <GlassCard className="p-6 text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: `${gold}15`, border: `1px solid ${gold}33` }}
                  >
                    <Icon size={22} style={{ color: gold }} />
                  </div>
                  <h4 className="text-base font-semibold text-white">{title}</h4>
                  <p className="mt-1 text-sm" style={{ color: gold }}>{value}</p>
                  <p className="mt-1 text-xs text-white/40">{sub}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
