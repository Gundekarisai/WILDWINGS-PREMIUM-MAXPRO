import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  GlassWater,
  Coffee,
  Star,
  Clock,
  Flame,
  Leaf,
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

/* ─── Restaurant Data ─── */

interface Restaurant {
  name: string;
  type: string;
  icon: React.ElementType;
  description: string;
  image: string;
  hours: string;
}

const restaurants: Restaurant[] = [
  {
    name: 'The Golden Fork',
    type: 'Fine Dining',
    icon: UtensilsCrossed,
    description:
      'An exquisite culinary journey featuring Michelin-starred chefs crafting seasonal tasting menus with the finest global ingredients.',
    image: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800',
    hours: '6:00 PM - 11:00 PM',
  },
  {
    name: 'Sky Lounge',
    type: 'Rooftop Bar',
    icon: GlassWater,
    description:
      'Sip handcrafted cocktails 50 stories above the city. Live jazz, panoramic sunsets, and an award-winning wine list of 500+ labels.',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800',
    hours: '4:00 PM - 1:00 AM',
  },
  {
    name: 'The Emerald',
    type: 'All-Day Dining',
    icon: Coffee,
    description:
      'From artisan breakfasts to midnight cravings, The Emerald serves globally inspired comfort food around the clock in a lush conservatory setting.',
    image: 'https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=800',
    hours: '6:00 AM - 12:00 AM',
  },
];

/* ─── Menu Category Order ─── */

const menuCategoryOrder = ['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Beverages'];

const categoryIconMap: Record<string, React.ElementType> = {
  Breakfast: Coffee,
  Lunch: UtensilsCrossed,
  Dinner: Flame,
  Desserts: Leaf,
  Beverages: GlassWater,
};

/* ─── Static Fallback Menu ─── */

const fallbackMenu: Record<string, { name: string; description: string; price: number; is_chef_special?: boolean }[]> = {
  Breakfast: [
    { name: 'Truffle Eggs Benedict', description: 'Poached eggs, black truffle, hollandaise on brioche', price: 32, is_chef_special: true },
    { name: 'Smoked Salmon Bagel', description: 'Norwegian salmon, cream cheese, capers, dill', price: 28 },
    { name: 'WildWings Grand Breakfast', description: 'Full continental with artisan pastries and fresh juices', price: 45 },
    { name: 'Acai Power Bowl', description: 'Organic acai, granola, fresh berries, honey drizzle', price: 24 },
  ],
  Lunch: [
    { name: 'Wagyu Beef Burger', description: 'A5 wagyu, aged cheddar, truffle aioli, brioche bun', price: 48, is_chef_special: true },
    { name: 'Lobster Bisque', description: 'Creamy Maine lobster bisque with cognac croutons', price: 34 },
    { name: 'Mediterranean Salad', description: 'Heirloom tomatoes, burrata, olive tapenade, basil oil', price: 28 },
    { name: 'Grilled Sea Bass', description: 'Chilean sea bass, citrus beurre blanc, asparagus', price: 52 },
  ],
  Dinner: [
    { name: 'Dry-Aged Ribeye', description: '45-day dry-aged prime ribeye, bone marrow butter, truffle jus', price: 98, is_chef_special: true },
    { name: 'Pan-Seared Duck Breast', description: 'Cherry gastrique, fondant potato, wilted greens', price: 72 },
    { name: 'Lobster Thermidor', description: 'Whole Maine lobster, cognac cream, gruyere gratin', price: 88 },
    { name: 'Wild Mushroom Risotto', description: 'Porcini, chanterelle, truffle oil, aged parmesan', price: 44 },
    { name: 'Omakase Tasting', description: '7-course chef\'s selection with wine pairing', price: 195 },
  ],
  Desserts: [
    { name: 'Gold Leaf Tiramisu', description: 'Classic tiramisu adorned with 24k gold leaf', price: 28, is_chef_special: true },
    { name: 'Chocolate Fondant', description: 'Valrhona dark chocolate, molten center, vanilla bean ice cream', price: 26 },
    { name: 'Creme Brulee', description: 'Tahitian vanilla, caramelized sugar crust, seasonal berries', price: 22 },
    { name: 'Panna Cotta', description: 'Rose-infused, pistachio crumble, raspberry coulis', price: 24 },
  ],
  Beverages: [
    { name: 'Dom Perignon 2012', description: 'Vintage champagne, 750ml', price: 320 },
    { name: 'WildWings Old Fashioned', description: 'Japanese whisky, gold flake bitters, smoked orange', price: 36, is_chef_special: true },
    { name: 'Signature Martini', description: 'Grey Goose, dry vermouth, blue cheese olives', price: 28 },
    { name: 'Artisan Coffee Flight', description: 'Single-origin pour-over trio with tasting notes', price: 22 },
  ],
};

/* ─── Components ─── */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${gold}22` }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

function RestaurantCard({ restaurant, index }: { restaurant: Restaurant; index: number }) {
  const Icon = restaurant.icon;
  return (
    <motion.div variants={fadeUp} custom={index}>
      <GlassCard className="group">
        <div className="h-56 w-full relative overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(5,5,5,0.9) 100%)' }} />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${gold}15`, border: `1px solid ${gold}33`, backdropFilter: 'blur(8px)' }}>
            <Clock size={14} style={{ color: gold }} />
            <span className="text-xs" style={{ color: gold }}>{restaurant.hours}</span>
          </div>
          <div className="absolute top-4 right-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${gold}25`, border: `1px solid ${gold}44`, backdropFilter: 'blur(8px)' }}>
              <Icon size={18} style={{ color: gold }} />
            </div>
          </div>
        </div>

        <div className="p-6">
          <span className="text-xs tracking-widest uppercase" style={{ color: gold }}>
            {restaurant.type}
          </span>
          <h3 className="mt-2 text-2xl font-semibold text-white">{restaurant.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/60">{restaurant.description}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function MenuItemCard({
  item,
  index,
}: {
  item: { name: string; description: string; price: number; is_chef_special?: boolean };
  index: number;
}) {
  return (
    <motion.div variants={fadeUp} custom={index}>
      <GlassCard className="p-5 h-full flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-semibold text-white">{item.name}</h4>
              {item.is_chef_special && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase" style={{ background: `${gold}20`, color: gold, border: `1px solid ${gold}44` }}>
                  <Flame size={10} />
                  Chef's Special
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-white/50 leading-relaxed">{item.description}</p>
          </div>
          <p className="text-lg font-bold shrink-0" style={{ color: gold }}>
            ${item.price}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function MenuCategorySection({
  category,
  items,
  index,
}: {
  category: string;
  items: { name: string; description: string; price: number; is_chef_special?: boolean }[];
  index: number;
}) {
  const Icon = categoryIconMap[category] || UtensilsCrossed;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${gold}15`, border: `1px solid ${gold}33` }}
        >
          <Icon size={20} style={{ color: gold }} />
        </div>
        <h3 className="text-xl font-semibold text-white">{category}</h3>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${gold}33, transparent)` }} />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {items.map((item, i) => (
          <MenuItemCard key={item.name} item={item} index={i} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-12">
      {[0, 1, 2].map((cat) => (
        <div key={cat}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
            <div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-20 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DiningPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await api.getMenuItems();
        setMenuItems(data || []);
      } catch {
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Group DB menu items by category
  const dbMenuByCategory: Record<string, any[]> = {};
  menuItems.forEach((item) => {
    const cat = item.category || 'Dinner';
    if (!dbMenuByCategory[cat]) dbMenuByCategory[cat] = [];
    dbMenuByCategory[cat].push({
      name: item.name,
      description: item.description || '',
      price: item.price || 0,
      is_chef_special: item.is_chef_special || item.chef_special || false,
    });
  });

  // Build display menu: use DB items if available, else fallback
  const displayMenu: Record<string, { name: string; description: string; price: number; is_chef_special?: boolean }[]> = {};
  const allCategories = [...new Set([...menuCategoryOrder, ...Object.keys(dbMenuByCategory)])];

  allCategories.forEach((cat) => {
    if (dbMenuByCategory[cat]?.length > 0) {
      displayMenu[cat] = dbMenuByCategory[cat];
    } else if (fallbackMenu[cat]) {
      displayMenu[cat] = fallbackMenu[cat];
    }
  });

  // If no categories at all, use fallback
  const hasAnyData = Object.keys(displayMenu).length > 0;
  const finalMenu = hasAnyData ? displayMenu : fallbackMenu;

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
              Fine Dining
            </h2>
            <div
              className="mx-auto mt-4 h-px w-32"
              style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }}
            />
            <p className="mt-4 text-lg text-white/60">
              Savor extraordinary flavors in extraordinary settings
            </p>
          </motion.div>

          {/* Restaurants */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {restaurants.map((r, i) => (
              <RestaurantCard key={r.name} restaurant={r} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 px-6" style={{ background: `linear-gradient(180deg, ${bg}, #0a0a0a, ${bg})` }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Our Menu
            </h3>
            <div
              className="mx-auto mt-3 h-px w-24"
              style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }}
            />
          </motion.div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            Object.entries(finalMenu).map(([category, items], i) => (
              <MenuCategorySection key={category} category={category} items={items} index={i} />
            ))
          )}
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <GlassCard className="p-10">
              <Star size={32} style={{ color: gold }} className="mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">Reserve Your Table</h3>
              <p className="mt-3 text-sm text-white/60">
                Secure your place for an unforgettable dining experience
              </p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `0 0 25px ${gold}44` }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot', { detail: { workflow: 'restaurant' } }))}
                className="mt-6 px-10 py-4 text-lg font-semibold rounded-full tracking-wider transition-colors duration-300 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${gold}, #b8941e)`,
                  color: bg,
                }}
              >
                Make a Reservation
              </motion.button>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
