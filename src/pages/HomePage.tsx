import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Waves,
  Sparkles,
  Dumbbell,
  Wine,
  Car,
  Star,
  Instagram,
  Twitter,
  Facebook,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  UtensilsCrossed,
  GlassWater,
  Coffee,
  BedDouble,
  Crown,
  Gem,
} from 'lucide-react';
import BookingModal from '../components/BookingModal';

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

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7 }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl md:text-5xl font-bold tracking-wide" style={{ color: gold }}>
        {title}
      </h2>
      <div className="mx-auto mt-4 h-px w-32" style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
      {subtitle && (
        <p className="mt-4 text-lg text-white/60">{subtitle}</p>
      )}
    </motion.div>
  );
}

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${gold}22` }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────── Hero ────────────────────────────── */

const heroVideos = [
  'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/1093662/1093662-uhd_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/3015510/3015510-uhd_2560_1440_24fps.mp4',
  'https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/1093968/1093968-uhd_2560_1440_30fps.mp4',
  'https://videos.pexels.com/video-files/3015530/3015530-uhd_2560_1440_24fps.mp4',
];

function HeroSection() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoLoaded(false);
      setCurrentVideo((prev) => (prev + 1) % heroVideos.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Force play whenever currentVideo changes
  useEffect(() => {
    const vid = videoRefs.current[currentVideo];
    if (vid) {
      vid.currentTime = 0;
      vid.play().catch(() => {});
    }
  }, [currentVideo]);

  return (
    <section className="relative flex items-center justify-center min-h-screen overflow-hidden" style={{ background: bg }}>
      {/* Video Background */}
      <div className="absolute inset-0">
        {heroVideos.map((src, i) => (
          <video
            key={src}
            ref={(el) => { videoRefs.current[i] = el; }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => i === currentVideo && setVideoLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1500"
            style={{
              filter: 'brightness(0.35) saturate(0.8)',
              opacity: i === currentVideo ? 1 : 0,
            }}
          >
            <source src={src} type="video/mp4" />
          </video>
        ))}
      </div>

      {/* Dark overlay with gold tint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,5,5,0.6) 0%, rgba(5,5,5,0.3) 40%, rgba(5,5,5,0.5) 70%, rgba(5,5,5,0.95) 100%), radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm md:text-base tracking-[0.3em] uppercase mb-6"
          style={{ color: gold }}
        >
          Welcome to
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
          style={{ color: gold }}
        >
          WildWings
          <br />
          Premium Hotel
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-6 text-xl md:text-2xl text-white/70 tracking-widest"
        >
          Luxury Beyond Imagination
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-10"
        >
          <a href="#rooms">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 0 25px ${gold}44` }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 text-lg font-semibold rounded-full tracking-wider transition-colors duration-300"
              style={{
                background: `linear-gradient(135deg, ${gold}, #b8941e)`,
                color: bg,
              }}
            >
              Book Your Stay
            </motion.button>
          </a>
        </motion.div>
      </div>

      {/* Video indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroVideos.map((_, i) => (
          <button
            key={i}
            onClick={() => { setVideoLoaded(false); setCurrentVideo(i); }}
            className="w-2 h-2 rounded-full transition-all duration-500 cursor-pointer"
            style={{
              background: i === currentVideo ? gold : 'rgba(255,255,255,0.3)',
              transform: i === currentVideo ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#rooms" className="flex flex-col items-center gap-2 text-white/40 hover:text-white/70 transition-colors">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown size={20} />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
}

/* ────────────────────────────── Rooms ────────────────────────────── */

const rooms = [
  {
    name: 'Deluxe',
    price: 299,
    icon: BedDouble,
    features: ['King Bed', 'City View', '65 sqm', 'Free Minibar'],
    image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Royal Suite',
    price: 599,
    icon: Crown,
    features: ['King Bed', 'Ocean View', '120 sqm', 'Private Lounge', 'Butler Service'],
    image: 'https://images.pexels.com/photos/210265/pexels-photo-210265.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Presidential Suite',
    price: 999,
    icon: Gem,
    features: ['Super King Bed', 'Panoramic View', '250 sqm', 'Private Pool', 'Personal Chef', 'Helipad Access'],
    image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

function RoomsSection() {
  const [bookingRoom, setBookingRoom] = useState<string | null>(null);

  return (
    <section id="rooms" className="py-24 px-6" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto">
        <SectionTitle title="Our Rooms" subtitle="Experience unparalleled comfort and elegance" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {rooms.map((room, i) => {
            const Icon = room.icon;
            return (
              <motion.div key={room.name} variants={fadeUp} custom={i}>
                <GlassCard className="group">
                  {/* Premium Photo */}
                  <div className="h-64 w-full relative overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(5,5,5,0.9) 100%)' }} />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold tracking-wider" style={{ background: `${gold}cc`, color: bg }}>
                      PREMIUM
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-white">{room.name}</h3>
                    <p className="mt-2 text-3xl font-bold" style={{ color: gold }}>
                      ${room.price}
                      <span className="text-sm font-normal text-white/50">/night</span>
                    </p>

                    <ul className="mt-5 space-y-2">
                      {room.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                          <span className="w-1 h-1 rounded-full" style={{ background: gold }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setBookingRoom(room.name)}
                      className="mt-6 w-full py-3 rounded-xl text-sm font-semibold tracking-wider border transition-all duration-300 hover:shadow-lg cursor-pointer"
                      style={{ borderColor: gold, color: gold, boxShadow: 'none' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = gold;
                        (e.currentTarget as HTMLButtonElement).style.color = bg;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color = gold;
                      }}
                    >
                      Reserve Now
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>

        <BookingModal
          isOpen={bookingRoom !== null}
          onClose={() => setBookingRoom(null)}
          roomType={bookingRoom || ''}
        />
      </div>
    </section>
  );
}

/* ────────────────────────────── Dining ────────────────────────────── */

const dining = [
  {
    name: 'The Golden Fork',
    type: 'Fine Dining',
    icon: UtensilsCrossed,
    description:
      'An exquisite culinary journey featuring Michelin-starred chefs crafting seasonal tasting menus with the finest global ingredients.',
    image: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Sky Lounge',
    type: 'Rooftop Bar',
    icon: GlassWater,
    description:
      'Sip handcrafted cocktails 50 stories above the city. Live jazz, panoramic sunsets, and an award-winning wine list of 500+ labels.',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'The Emerald',
    type: 'All-Day Dining',
    icon: Coffee,
    description:
      'From artisan breakfasts to midnight cravings, The Emerald serves globally inspired comfort food around the clock in a lush conservatory setting.',
    image: 'https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

function DiningSection() {
  return (
    <section className="py-24 px-6" style={{ background: `linear-gradient(180deg, ${bg}, #0a0a0a, ${bg})` }}>
      <div className="max-w-7xl mx-auto">
        <SectionTitle title="Dining" subtitle="Savor extraordinary flavors in extraordinary settings" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {dining.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.div key={d.name} variants={fadeUp} custom={i}>
                <GlassCard className="group">
                  <div className="h-56 w-full relative overflow-hidden">
                    <img
                      src={d.image}
                      alt={d.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(5,5,5,0.9) 100%)' }} />
                    <div className="absolute bottom-4 left-4">
                      <span className="text-xs tracking-widest uppercase px-3 py-1 rounded-full" style={{ color: gold, background: `${gold}20`, border: `1px solid ${gold}44` }}>
                        {d.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-white">{d.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{d.description}</p>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot', { detail: { workflow: 'restaurant' } }))}
                      className="mt-5 text-sm font-semibold tracking-wider transition-colors duration-300 cursor-pointer"
                      style={{ color: gold }}
                    >
                      View Menu &rarr;
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────── Facilities ────────────────────────────── */

const facilities = [
  {
    name: 'Infinity Pool',
    icon: Waves,
    description: 'A 50-meter heated infinity pool overlooking the ocean, with private cabanas and poolside service.',
    image: 'https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Spa & Wellness',
    icon: Sparkles,
    description: 'Rejuvenate with bespoke treatments, hydrotherapy circuits, and traditional healing rituals from around the world.',
    image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Fitness Center',
    icon: Dumbbell,
    description: 'State-of-the-art equipment, personal trainers, and yoga studios open 24 hours for your wellness routine.',
    image: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Rooftop Lounge',
    icon: Wine,
    description: 'An exclusive members-style lounge with craft cocktails, live music, and breathtaking skyline views.',
    image: 'https://images.pexels.com/photos/2741920/pexels-photo-2741920.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Valet Parking',
    icon: Car,
    description: 'Complimentary valet service with secure underground parking, EV charging stations, and luxury car wash.',
    image: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

function FacilitiesSection() {
  return (
    <section className="py-24 px-6" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto">
        <SectionTitle title="Facilities" subtitle="World-class amenities at your fingertips" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {facilities.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.name} variants={fadeUp} custom={i}>
                <GlassCard className="group h-full flex flex-col">
                  <div className="h-48 w-full relative overflow-hidden">
                    <img
                      src={f.image}
                      alt={f.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(5,5,5,0.9) 100%)' }} />
                    <div className="absolute top-4 left-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `${gold}25`, border: `1px solid ${gold}44`, backdropFilter: 'blur(8px)' }}
                      >
                        <Icon size={22} style={{ color: gold }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold text-white">{f.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60 flex-1">{f.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────── Testimonials ────────────────────────────── */

const testimonials = [
  {
    name: 'Victoria Ashford',
    title: 'Travel Connoisseur',
    text: 'WildWings redefines luxury. The Presidential Suite was beyond anything I have ever experienced -- the private pool at sunrise was simply unforgettable.',
    rating: 5,
    image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    name: 'James Whitmore',
    title: 'CEO, Whitmore Holdings',
    text: 'Impeccable service from check-in to check-out. The Sky Lounge became my office away from home. I will not stay anywhere else.',
    rating: 5,
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    name: 'Sofia Reyes',
    title: 'Interior Designer',
    text: 'Every detail is curated to perfection -- from the gold-leaf accents to the hand-stitched linens. This is where art meets hospitality.',
    rating: 5,
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
];

function TestimonialsSection() {
  return (
    <section className="py-24 px-6" style={{ background: `linear-gradient(180deg, ${bg}, #0a0a0a, ${bg})` }}>
      <div className="max-w-7xl mx-auto">
        <SectionTitle title="Guest Voices" subtitle="What our distinguished guests have to say" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((t, i) => (
            <motion.div key={t.name} variants={fadeUp} custom={i}>
              <GlassCard className="p-8 h-full flex flex-col">
                {/* Gold quote mark */}
                <span className="text-6xl leading-none font-serif select-none" style={{ color: gold }}>
                  &ldquo;
                </span>

                <p className="mt-4 text-sm leading-relaxed text-white/70 flex-1">{t.text}</p>

                {/* Stars */}
                <div className="flex gap-1 mt-6">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} fill={gold} stroke={gold} />
                  ))}
                </div>

                {/* Guest info with photo */}
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                    style={{ border: `2px solid ${gold}44` }}
                  />
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-white/50 mt-0.5">{t.title}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────── Contact ────────────────────────────── */

function ContactSection() {
  return (
    <section className="py-24 px-6" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto">
        <SectionTitle title="Contact Us" subtitle="We are here to make your stay extraordinary" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            {/* Phone */}
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${gold}15`, border: `1px solid ${gold}33` }}
              >
                <Phone size={20} style={{ color: gold }} />
              </div>
              <div>
                <p className="text-sm text-white/50">Phone</p>
                <p className="text-white mt-1">+1 (555) 123-4567</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${gold}15`, border: `1px solid ${gold}33` }}
              >
                <Mail size={20} style={{ color: gold }} />
              </div>
              <div>
                <p className="text-sm text-white/50">Email</p>
                <p className="text-white mt-1">stay@wildwings.com</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${gold}15`, border: `1px solid ${gold}33` }}
              >
                <MapPin size={20} style={{ color: gold }} />
              </div>
              <div>
                <p className="text-sm text-white/50">Address</p>
                <p className="text-white mt-1">1 Luxury Avenue, Paradise City</p>
              </div>
            </div>

            {/* Social */}
            <div className="pt-4">
              <p className="text-sm text-white/50 mb-4">Follow Us</p>
              <div className="flex gap-4">
                {[
                  { Icon: Instagram, label: 'Instagram' },
                  { Icon: Twitter, label: 'Twitter' },
                  { Icon: Facebook, label: 'Facebook' },
                ].map(({ Icon, label }) => (
                  <motion.a
                    key={label}
                    href="#"
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
            </div>
          </motion.div>

          {/* Map placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="w-full h-80 md:h-full rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden"
              style={{ minHeight: '320px' }}
            >
              <img
                src="https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Hotel exterior"
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.4) saturate(0.7)' }}
              />
              <div className="absolute flex flex-col items-center" style={{ color: gold }}>
                <MapPin size={40} className="opacity-70" />
                <p className="mt-3 text-sm tracking-wider">1 Luxury Avenue</p>
                <p className="text-xs opacity-60 mt-1">Paradise City</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────── Footer ────────────────────────────── */

function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-white/5" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-white/30">
          &copy; {new Date().getFullYear()} WildWings Premium Hotel. All rights reserved.
        </p>
        <p className="text-sm" style={{ color: gold }}>
          Luxury Beyond Imagination
        </p>
      </div>
    </footer>
  );
}

/* ────────────────────────────── Page ────────────────────────────── */

export default function HomePage() {
  return (
    <div style={{ background: bg }}>
      <HeroSection />
      <RoomsSection />
      <DiningSection />
      <FacilitiesSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
