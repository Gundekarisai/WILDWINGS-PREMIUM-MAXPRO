import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  ArrowLeft,
  Utensils,
  Bed,
  Crown,
  Wrench,
  AlertTriangle,
  Building,
  ConciergeBell,
  ChevronRight,
} from 'lucide-react';
import { api } from '../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Option {
  label: string;
  value: string;
}

interface Message {
  id: number;
  type: 'bot' | 'user';
  text: string;
  options?: Option[];
}

type Workflow =
  | 'main'
  | 'booking'
  | 'pricing'
  | 'restaurant'
  | 'facilities'
  | 'emergency'
  | 'complaints'
  | 'reception';

// ─── Constants ───────────────────────────────────────────────────────────────

const GOLD = '#D4AF37';
const GOLD_BORDER = '1px solid rgba(212, 175, 55, 0.4)';
const GOLD_BG_HOVER = 'rgba(212, 175, 55, 0.1)';

const ROOM_CATEGORIES = ['Deluxe', 'Royal', 'Presidential'];
const DINING_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Beverages'];
const FACILITY_NAMES = ['Swimming Pool', 'Spa', 'Gym', 'Rooftop Lounge', 'Valet Parking'];
const EMERGENCY_TYPES = ['Fire Exit', 'Medical Emergency', 'Security Help', 'Lost Item', 'Navigation Help'];
const ISSUE_TYPES = ['AC Problem', 'Water Leakage', 'WiFi Problem', 'Cleaning Required', 'TV Not Working', 'Other'];
const RECEPTION_SERVICES = ['Airport Pickup', 'Wake-up Call', 'Extend Stay', 'Late Checkout', 'General Support'];

// ─── Static Facility Info ───────────────────────────────────────────────────

const FACILITY_INFO: Record<string, string> = {
  'Swimming Pool': 'Open 6 AM \u2013 10 PM daily. Heated outdoor infinity pool, 25m lap lane. Towels provided. Poolside bar open 9 AM \u2013 9 PM.',
  'Spa': 'Open 8 AM \u2013 9 PM. Services: Swedish Massage, Deep Tissue, Aromatherapy, Facial Treatments. Book via reception or dial ext. 108.',
  'Gym': 'Open 24/7. Treadmills, Free Weights, Resistance Machines, Yoga Studio. Personal trainer available 7 AM \u2013 7 PM.',
  'Rooftop Lounge': 'Open 4 PM \u2013 1 AM. Signature cocktails, panoramic city views. Live DJ on Fri & Sat. Dress code: Smart Casual.',
  'Valet Parking': 'Available 24/7. Rate: \u20B9500/day for hotel guests. Request pickup via reception or dial ext. 101.',
};

// ─── Static Menu Data (fallback) ────────────────────────────────────────────

const MENU_DATA: Record<string, { name: string; price: string }[]> = {
  Breakfast: [
    { name: 'Continental Spread', price: '\u20B9850' },
    { name: 'Eggs Benedict', price: '\u20B9650' },
    { name: 'Avocado Toast', price: '\u20B9550' },
    { name: 'Fresh Fruit Platter', price: '\u20B9450' },
    { name: 'Pancake Stack', price: '\u20B9600' },
  ],
  Lunch: [
    { name: 'Grilled Chicken Caesar', price: '\u20B91100' },
    { name: 'Truffle Pasta', price: '\u20B91350' },
    { name: 'Pan-Seared Salmon', price: '\u20B91600' },
    { name: 'Margherita Pizza', price: '\u20B9900' },
    { name: 'Mezze Platter', price: '\u20B91050' },
  ],
  Dinner: [
    { name: 'Wagyu Beef Tenderloin', price: '\u20B94500' },
    { name: 'Lobster Thermidor', price: '\u20B93800' },
    { name: 'Rack of Lamb', price: '\u20B93200' },
    { name: 'Mushroom Risotto', price: '\u20B91800' },
    { name: "Chef's Tasting Menu", price: '\u20B96500' },
  ],
  Desserts: [
    { name: 'Cr\u00e8me Br\u00fbl\u00e9e', price: '\u20B9650' },
    { name: 'Dark Chocolate Fondant', price: '\u20B9700' },
    { name: 'Mango Sorbet', price: '\u20B9500' },
    { name: 'Tiramisu', price: '\u20B9750' },
    { name: 'Cheese Board', price: '\u20B91200' },
  ],
  Beverages: [
    { name: 'Fresh Juice', price: '\u20B9400' },
    { name: 'Mocktail', price: '\u20B9550' },
    { name: 'House Wine (glass)', price: '\u20B9950' },
    { name: 'Craft Cocktail', price: '\u20B91100' },
    { name: 'Artisan Coffee', price: '\u20B9350' },
  ],
};

const MAIN_MENU_OPTIONS: Option[] = [
  { label: 'Room Availability & Booking', value: 'booking' },
  { label: 'Room Pricing & Features', value: 'pricing' },
  { label: 'Restaurant & Food Menu', value: 'restaurant' },
  { label: 'Hotel Facilities & Timings', value: 'facilities' },
  { label: 'Emergency & Navigation Help', value: 'emergency' },
  { label: 'Complaints & Maintenance', value: 'complaints' },
  { label: 'Talk to Reception', value: 'reception' },
];

const MAIN_MENU_ICONS: Record<string, React.ReactNode> = {
  booking: <Bed className="w-4 h-4" style={{ color: GOLD }} />,
  pricing: <Crown className="w-4 h-4" style={{ color: GOLD }} />,
  restaurant: <Utensils className="w-4 h-4" style={{ color: GOLD }} />,
  facilities: <Building className="w-4 h-4" style={{ color: GOLD }} />,
  emergency: <AlertTriangle className="w-4 h-4" style={{ color: GOLD }} />,
  complaints: <Wrench className="w-4 h-4" style={{ color: GOLD }} />,
  reception: <ConciergeBell className="w-4 h-4" style={{ color: GOLD }} />,
};

// ─── Helper ──────────────────────────────────────────────────────────────────

let nextId = 1;
const msgId = () => nextId++;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [workflow, setWorkflow] = useState<Workflow>('main');
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(false);

  // Workflow data accumulators
  const [bookingData, setBookingData] = useState<Record<string, any>>({});
  const [complaintData, setComplaintData] = useState<Record<string, any>>({});
  const [receptionData, setReceptionData] = useState<Record<string, any>>({});
  const [diningData, setDiningData] = useState<Record<string, any>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputPlaceholder = (() => {
    if (workflow === 'booking' && step === 4) return 'Type your WhatsApp number...';
    if (workflow === 'restaurant' && step === 3) return 'Enter number of guests...';
    if (workflow === 'restaurant' && step === 4) return 'Enter preferred dining time...';
    if (workflow === 'restaurant' && step === 5) return 'Type your WhatsApp number...';
    if (workflow === 'complaints' && step === 3) return 'e.g. 101, 302, 501';
    return 'Please select an option above';
  })();

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Focus input when enabled ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && inputEnabled && inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [isOpen, step, loading, inputEnabled]);

  // ── Add message helper ───────────────────────────────────────────────────
  const addBotMessage = useCallback(
    (text: string, options?: Option[]) => {
      setMessages((prev) => [...prev, { id: msgId(), type: 'bot', text, options }]);
    },
    [],
  );

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: msgId(), type: 'user', text }]);
  }, []);

  // ── Navigate to main menu (direct, no text routing) ──────────────────────
  const navigateToMain = useCallback(() => {
    setWorkflow('main');
    setStep(0);
    setInputEnabled(false);
    setBookingData({});
    setComplaintData({});
    setReceptionData({});
    setDiningData({});
    addBotMessage('Is there anything else I can help you with today?', MAIN_MENU_OPTIONS);
  }, [addBotMessage]);

  // ── Initialize on open ───────────────────────────────────────────────────
  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      addBotMessage(
        "Hey, I am Krishna! How can I help you?",
        MAIN_MENU_OPTIONS,
      );
    }
  };

  // ── Listen for external open requests ────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsOpen(true);
      if (detail?.workflow === 'restaurant') {
        setWorkflow('restaurant');
        setStep(1);
        setInputEnabled(false);
        addBotMessage('Select dining category:', DINING_CATEGORIES.map((c) => ({ label: c, value: c })));
      }
    };
    window.addEventListener('open-chatbot', handler);
    return () => window.removeEventListener('open-chatbot', handler);
  }, [addBotMessage]);

  const handleClose = () => {
    setIsOpen(false);
  };

  // ── Navigation handler (FIX 4a: all nav buttons go here directly) ────────
  const handleNavigation = useCallback(
    (action: string) => {
      if (action === 'main_menu') {
        navigateToMain();
      }
    },
    [navigateToMain],
  );

  // ── Option click handler ─────────────────────────────────────────────────
  const handleOptionClick = useCallback(
    (value: string) => {
      // FIX 4a: Navigation buttons call handleNavigation directly
      if (value === 'back' || value === 'main_menu') {
        handleNavigation('main_menu');
        return;
      }
      if (value === 'goodbye' || value === 'no') {
        addBotMessage('Thank you for visiting WildWings Premium Hotel. Have a wonderful day!');
        navigateToMain();
        return;
      }

      addUserMessage(value);

      if (workflow === 'main') {
        handleMainMenu(value);
      } else {
        handleWorkflowStep(value);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workflow, step, bookingData, complaintData, receptionData, diningData, handleNavigation, navigateToMain],
  );

  // ── Text input submit ────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!inputEnabled) {
      setInput('');
      return;
    }

    addUserMessage(trimmed);
    setInput('');
    handleWorkflowStep(trimmed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, workflow, step, bookingData, complaintData, receptionData, diningData, inputEnabled],
  );

  // ── Main menu router ─────────────────────────────────────────────────────
  const handleMainMenu = (value: string) => {
    const wf = value as Workflow;
    setWorkflow(wf);
    setStep(1);
    setInputEnabled(false);

    switch (wf) {
      case 'booking':
        addBotMessage('Select room category:', ROOM_CATEGORIES.map((c) => ({ label: c, value: c })));
        break;
      case 'pricing':
        addBotMessage('Select room category:', ROOM_CATEGORIES.map((c) => ({ label: c, value: c })));
        break;
      case 'restaurant':
        addBotMessage('Select dining category:', DINING_CATEGORIES.map((c) => ({ label: c, value: c })));
        break;
      case 'facilities':
        addBotMessage('Select facility:', FACILITY_NAMES.map((f) => ({ label: f, value: f })));
        break;
      case 'emergency':
        addBotMessage('What type of emergency assistance?', EMERGENCY_TYPES.map((t) => ({ label: t, value: t })));
        break;
      case 'complaints':
        addBotMessage('Select issue type:', ISSUE_TYPES.map((t) => ({ label: t, value: t })));
        setStep(2);
        break;
      case 'reception':
        addBotMessage('What assistance do you need?', RECEPTION_SERVICES.map((s) => ({ label: s, value: s })));
        break;
      default:
        navigateToMain();
    }
  };

  // ── Workflow step handler ────────────────────────────────────────────────
  const handleWorkflowStep = useCallback(
    async (value: string) => {
      switch (workflow) {
        case 'booking':
          if (value === 'retry') {
            setStep(1);
            setInputEnabled(false);
            addBotMessage('Select room category:', ROOM_CATEGORIES.map((c) => ({ label: c, value: c })));
            break;
          }
          await handleBookingWorkflow(value);
          break;
        case 'pricing':
          await handlePricingWorkflow(value);
          break;
        case 'restaurant':
          await handleRestaurantWorkflow(value);
          break;
        case 'facilities':
          await handleFacilitiesWorkflow(value);
          break;
        case 'emergency':
          await handleEmergencyWorkflow(value);
          break;
        case 'complaints':
          await handleComplaintsWorkflow(value);
          break;
        case 'reception':
          await handleReceptionWorkflow(value);
          break;
        default:
          navigateToMain();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflow, step, bookingData, complaintData, receptionData, diningData],
  );

  // ── WORKFLOW 1: Booking ──────────────────────────────────────────────────
  const handleBookingWorkflow = async (value: string) => {
    const s = step;

    if (s === 1) {
      setBookingData((prev) => ({ ...prev, category: value }));
      setStep(2);
      setInputEnabled(false);
      setLoading(true);
      try {
        const rooms = await api.getAvailableRooms(value);
        setLoading(false);
        if (rooms && rooms.length > 0) {
          const roomOptions = rooms.map((r: any) => ({
            label: `Room ${r.room_number} - $${r.price_per_night || r.price}/night`,
            value: r.room_number,
          }));
          setBookingData((prev) => ({ ...prev, availableRooms: rooms }));
          addBotMessage(
            `Available ${value} rooms. Please select a room:`,
            roomOptions,
          );
        } else {
          const others = ROOM_CATEGORIES.filter((c) => c !== value);
          addBotMessage(
            `No ${value} rooms are currently available. Would you like to check another type?`,
            [
              ...others.map((c) => ({ label: `Check ${c}`, value: c })),
              { label: 'Back to Menu', value: 'back' },
            ],
          );
          setStep(1);
        }
      } catch {
        setLoading(false);
        addBotMessage('We could not fetch room data right now. Please try again or contact our reception at extension 0.', [
          { label: 'Back to Menu', value: 'back' },
        ]);
      }
      return;
    }

    if (s === 2) {
      const selectedRoom = (bookingData.availableRooms || []).find(
        (r: any) => r.room_number === value,
      );
      if (selectedRoom) {
        setBookingData((prev) => ({
          ...prev,
          selectedRoomId: selectedRoom.id,
          selectedRoomNumber: selectedRoom.room_number,
        }));
        const features = (selectedRoom.features || []).join(', ') || 'Standard amenities';
        addBotMessage(
          `Room ${selectedRoom.room_number} (${bookingData.category})\nFloor: ${selectedRoom.room_number.charAt(0)}\nFeatures: ${features}\nPrice: $${selectedRoom.price_per_night || selectedRoom.price}/night\n\nWould you like to book this room?`,
          [
            { label: 'Yes, Book Now', value: 'yes' },
            { label: 'Back to Menu', value: 'back' },
          ],
        );
        setStep(3);
        setInputEnabled(false);
      } else {
        addBotMessage('Room selection not found. Please try again.', [
          { label: 'Back to Menu', value: 'back' },
        ]);
      }
      return;
    }

    if (s === 3) {
      if (value === 'yes') {
        addBotMessage('Please enter your WhatsApp number:');
        setStep(4);
        setInputEnabled(true);
      } else {
        navigateToMain();
      }
      return;
    }

    if (s === 4) {
      setBookingData((prev) => ({ ...prev, whatsapp_number: value }));
      setInputEnabled(false);
      setLoading(true);
      try {
        await api.createBooking({
          room_id: bookingData.selectedRoomId,
          room_number: bookingData.selectedRoomNumber,
          category: bookingData.category,
          whatsapp_number: value,
          status: 'pending',
        });
        setLoading(false);
        addBotMessage(
          'Thank you for booking. Our manager will contact you shortly on WhatsApp. Enjoy your stay at WildWings Premium Hotel.',
        );
        navigateToMain();
      } catch {
        setLoading(false);
        addBotMessage(
          'We could not process your booking right now. Please try again or contact our reception at extension 0.',
          [
            { label: 'Try Again', value: 'retry' },
            { label: 'Back to Menu', value: 'back' },
          ],
        );
      }
      return;
    }
  };

  // ── WORKFLOW 2: Pricing ─────────────────────────────────────────────────
  const handlePricingWorkflow = async (value: string) => {
    const s = step;

    if (s === 1) {
      setInputEnabled(false);
      setLoading(true);
      try {
        const rooms = await api.getRooms();
        setLoading(false);
        const filtered = rooms.filter((r: any) => r.category === value);
        if (filtered.length > 0) {
          const info = filtered
            .map(
              (r: any) =>
                `Room ${r.room_number} - ${r.category}\n  Price: $${r.price_per_night || r.price}/night\n  Features: ${(r.features || []).join(', ') || 'Standard amenities'}\n  Cancellation: Free cancellation up to 24 hours before check-in`,
            )
            .join('\n\n');
          addBotMessage(`Here are the ${value} room details:\n\n${info}\n\nWould you like to check room availability?`, [
            { label: 'Yes, Check Availability', value: 'yes' },
            { label: 'Back to Menu', value: 'back' },
          ]);
          setStep(2);
        } else {
          addBotMessage(`No ${value} rooms found. Would you like to check another category?`, [
            ...ROOM_CATEGORIES.map((c) => ({ label: c, value: c })),
            { label: 'Back to Menu', value: 'back' },
          ]);
        }
      } catch {
        setLoading(false);
        addBotMessage('Could not fetch room data. Please try again later.', [
          { label: 'Back to Menu', value: 'back' },
        ]);
      }
      return;
    }

    if (s === 2) {
      if (value === 'yes') {
        setWorkflow('booking');
        setStep(1);
        setBookingData({ category: '' });
        setInputEnabled(false);
        addBotMessage('Select room category for booking:', ROOM_CATEGORIES.map((c) => ({ label: c, value: c })));
      } else {
        navigateToMain();
      }
      return;
    }
  };

  // ── WORKFLOW 3: Restaurant ──────────────────────────────────────────────
  const handleRestaurantWorkflow = async (value: string) => {
    const s = step;

    if (s === 1) {
      setDiningData((prev) => ({ ...prev, dining_category: value }));
      setStep(2);
      setInputEnabled(false);

      // Fetch from database first, fall back to static data
      setLoading(true);
      try {
        const items = await api.getMenuByCategory(value);
        setLoading(false);
        if (items && items.length > 0) {
          const menuList = items
            .map((item: any) => {
              const chef = item.is_chef_special ? ' \uD83D\uDC68\u200D\uD83C\uDF73' : '';
              return `${item.name} - \u20B9${item.price}${chef}`;
            })
            .join('\n');
          addBotMessage(`Here is our ${value} menu:\n\n${menuList}\n\nWould you like to reserve a dining table?`, [
            { label: 'Yes, Reserve Table', value: 'yes' },
            { label: 'Back to Menu', value: 'back' },
          ]);
        } else {
          addBotMessage('This category is currently unavailable. Please check back later.', [
            { label: 'Back to Menu', value: 'back' },
          ]);
          setStep(1);
        }
      } catch {
        setLoading(false);
        const staticItems = MENU_DATA[value];
        if (staticItems && staticItems.length > 0) {
          const menuList = staticItems
            .map((item) => `${item.name} - ${item.price}`)
            .join('\n');
          addBotMessage(`Here is our ${value} menu:\n\n${menuList}\n\nWould you like to reserve a dining table?`, [
            { label: 'Yes, Reserve Table', value: 'yes' },
            { label: 'Back to Menu', value: 'back' },
          ]);
        } else {
          addBotMessage('This category is currently unavailable. Please check back later.', [
            { label: 'Back to Menu', value: 'back' },
          ]);
          setStep(1);
        }
      }
      return;
    }

    if (s === 2) {
      if (value === 'no') {
        navigateToMain();
        return;
      }
      setStep(3);
      setInputEnabled(true);
      addBotMessage('Please enter the number of guests:');
      return;
    }

    if (s === 3) {
      setDiningData((prev) => ({ ...prev, guest_count: parseInt(value, 10) || 1 }));
      setStep(4);
      addBotMessage('Please enter your preferred dining time (e.g., 7:00 PM):');
      return;
    }

    if (s === 4) {
      setDiningData((prev) => ({ ...prev, timing: value }));
      setStep(5);
      addBotMessage('Please enter your WhatsApp number:');
      return;
    }

    if (s === 5) {
      setInputEnabled(false);
      setLoading(true);
      try {
        await api.createDiningReservation({
          guest_count: diningData.guest_count,
          dining_category: diningData.dining_category,
          timing: diningData.timing,
          whatsapp_number: value,
          status: 'pending',
        });
        setLoading(false);
        addBotMessage(
          'Your dining table has been reserved! Our team will confirm the details shortly. Enjoy your meal at WildWings Premium Hotel.',
        );
        navigateToMain();
      } catch {
        setLoading(false);
        addBotMessage('Reservation failed. Please try again later.', [
          { label: 'Back to Menu', value: 'back' },
        ]);
      }
      return;
    }
  };

  // ── WORKFLOW 4: Facilities ──────────────────────────────────────────────
  const handleFacilitiesWorkflow = async (value: string) => {
    const s = step;

    if (s === 1) {
      setInputEnabled(false);
      const staticInfo = FACILITY_INFO[value];
      if (staticInfo) {
        addBotMessage(`${staticInfo}\n\nWould you like navigation assistance?`, [
          { label: 'Yes, Show Directions', value: 'yes' },
          { label: 'Back to Menu', value: 'back' },
        ]);
        setStep(2);
        return;
      }

      setLoading(true);
      try {
        const facilities = await api.getFacilities();
        setLoading(false);
        const facility = facilities.find(
          (f: any) => f.name && f.name.toLowerCase() === value.toLowerCase(),
        );
        if (facility) {
          const info = [
            facility.name,
            `Timing: ${facility.timings || 'Please inquire at reception'}`,
            `Location: ${facility.location || 'Please inquire at reception'}`,
            `Rules: ${facility.rules || facility.description || 'Standard hotel rules apply'}`,
            `Availability: ${facility.is_open ? 'Available' : 'Currently Unavailable'}`,
          ].join('\n');
          addBotMessage(`${info}\n\nWould you like navigation assistance?`, [
            { label: 'Yes, Show Directions', value: 'yes' },
            { label: 'Back to Menu', value: 'back' },
          ]);
          setStep(2);
        } else {
          addBotMessage('Facility details not found. Please try another selection.', [
            ...FACILITY_NAMES.map((f) => ({ label: f, value: f })),
            { label: 'Back to Menu', value: 'back' },
          ]);
        }
      } catch {
        setLoading(false);
        addBotMessage('Could not fetch facility data. Please try again later.', [
          { label: 'Back to Menu', value: 'back' },
        ]);
      }
      return;
    }

    if (s === 2) {
      if (value === 'yes') {
        addBotMessage(
          'Please head to the main lobby and follow the signage for your selected facility. Our staff at the front desk can also provide a printed map. If you need further help, please call reception at ext. 0.',
        );
      }
      navigateToMain();
      return;
    }
  };

  // ── WORKFLOW 5: Emergency ───────────────────────────────────────────────
  const handleEmergencyWorkflow = async (value: string) => {
    const s = step;

    if (s === 1) {
      setInputEnabled(false);
      setLoading(true);
      try {
        const info = await api.getEmergencyByType(value);
        setLoading(false);
        if (info && info.length > 0) {
          const details = info
            .map((e: any) => {
              const lines = [e.title || e.type || value];
              if (e.directions) lines.push(`Directions: ${e.directions}`);
              if (e.contacts) lines.push(`Contacts: ${e.contacts}`);
              if (e.instructions) lines.push(`Instructions: ${e.instructions}`);
              return lines.join('\n');
            })
            .join('\n\n');
          addBotMessage(`${details}\n\nStay safe. If you need further assistance, please call the front desk immediately.`);
        } else {
          addBotMessage(
            `For ${value}, please contact the front desk immediately at extension 0 or dial 911 for external emergencies. Our staff is available 24/7 to assist you.`,
          );
        }
        navigateToMain();
      } catch {
        setLoading(false);
        addBotMessage(
          `For ${value}, please contact the front desk immediately at extension 0. Our staff is available 24/7.`,
        );
        navigateToMain();
      }
      return;
    }
  };

  // ── WORKFLOW 6: Complaints (FIX 3: collect room number) ─────────────────
  const handleComplaintsWorkflow = async (value: string) => {
    const s = step;

    // Step 2: Issue type selected — ask for room number
    if (s === 2) {
      setComplaintData((prev) => ({ ...prev, issue_type: value }));
      setStep(3);
      setInputEnabled(true);
      addBotMessage('Please enter your room number so we can send maintenance to the correct room:');
      return;
    }

    // Step 3: Room number entered — validate
    if (s === 3) {
      const roomNum = parseInt(value, 10);
      if (isNaN(roomNum) || roomNum < 100 || roomNum > 599) {
        addBotMessage('Please enter a valid room number (e.g. 101, 302).');
        // Keep input enabled for retry
        return;
      }

      // Valid room number — save complaint
      setComplaintData((prev) => ({ ...prev, room_number: value }));
      setInputEnabled(false);
      setLoading(true);
      try {
        await api.createComplaint({
          room_number: value,
          issue_type: complaintData.issue_type,
          description: `${complaintData.issue_type} reported via chatbot`,
          status: 'pending',
          technician_name: 'Unassigned',
        });
        setLoading(false);
      } catch {
        setLoading(false);
      }
      addBotMessage(
        `Your ${complaintData.issue_type} complaint for Room ${value} has been registered. Maintenance will be dispatched immediately. Dial ext. 111 for urgent help.`,
      );
      navigateToMain();
      return;
    }
  };

  // ── WORKFLOW 7: Reception ──────────────────────────────────────────────
  const handleReceptionWorkflow = async (value: string) => {
    const s = step;

    if (s === 1) {
      setInputEnabled(false);
      // FIX 4d: Wake-up Call specific response
      if (value === 'Wake-up Call') {
        addBotMessage(
          'Please tell us your preferred wake-up time and our reception team will schedule it. You can also dial ext. 0 from your room phone.',
          [{ label: 'Back to Menu', value: 'back' }],
        );
        return;
      }

      // All other reception services
      addBotMessage(
        `Connecting you to reception... You can also dial ext. 0 from your room phone. Our front desk is available 24/7.\n\nFor ${value}, please contact our reception team and they will assist you promptly.`,
      );
      navigateToMain();
      return;
    }
  };

  // ── Back button handler ─────────────────────────────────────────────────
  const handleBack = () => {
    if (workflow === 'main') return;
    handleNavigation('main_menu');
  };

  // ── Keyboard handler ────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating Chef Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="chatbot-fab"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: [0, -12, 0],
            }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{
              scale: { type: 'spring', stiffness: 260, damping: 20 },
              opacity: { duration: 0.3 },
              y: {
                delay: 1,
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            className="fixed z-[9998] flex flex-col items-center cursor-pointer"
            style={{ bottom: '24px', right: '24px', left: 'auto' }}
            onClick={handleOpen}
          >
            {/* Speech bubble */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mb-2 px-4 py-2 rounded-2xl rounded-bl-sm text-xs font-medium tracking-wide whitespace-nowrap shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${GOLD}, #B8941F)`,
                color: '#0a0a0a',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Hey, I am Krishna!
            </motion.div>

            {/* Chef avatar - premium animated character */}
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: `0 0 40px rgba(212, 175, 55, 0.7)` }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: `radial-gradient(circle at 40% 35%, #2a2a2a, #0a0a0a)`,
                border: `3px solid rgba(212, 175, 55, 0.5)`,
                boxShadow: `0 8px 32px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
            >
              {/* Animated Premium Chef Character */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg viewBox="0 0 100 120" width="56" height="68" className="drop-shadow-lg">
                  {/* Chef Hat - white puffed */}
                  <defs>
                    <linearGradient id="hatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f5f5f5" />
                    </linearGradient>
                    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f4d4b8" />
                      <stop offset="100%" stopColor="#e8b895" />
                    </linearGradient>
                    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B6F47" />
                      <stop offset="100%" stopColor="#6B5535" />
                    </linearGradient>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
                    </filter>
                  </defs>

                  {/* Hat puffs - animated bobbing */}
                  <motion.g
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ellipse cx="30" cy="12" rx="8" ry="10" fill="url(#hatGrad)" filter="url(#shadow)" />
                    <ellipse cx="50" cy="8" rx="10" ry="12" fill="url(#hatGrad)" filter="url(#shadow)" />
                    <ellipse cx="70" cy="12" rx="8" ry="10" fill="url(#hatGrad)" filter="url(#shadow)" />
                    <rect x="15" y="24" width="70" height="4" rx="2" fill="#d4af37" filter="url(#shadow)" />
                  </motion.g>

                  {/* Hair */}
                  <motion.g
                    animate={{ y: [0, -1, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <path d="M 28 28 Q 22 35 20 45" stroke="#6B5535" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M 72 28 Q 78 35 80 45" stroke="#6B5535" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M 35 30 Q 35 38 36 45" stroke="#7B6545" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
                    <path d="M 50 28 Q 50 38 50 45" stroke="#8B6F47" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
                    <path d="M 65 30 Q 65 38 64 45" stroke="#7B6545" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
                  </motion.g>

                  {/* Face */}
                  <motion.g
                    animate={{ y: [0, -0.5, 0] }}
                    transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ellipse cx="50" cy="52" rx="18" ry="19" fill="url(#skinGrad)" filter="url(#shadow)" />
                    <ellipse cx="32" cy="50" rx="4" ry="6" fill="#f4d4b8" />
                    <ellipse cx="32" cy="50" rx="2.5" ry="4" fill="#e8b895" />
                    <ellipse cx="68" cy="50" rx="4" ry="6" fill="#f4d4b8" />
                    <ellipse cx="68" cy="50" rx="2.5" ry="4" fill="#e8b895" />
                    <circle cx="24" cy="55" r="4" fill="#ff9a76" opacity="0.4" />
                    <circle cx="76" cy="55" r="4" fill="#ff9a76" opacity="0.4" />
                    <ellipse cx="40" cy="48" rx="2.5" ry="3.5" fill="#2c1810" />
                    <ellipse cx="40.5" cy="47" rx="1" ry="1.2" fill="#ffffff" />
                    <ellipse cx="60" cy="48" rx="2.5" ry="3.5" fill="#2c1810" />
                    <ellipse cx="60.5" cy="47" rx="1" ry="1.2" fill="#ffffff" />
                    <path d="M 36 44 Q 40 43 44 44" stroke="#6B5535" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    <path d="M 56 44 Q 60 43 64 44" stroke="#6B5535" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    <motion.path
                      d="M 42 62 Q 50 68 58 62"
                      stroke="#c85a54"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      animate={{ d: ['M 42 62 Q 50 68 58 62', 'M 42 62 Q 50 70 58 62', 'M 42 62 Q 50 68 58 62'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.g>

                  {/* Shoulders & Shirt */}
                  <motion.g
                    animate={{ y: [0, -0.5, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <rect x="32" y="70" width="36" height="16" rx="4" fill="#5B8FD4" filter="url(#shadow)" />
                    <circle cx="50" cy="75" r="1.2" fill="#d4af37" />
                    <circle cx="50" cy="81" r="1.2" fill="#d4af37" />
                  </motion.g>
                </svg>

                {/* Floating animation indicator */}
                <motion.div
                  className="absolute -bottom-1 flex gap-1"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-1 h-1 rounded-full" style={{ background: GOLD }} />
                  <div className="w-1 h-1 rounded-full" style={{ background: GOLD }} />
                </motion.div>
              </div>

              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${GOLD}` }}
                animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `1.5px solid ${GOLD}` }}
                animate={{ scale: [1, 1.35], opacity: [0.3, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut', delay: 0.8 }}
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatbot-panel"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed z-[9998] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              top: '80px',
              bottom: '80px',
              right: '16px',
              left: 'auto',
              width: 'min(380px, calc(100vw - 32px))',
              height: 'auto',
              maxHeight: 'calc(100vh - 160px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: `1px solid rgba(212, 175, 55, 0.25)`,
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{
                borderBottom: `1px solid rgba(212, 175, 55, 0.2)`,
                background: `linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))`,
              }}
            >
              <div className="flex items-center gap-3">
                {workflow !== 'main' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBack}
                    className="p-1 rounded-md cursor-pointer"
                    style={{ color: GOLD }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </motion.button>
                )}
                <div>
                  <h2
                    className="text-base font-bold tracking-wide"
                    style={{ color: GOLD, fontFamily: "'Playfair Display', serif" }}
                  >
                    Krishna - Your Concierge
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    WildWings Premium Hotel
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="p-1.5 rounded-md cursor-pointer"
                style={{ color: GOLD }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 0 }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.type === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                    }`}
                    style={
                      msg.type === 'user'
                        ? {
                            background: `linear-gradient(135deg, ${GOLD}, #B8941F)`,
                            color: '#0a0a0a',
                            fontWeight: 500,
                          }
                        : {
                            backgroundColor: 'rgba(212, 175, 55, 0.08)',
                            border: `1px solid rgba(212, 175, 55, 0.2)`,
                            color: '#e5e5e5',
                          }
                    }
                  >
                    {msg.text}

                    {/* Option buttons */}
                    {msg.options && msg.options.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.options.map((opt) => {
                          const isMainOption = workflow === 'main' || (msg.type === 'bot' && step === 0);
                          const icon = isMainOption ? MAIN_MENU_ICONS[opt.value] : null;

                          return (
                            <motion.button
                              key={opt.value}
                              whileHover={{ scale: 1.02, backgroundColor: GOLD_BG_HOVER }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleOptionClick(opt.value)}
                              disabled={loading}
                              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                              style={{
                                border: GOLD_BORDER,
                                backgroundColor: 'transparent',
                                color: '#e5e5e5',
                              }}
                            >
                              {icon && <span className="shrink-0">{icon}</span>}
                              <span className="flex-1">{opt.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-md text-sm"
                    style={{
                      backgroundColor: 'rgba(212, 175, 55, 0.08)',
                      border: `1px solid rgba(212, 175, 55, 0.2)`,
                      color: GOLD,
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      >
                        .
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      >
                        .
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      >
                        .
                      </motion.span>
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ── */}
            <div
              className="shrink-0 px-4 py-3"
              style={{
                borderTop: `1px solid rgba(212, 175, 55, 0.2)`,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={inputPlaceholder}
                  disabled={!inputEnabled || loading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    backgroundColor: inputEnabled ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.04)',
                    border: `1px solid rgba(212, 175, 55, ${inputEnabled ? '0.2' : '0.1'})`,
                    color: inputEnabled ? '#e5e5e5' : '#666',
                    opacity: inputEnabled ? 1 : 0.5,
                    cursor: inputEnabled ? 'text' : 'not-allowed',
                  }}
                />
                <motion.button
                  whileHover={inputEnabled ? { scale: 1.1 } : {}}
                  whileTap={inputEnabled ? { scale: 0.9 } : {}}
                  onClick={handleSend}
                  disabled={!inputEnabled || loading || !input.trim()}
                  className="p-2.5 rounded-xl cursor-pointer disabled:opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD}, #B8941F)`,
                    color: '#0a0a0a',
                  }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
