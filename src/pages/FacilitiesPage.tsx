import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Waves,
  Sparkles,
  Dumbbell,
  Wine,
  Car,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  CircleDot,
  TreePine,
  Palette,
  Building,
  Shield,
  Heart,
  Briefcase,
  Gamepad2,
} from 'lucide-react';
import { api } from '../lib/api';

const gold = '#D4AF37';
const bg = '#050505';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── Facility Type Icon Map ─── */

const facilityIconMap: Record<string, React.ElementType> = {
  pool: Waves,
  spa: Sparkles,
  wellness: Sparkles,
  fitness: Dumbbell,
  gym: Dumbbell,
  lounge: Wine,
  bar: Wine,
  parking: Car,
  valet: Car,
  garden: TreePine,
  art: Palette,
  gallery: Palette,
  business: Briefcase,
  conference: Briefcase,
  security: Shield,
  kids: Gamepad2,
  play: Gamepad2,
  medical: Heart,
  clinic: Heart,
  building: Building,
};

function getFacilityIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(facilityIconMap)) {
    if (lower.includes(key)) return Icon;
  }
  return Building;
}

/* ─── Facility Image Map ─── */

const facilityImageMap: Record<string, string> = {
  pool: 'https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg?auto=compress&cs=tinysrgb&w=800',
  spa: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
  wellness: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
  fitness: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800',
  gym: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800',
  lounge: 'https://images.pexels.com/photos/2741920/pexels-photo-2741920.jpeg?auto=compress&cs=tinysrgb&w=800',
  bar: 'https://images.pexels.com/photos/2741920/pexels-photo-2741920.jpeg?auto=compress&cs=tinysrgb&w=800',
  parking: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
  valet: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
  garden: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
};

function getFacilityImage(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, img] of Object.entries(facilityImageMap)) {
    if (lower.includes(key)) return img;
  }
  return 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800';
}

/* ─── Status Config ─── */

const statusConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  open: { color: '#22c55e', label: 'Open', icon: CircleDot },
  closed: { color: '#ef4444', label: 'Closed', icon: CircleDot },
  maintenance: { color: '#f59e0b', label: 'Maintenance', icon: Wrench },
};

function getStatusConfig(status: string) {
  const lower = (status || 'open').toLowerCase();
  return statusConfig[lower] || statusConfig[lower.includes('maint') ? 'maintenance' : lower.includes('clos') ? 'closed' : 'open'];
}

/* ─── Static Fallback Facilities ─── */

interface Facility {
  name: string;
  icon: React.ElementType;
  description: string;
  timings: string;
  status: string;
  rules: string[];
  location: string;
  image: string;
}

const fallbackFacilities: Facility[] = [
  {
    name: 'Infinity Pool',
    icon: Waves,
    description: 'A 50-meter heated infinity pool overlooking the ocean, with private cabanas and poolside service.',
    timings: '7:00 AM - 10:00 PM',
    status: 'open',
    rules: ['Proper swimwear required', 'No glass containers', 'Children under 12 must be supervised', 'Shower before entering'],
    location: 'Level 3, East Wing',
    image: 'https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Spa & Wellness',
    icon: Sparkles,
    description: 'Rejuvenate with bespoke treatments, hydrotherapy circuits, and traditional healing rituals from around the world.',
    timings: '9:00 AM - 9:00 PM',
    status: 'open',
    rules: ['Advance booking recommended', 'Arrive 15 min early', 'Silence in relaxation areas', '18+ for certain treatments'],
    location: 'Level 2, West Wing',
    image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Fitness Center',
    icon: Dumbbell,
    description: 'State-of-the-art equipment, personal trainers, and yoga studios open 24 hours for your wellness routine.',
    timings: '24 Hours',
    status: 'open',
    rules: ['Towels provided', 'Wipe equipment after use', 'No outdoor shoes', 'Book personal trainer in advance'],
    location: 'Level 1, North Wing',
    image: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Rooftop Lounge',
    icon: Wine,
    description: 'An exclusive members-style lounge with craft cocktails, live music, and breathtaking skyline views.',
    timings: '4:00 PM - 1:00 AM',
    status: 'open',
    rules: ['Smart casual dress code', '21+ only', 'Reservations preferred', 'No outside food or beverages'],
    location: 'Level 50, Rooftop',
    image: 'https://images.pexels.com/photos/2741920/pexels-photo-2741920.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Valet Parking',
    icon: Car,
    description: 'Complimentary valet service with secure underground parking, EV charging stations, and luxury car wash.',
    timings: '24 Hours',
    status: 'open',
    rules: ['Complimentary for hotel guests', 'EV charging available', 'Car wash available on request', 'Collect vehicle 30 min before departure'],
    location: 'Ground Level, Main Entrance',
    image: 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Private Garden',
    icon: TreePine,
    description: 'A serene botanical garden with sculpted pathways, koi ponds, and meditation alcoves surrounded by rare flora.',
    timings: '6:00 AM - 8:00 PM',
    status: 'open',
    rules: ['No pets allowed', 'Stay on designated paths', 'No picking flowers', 'Quiet zone'],
    location: 'Ground Level, South Wing',
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

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

function FacilityCard({ facility, index }: { facility: Facility; index: number }) {
  const Icon = facility.icon;
  const statusCfg = getStatusConfig(facility.status);
  const StatusIcon = statusCfg.icon;

  return (
    <motion.div variants={fadeUp} custom={index}>
      <GlassCard className="group h-full flex flex-col">
        {/* Premium Photo */}
        <div className="h-48 w-full relative overflow-hidden">
          <img
            src={facility.image}
            alt={facility.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(5,5,5,0.9) 100%)' }} />

          {/* Icon overlay */}
          <div className="absolute top-4 left-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${gold}25`, border: `1px solid ${gold}44`, backdropFilter: 'blur(8px)' }}
            >
              <Icon size={22} style={{ color: gold }} />
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider"
              style={{
                background: `${statusCfg.color}20`,
                color: statusCfg.color,
                border: `1px solid ${statusCfg.color}44`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <StatusIcon size={12} />
              {statusCfg.label}
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-semibold text-white">{facility.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/60 flex-1">{facility.description}</p>

          {/* Timings */}
          <div className="mt-4 flex items-center gap-2">
            <Clock size={14} style={{ color: gold }} />
            <span className="text-sm text-white/70">{facility.timings}</span>
          </div>

          {/* Location */}
          <div className="mt-2 flex items-center gap-2">
            <MapPin size={14} style={{ color: gold }} />
            <span className="text-sm text-white/70">{facility.location}</span>
          </div>

          {/* Rules */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} style={{ color: gold }} />
              <span className="text-xs tracking-wider uppercase" style={{ color: gold }}>Rules</span>
            </div>
            <ul className="space-y-1">
              {facility.rules.map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-xs text-white/50">
                  <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: gold }} />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-48 w-full" style={{ background: 'linear-gradient(135deg, #111 0%, #1a1a1a 50%, #111 100%)' }} />
          <div className="p-6 space-y-3">
            <div className="h-5 w-32 rounded bg-white/10" />
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-3 w-32 rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FacilitiesPage() {
  const [facilitiesFromDB, setFacilitiesFromDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacilities() {
      try {
        const data = await api.getFacilities();
        setFacilitiesFromDB(data || []);
      } catch {
        setFacilitiesFromDB([]);
      } finally {
        setLoading(false);
      }
    }
    loadFacilities();
  }, []);

  // Convert DB facilities to display format
  const dbFacilities: Facility[] = facilitiesFromDB.map((f) => ({
    name: f.name || 'Facility',
    icon: getFacilityIcon(f.name || ''),
    description: f.description || 'Premium hotel facility.',
    timings: f.timings || f.operating_hours || f.hours || '9:00 AM - 9:00 PM',
    status: f.is_open !== false ? 'open' : (f.maintenance_status || 'closed'),
    rules: f.rules ? (Array.isArray(f.rules) ? f.rules : [f.rules]) : ['Contact reception for details'],
    location: f.location || 'Main Building',
    image: getFacilityImage(f.name || ''),
  }));

  const displayFacilities = dbFacilities.length > 0 ? dbFacilities : fallbackFacilities;

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
              World-Class Facilities
            </h2>
            <div
              className="mx-auto mt-4 h-px w-32"
              style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }}
            />
            <p className="mt-4 text-lg text-white/60">
              Premium amenities designed for your comfort and pleasure
            </p>
          </motion.div>

          {/* Status Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-6 mb-12"
          >
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                <span className="text-xs text-white/50 tracking-wider uppercase">{cfg.label}</span>
              </div>
            ))}
          </motion.div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {displayFacilities.map((facility, i) => (
                <FacilityCard key={facility.name} facility={facility} index={i} />
              ))}
            </motion.div>
          )}

          {/* Facility count */}
          {!loading && facilitiesFromDB.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center mt-8 text-sm text-white/40"
            >
              {facilitiesFromDB.length} facilit{facilitiesFromDB.length !== 1 ? 'ies' : 'y'} available
            </motion.p>
          )}
        </div>
      </section>

      {/* Concierge CTA */}
      <section className="py-16 px-6" style={{ background: `linear-gradient(180deg, ${bg}, #0a0a0a, ${bg})` }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <GlassCard className="p-10">
              <AlertTriangle size={28} style={{ color: gold }} className="mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">Need Assistance?</h3>
              <p className="mt-3 text-sm text-white/60">
                Our concierge team is available 24/7 to help you with any facility bookings or special requests.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `0 0 25px ${gold}44` }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 px-10 py-4 text-lg font-semibold rounded-full tracking-wider transition-colors duration-300"
                style={{
                  background: `linear-gradient(135deg, ${gold}, #b8941e)`,
                  color: bg,
                }}
              >
                Contact Concierge
              </motion.button>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
