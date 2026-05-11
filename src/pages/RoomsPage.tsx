import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Crown, Gem, Star, Wifi, Coffee, Bath, Eye, ConciergeBell, ChefHat, Plane } from 'lucide-react';
import { api } from '../lib/api';
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

/* ─── Static Fallback Data ─── */

interface RoomCategory {
  name: string;
  price: number;
  icon: React.ElementType;
  features: string[];
  image: string;
  description: string;
}

const fallbackCategories: RoomCategory[] = [
  {
    name: 'Deluxe',
    price: 299,
    icon: BedDouble,
    features: ['King Bed', 'City View', '65 sqm', 'Free Minibar', 'High-Speed WiFi'],
    image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Elegant comfort with modern amenities and breathtaking city views. Perfect for the discerning traveler.',
  },
  {
    name: 'Royal',
    price: 599,
    icon: Crown,
    features: ['King Bed', 'Ocean View', '120 sqm', 'Private Lounge', 'Butler Service', 'Premium WiFi'],
    image: 'https://images.pexels.com/photos/210265/pexels-photo-210265.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Sophisticated luxury with panoramic ocean views and dedicated butler service for an unforgettable stay.',
  },
  {
    name: 'Presidential',
    price: 999,
    icon: Gem,
    features: ['Super King Bed', 'Panoramic View', '250 sqm', 'Private Pool', 'Personal Chef', 'Helipad Access'],
    image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'The pinnacle of luxury living. A private sanctuary with exclusive amenities and unparalleled service.',
  },
];

const featureIconMap: Record<string, React.ElementType> = {
  king: BedDouble,
  bed: BedDouble,
  wifi: Wifi,
  minibar: Coffee,
  bath: Bath,
  view: Eye,
  butler: ConciergeBell,
  chef: ChefHat,
  helipad: Plane,
  pool: Bath,
  lounge: Star,
};

function getFeatureIcon(feature: string): React.ElementType | null {
  const lower = feature.toLowerCase();
  for (const [key, Icon] of Object.entries(featureIconMap)) {
    if (lower.includes(key)) return Icon;
  }
  return null;
}

/* ─── Components ─── */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
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

function RoomCard({ room, index, onBook }: { room: RoomCategory; index: number; onBook: (roomName: string) => void }) {
  const Icon = room.icon;
  return (
    <motion.div variants={fadeUp} custom={index}>
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
          <div className="absolute bottom-4 left-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${gold}25`, border: `1px solid ${gold}44`, backdropFilter: 'blur(8px)' }}>
              <Icon size={22} style={{ color: gold }} />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-2xl font-semibold text-white">{room.name}</h3>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">{room.description}</p>
          <p className="mt-3 text-3xl font-bold" style={{ color: gold }}>
            ${room.price}
            <span className="text-sm font-normal text-white/50">/night</span>
          </p>

          <ul className="mt-5 space-y-2">
            {room.features.map((f) => {
              const FeatureIcon = getFeatureIcon(f);
              return (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  {FeatureIcon ? (
                    <FeatureIcon size={14} style={{ color: gold }} />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: gold }} />
                  )}
                  {f}
                </li>
              );
            })}
          </ul>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onBook(room.name)}
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
            Book Now
          </motion.button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-64 w-full" style={{ background: 'linear-gradient(135deg, #111 0%, #1a1a1a 50%, #111 100%)' }} />
          <div className="p-6 space-y-4">
            <div className="h-6 w-32 rounded bg-white/10" />
            <div className="h-4 w-48 rounded bg-white/10" />
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="space-y-2 mt-4">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="h-3 w-40 rounded bg-white/10" />
              ))}
            </div>
            <div className="h-10 w-full rounded-xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingRoom, setBookingRoom] = useState<string | null>(null);

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await api.getRooms();
        setRooms(data || []);
      } catch {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, []);

  // Group rooms by category
  const groupedRooms = rooms.reduce<Record<string, any[]>>((acc, room) => {
    const category = room.category || 'Deluxe';
    if (!acc[category]) acc[category] = [];
    acc[category].push(room);
    return acc;
  }, {});

  const categoryOrder = ['Deluxe', 'Royal', 'Presidential'];
  const categoryMap: Record<string, RoomCategory> = {};
  fallbackCategories.forEach((c) => { categoryMap[c.name] = c; });

  // Build display categories: use DB data if available, else fallback
  const displayCategories: RoomCategory[] = categoryOrder
    .filter((name) => Object.keys(groupedRooms).length === 0 || groupedRooms[name])
    .map((name) => {
      const fallback = categoryMap[name] || fallbackCategories[0];
      if (groupedRooms[name]?.length > 0) {
        const dbRoom = groupedRooms[name][0];
        const price = dbRoom.price_per_night || dbRoom.price || fallback.price;
        return {
          ...fallback,
          name,
          price: typeof price === 'number' ? price : parseInt(price, 10) || fallback.price,
        };
      }
      return fallback;
    });

  // If DB has categories not in our order, add them too
  Object.keys(groupedRooms).forEach((cat) => {
    if (!categoryOrder.includes(cat)) {
      const fallback: RoomCategory = {
        name: cat,
        price: groupedRooms[cat][0]?.price_per_night || groupedRooms[cat][0]?.price || 299,
        icon: BedDouble,
        features: ['Premium Amenities', 'King Bed', 'Free WiFi'],
        image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: `Experience the luxury of our ${cat} rooms.`,
      };
      displayCategories.push(fallback);
    }
  });

  // If no categories at all, use fallback
  const categoriesToShow = displayCategories.length > 0 ? displayCategories : fallbackCategories;

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
              Our Rooms
            </h2>
            <div
              className="mx-auto mt-4 h-px w-32"
              style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }}
            />
            <p className="mt-4 text-lg text-white/60">
              Experience unparalleled comfort and elegance in every detail
            </p>
          </motion.div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {categoriesToShow.map((room, i) => (
                <RoomCard key={room.name} room={room} index={i} onBook={setBookingRoom} />
              ))}
            </motion.div>
          )}

          {/* Room count from DB */}
          {!loading && rooms.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center mt-8 text-sm text-white/40"
            >
              {rooms.length} room{rooms.length !== 1 ? 's' : ''} available across {Object.keys(groupedRooms).length} categor{Object.keys(groupedRooms).length !== 1 ? 'ies' : 'y'}
            </motion.p>
          )}
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-16 px-6" style={{ background: `linear-gradient(180deg, ${bg}, #0a0a0a, ${bg})` }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              All Rooms Include
            </h3>
            <div
              className="mx-auto mt-3 h-px w-24"
              style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }}
            />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: Wifi, label: 'High-Speed WiFi' },
              { icon: Coffee, label: '24/7 Room Service' },
              { icon: Bath, label: 'Premium Toiletries' },
              { icon: Star, label: 'Turn-Down Service' },
            ].map(({ icon: Icon, label }, i) => (
              <motion.div key={label} variants={fadeUp} custom={i}>
                <GlassCard className="p-6 flex flex-col items-center text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${gold}15`, border: `1px solid ${gold}33` }}
                  >
                    <Icon size={22} style={{ color: gold }} />
                  </div>
                  <p className="text-sm text-white/70">{label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <BookingModal
        isOpen={bookingRoom !== null}
        onClose={() => setBookingRoom(null)}
        roomType={bookingRoom || ''}
      />
    </div>
  );
}
