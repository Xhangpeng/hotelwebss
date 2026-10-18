import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  UtensilsCrossed,
  Calendar,
  Settings,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Flame,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Sparkles,
  Tag,
  MessageSquare,
  PartyPopper,
  Check,
  Bell,
  Eye,
  Lock,
  Phone,
  Receipt,
  KeyRound,
  ChefHat,
  Compass,
  ArrowRight,
  Store,
  LayoutGrid,
  ChevronRight,
  Layers,
  SlidersHorizontal,
  ArrowLeft,
} from 'lucide-react';
import { isAdminUser, verifyAdminPin, ADMIN_EMAILS } from '../utils/authHelper';
import {
  Order,
  TableBookingDetails,
  UserProfile,
  MenuItem,
  CateringInquiry,
  DiningTable,
  PromoCoupon,
  GuestReview,
  UserRole,
  SpiceLevel,
  CartItem,
} from '../types/restaurant';
import { INITIAL_MENU_ITEMS } from '../data/menuData';
import { PalaceLogo } from './PalaceLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
}

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalReservations: number;
  confirmedReservations: number;
  totalCustomers: number;
  avgOrderValue: number;
}

// Initial Floor Tables Data
const INITIAL_TABLES: DiningTable[] = [
  { id: 't1', tableNumber: 'Table 1', capacity: 2, area: 'Royal Courtyard', status: 'available' },
  { id: 't2', tableNumber: 'Table 2', capacity: 4, area: 'Royal Courtyard', status: 'occupied', currentGuestName: 'Aditya V.', occupiedSince: '25m ago' },
  { id: 't3', tableNumber: 'Table 3', capacity: 4, area: 'Royal Courtyard', status: 'reserved', currentGuestName: 'Kapoor Family', occupiedSince: '08:00 PM' },
  { id: 't4', tableNumber: 'Table 4', capacity: 6, area: 'Main Dining Hall', status: 'available' },
  { id: 't5', tableNumber: 'Table 5', capacity: 4, area: 'Main Dining Hall', status: 'occupied', currentGuestName: 'Mehta Corp', occupiedSince: '40m ago' },
  { id: 't6', tableNumber: 'Table 6', capacity: 2, area: 'Main Dining Hall', status: 'cleaning' },
  { id: 't7', tableNumber: 'Table 7', capacity: 8, area: 'Maharaja Baithak', status: 'occupied', currentGuestName: 'Singhania Royals', occupiedSince: '1h 10m ago' },
  { id: 't8', tableNumber: 'Table 8', capacity: 8, area: 'Maharaja Baithak', status: 'reserved', currentGuestName: 'Sharma Wedding Party', occupiedSince: '08:30 PM' },
  { id: 't9', tableNumber: 'Table 9', capacity: 4, area: 'Rooftop Terrace', status: 'available' },
  { id: 't10', tableNumber: 'Table 10', capacity: 4, area: 'Rooftop Terrace', status: 'available' },
  { id: 't11', tableNumber: 'Table 11', capacity: 6, area: 'Rooftop Terrace', status: 'occupied', currentGuestName: 'Dr. Bansal', occupiedSince: '15m ago' },
  { id: 't12', tableNumber: 'Table 12', capacity: 2, area: 'Rooftop Terrace', status: 'cleaning' },
];

// Initial Catering Inquiries
const INITIAL_CATERING: CateringInquiry[] = [
  {
    id: 'cat_1',
    name: 'Rajesh Singhania',
    phone: '+91 98101 88992',
    email: 'singhania.r@corp.in',
    eventType: 'Silver Jubilee Wedding Anniversary',
    eventDate: '2026-11-20',
    guestCount: 180,
    budgetRange: '₹3,00,000 – ₹4,50,000',
    specialRequirements: 'Full Silver Thali live service, Kesariya Jalebi & Rabri live counter, Satvik Jain food for 40 guests.',
    status: 'quoted',
    quotedAmount: 375000,
    createdAt: 'Yesterday, 04:30 PM',
  },
  {
    id: 'cat_2',
    name: 'Pooja Agarwal',
    phone: '+91 98114 55221',
    email: 'pooja.agarwal@gmail.com',
    eventType: 'Corporate Annual Gala Dinner',
    eventDate: '2026-11-05',
    guestCount: 220,
    budgetRange: '₹4,00,000 – ₹5,50,000',
    specialRequirements: 'Live Tandoor skewers, mocktail botanical coolers bar, Awadhi Dum Biryani live deg.',
    status: 'new',
    createdAt: 'Today, 11:15 AM',
  },
  {
    id: 'cat_3',
    name: 'Col. Vikram Rathore',
    phone: '+91 98711 44330',
    email: 'vikram.rathore@outlook.com',
    eventType: 'Retirement Celebration Banquet',
    eventDate: '2026-10-28',
    guestCount: 75,
    budgetRange: '₹1,50,000 – ₹2,00,000',
    specialRequirements: 'Courtyard Baithak reserved with live sitar maestro.',
    status: 'confirmed',
    quotedAmount: 185000,
    createdAt: '3 days ago',
  },
];

// Initial Coupons
const INITIAL_COUPONS: PromoCoupon[] = [
  {
    id: 'c1',
    code: 'SHANKAR20',
    description: '20% off on all royal food orders above ₹600',
    discountPercent: 20,
    minOrderValue: 600,
    maxDiscount: 250,
    isActive: true,
  },
  {
    id: 'c2',
    code: 'TASTE50',
    description: 'Flat ₹50 off on first order',
    discountFlat: 50,
    minOrderValue: 350,
    isActive: true,
  },
  {
    id: 'c3',
    code: 'ROYAL100',
    description: 'Flat ₹100 off on Grand Thalis & Biryanis',
    discountFlat: 100,
    minOrderValue: 800,
    isActive: true,
  },
  {
    id: 'c4',
    code: 'FESTIVE15',
    description: '15% festive discount for loyal patrons',
    discountPercent: 15,
    minOrderValue: 500,
    isActive: false,
  },
];

// Initial Reviews
const INITIAL_REVIEWS: GuestReview[] = [
  {
    id: 'r1',
    guestName: 'Ananya Deshmukh',
    rating: 5,
    dishRecommended: 'Maheswari Paneer Butter Masala',
    comment: 'The velvety makhani gravy is heavenly. Tastes like pure heritage royalty! Desi ghee aroma is unmistakable.',
    date: '14 Oct 2026',
    verifiedDining: true,
    adminReply: 'Thank you Ananya ji! It brings our chefs immense joy to serve you authentic royal recipes.',
  },
  {
    id: 'r2',
    guestName: 'Gaurav Khandelwal',
    rating: 5,
    dishRecommended: 'Maharaja Grand Thali',
    comment: 'Best pure veg dining hall in Connaught Place. The live sitar music and Dal Baati Churma made our family evening unforgettable.',
    date: '12 Oct 2026',
    verifiedDining: true,
  },
  {
    id: 'r3',
    guestName: 'Meera Sen',
    rating: 4,
    dishRecommended: 'Kesariya Jalebi with Malai Rabri',
    comment: 'Crispy hot jalebis paired with thick rabri was spectacular. Food arrived piping hot.',
    date: '10 Oct 2026',
    verifiedDining: true,
    adminReply: 'Thank you Meera ji! We have expanded our express dispatch crew to ensure under 25-minute delivery.',
  },
];

// Initial Staff Roster
interface StaffMember {
  id: string;
  name: string;
  role: 'head_chef' | 'sous_chef' | 'floor_captain' | 'cashier' | 'rider_lead';
  station: string;
  phone: string;
  shiftStatus: 'on_shift' | 'off_duty';
  joinedDate: string;
}

const INITIAL_STAFF: StaffMember[] = [
  { id: 's1', name: 'Ustad Ramkishan Maharaj', role: 'head_chef', station: 'Tandoor & Dum Deg', phone: '+91 98110 11223', shiftStatus: 'on_shift', joinedDate: 'Jan 2026' },
  { id: 's2', name: 'Chef Arvind Mathur', role: 'sous_chef', station: 'Makhani & Gravies', phone: '+91 98114 44556', shiftStatus: 'on_shift', joinedDate: 'Feb 2026' },
  { id: 's3', name: 'Manish Rawat', role: 'floor_captain', station: 'Courtyard & Baithak', phone: '+91 98711 77889', shiftStatus: 'on_shift', joinedDate: 'Feb 2026' },
  { id: 's4', name: 'Deepak Joshi', role: 'cashier', station: 'Billing & POS', phone: '+91 99100 22334', shiftStatus: 'on_shift', joinedDate: 'Mar 2026' },
  { id: 's5', name: 'Sunil Gurjar', role: 'rider_lead', station: 'Express Dispatch', phone: '+91 98101 99887', shiftStatus: 'on_shift', joinedDate: 'Mar 2026' },
];

export const AdminPanelModal: React.FC<Props> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<
    'kds' | 'menu' | 'tables' | 'reservations' | 'catering' | 'coupons' | 'staff' | 'settings' | 'analytics' | 'reviews'
  >('kds');

  // Manager Operations "More" choice modal prompt state
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [previousTab, setPreviousTab] = useState<'kds' | 'tables' | 'reservations' | 'menu'>('kds');

  // Lock background body scroll while Admin Panel is open to prevent double scrollbars
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Language state: Hindi (default) / English
  const [lang, setLang] = useState<'hi' | 'en'>('hi');

  // Department role & access state
  const [currentRole, setCurrentRole] = useState<UserRole>((user.role as UserRole) || 'admin');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(true);

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<TableBookingDetails[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const stored = localStorage.getItem('shankar_admin_menu');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_MENU_ITEMS;
  });
  const [diningTables, setDiningTables] = useState<DiningTable[]>(() => {
    try {
      const stored = localStorage.getItem('shankar_admin_tables');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_TABLES;
  });
  const [cateringInquiries, setCateringInquiries] = useState<CateringInquiry[]>(() => {
    try {
      const stored = localStorage.getItem('shankar_admin_catering');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_CATERING;
  });
  const [coupons, setCoupons] = useState<PromoCoupon[]>(() => {
    try {
      const stored = localStorage.getItem('shankar_admin_coupons');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_COUPONS;
  });
  const [reviews, setReviews] = useState<GuestReview[]>(INITIAL_REVIEWS);
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const stored = localStorage.getItem('shankar_admin_staff');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_STAFF;
  });

  // Settings state
  const [settings, setSettings] = useState({
    isKitchenAcceptingOrders: true,
    estimatedDeliveryMinutes: 25,
    announcementBanner: 'Grand Opening 2026: Fresh Charcoal Tandoor & Royal Desi Ghee Curries Live!',
    minOrderValue: 200,
    deliveryFee: 40,
    freeDeliveryThreshold: 500,
    gstPercent: 5,
  });

  // UI helpers
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderDiningFilter, setOrderDiningFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals inside Admin
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [seatingTableModal, setSeatingTableModal] = useState<DiningTable | null>(null);
  const [walkinGuestName, setWalkinGuestName] = useState('');
  const [walkinPartySize, setWalkinPartySize] = useState('2');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Dish Form State
  const [dishForm, setDishForm] = useState<Partial<MenuItem>>({
    name: '',
    hindiName: '',
    category: 'curries',
    menuSection: 'all_day',
    description: '',
    price: 350,
    halfPrice: 220,
    dietary: 'veg',
    spiceLevel: 1,
    isBestseller: false,
    isChefSpecial: false,
    isAvailable: true,
    prepTimeMinutes: 15,
    image: '/src/assets/images/dish_butter_chicken_curry_1792103747214.webp',
  });

  // Coupon Form State
  const [couponForm, setCouponForm] = useState<Partial<PromoCoupon>>({
    code: '',
    description: '',
    discountPercent: 15,
    discountFlat: 0,
    minOrderValue: 500,
    maxDiscount: 200,
    isActive: true,
  });

  // Staff Form State
  const [staffForm, setStaffForm] = useState<Partial<StaffMember>>({
    name: '',
    role: 'sous_chef',
    station: 'Main Kitchen',
    phone: '+91 98110 00000',
    shiftStatus: 'on_shift',
  });

  // Sync unlock state with user
  useEffect(() => {
    if (isAdminUser(user)) {
      setIsUnlocked(true);
    }
  }, [user]);

  // Notification helper
  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Sync menu & storage
  const saveMenuToStorage = (items: MenuItem[]) => {
    setMenuItems(items);
    try {
      localStorage.setItem('shankar_admin_menu', JSON.stringify(items));
    } catch {}
  };

  const saveTablesToStorage = (tables: DiningTable[]) => {
    setDiningTables(tables);
    try {
      localStorage.setItem('shankar_admin_tables', JSON.stringify(tables));
    } catch {}
  };

  const saveCateringToStorage = (inquiries: CateringInquiry[]) => {
    setCateringInquiries(inquiries);
    try {
      localStorage.setItem('shankar_admin_catering', JSON.stringify(inquiries));
    } catch {}
  };

  const saveCouponsToStorage = (c: PromoCoupon[]) => {
    setCoupons(c);
    try {
      localStorage.setItem('shankar_admin_coupons', JSON.stringify(c));
    } catch {}
  };

  const saveStaffToStorage = (s: StaffMember[]) => {
    setStaff(s);
    try {
      localStorage.setItem('shankar_admin_staff', JSON.stringify(s));
    } catch {}
  };

  // Fetch live orders & reservations
  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Orders
      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          loadOrdersFromLocal();
        }
      } else {
        loadOrdersFromLocal();
      }

      // 2. Fetch Reservations
      const resRes = await fetch('/api/reservations');
      if (resRes.ok) {
        const data = await resRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setReservations(data);
        } else {
          loadReservationsFromLocal();
        }
      } else {
        loadReservationsFromLocal();
      }

      // 3. Fetch Settings
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      }
    } catch {
      loadOrdersFromLocal();
      loadReservationsFromLocal();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadOrdersFromLocal = () => {
    try {
      const raw = localStorage.getItem('shankar_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
          return;
        }
      }
    } catch {}

    // Fallback initial realistic orders
    const initialOrders: Order[] = [
      {
        id: 'ord_sample_9841',
        orderNumber: 'MAH-892401',
        createdAt: '12:45 PM',
        customerName: 'Aditya Verma',
        customerPhone: '+91 98110 54321',
        bookingType: 'delivery',
        deliveryAddress: 'Flat 4B, Barakhamba Towers, Connaught Place, New Delhi',
        items: [
          {
            cartItemId: 'maheswari_paneer_butter_masala_full',
            menuItem: INITIAL_MENU_ITEMS[0],
            quantity: 1,
            portion: 'full',
            spiceLevel: 2,
            unitPrice: 465,
            itemTotal: 465,
          },
          {
            cartItemId: 'royal_dum_biryani_full',
            menuItem: INITIAL_MENU_ITEMS[2] || INITIAL_MENU_ITEMS[0],
            quantity: 2,
            portion: 'full',
            spiceLevel: 2,
            unitPrice: 450,
            itemTotal: 900,
          },
        ],
        subtotal: 1365,
        gstAmount: 68.25,
        deliveryFee: 0,
        discountAmount: 100,
        discountCode: 'ROYAL100',
        grandTotal: 1333.25,
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        orderStatus: 'cooking',
        estimatedDeliveryMinutes: 20,
      },
      {
        id: 'ord_sample_9842',
        orderNumber: 'MAH-892402',
        createdAt: '01:15 PM',
        customerName: 'Rohit K. Verma',
        customerPhone: '+91 98114 77665',
        bookingType: 'dine_in',
        tableNumber: 'Table 4',
        items: [
          {
            cartItemId: 'tandoori_paneer_tikka_full',
            menuItem: INITIAL_MENU_ITEMS[1] || INITIAL_MENU_ITEMS[0],
            quantity: 2,
            portion: 'full',
            spiceLevel: 3,
            unitPrice: 425,
            itemTotal: 850,
          },
        ],
        subtotal: 850,
        gstAmount: 42.5,
        deliveryFee: 0,
        discountAmount: 0,
        grandTotal: 892.5,
        paymentMethod: 'pay_at_counter',
        paymentStatus: 'pending',
        orderStatus: 'placed',
        estimatedDeliveryMinutes: 15,
      },
    ];
    setOrders(initialOrders);
  };

  const loadReservationsFromLocal = () => {
    try {
      const raw = localStorage.getItem('shankar_reservations');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReservations(parsed);
          return;
        }
      }
    } catch {}

    setReservations([
      {
        id: 'res_101',
        bookingNumber: 'RES-4891',
        guestName: 'Vikramaditya Sharma',
        guestPhone: '+91 98110 23456',
        guestEmail: 'vikram.sharma@delhi.in',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '07:30 PM (Dinner)',
        guestsCount: 6,
        seatingArea: 'Maharaja Baithak',
        specialRequests: 'Celebrating father 70th birthday, floral garland requested',
        status: 'confirmed',
        tableNumber: 'Table 7',
        createdAt: '11:20 AM',
      },
      {
        id: 'res_102',
        bookingNumber: 'RES-4892',
        guestName: 'Priya Mehra',
        guestPhone: '+91 98712 99881',
        guestEmail: 'priya.m@tech.com',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '08:00 PM (Dinner)',
        guestsCount: 4,
        seatingArea: 'Royal Courtyard',
        specialRequests: 'Strict Jain food for all guests',
        status: 'seated',
        tableNumber: 'Table 3',
        createdAt: '01:45 PM',
      },
      {
        id: 'res_103',
        bookingNumber: 'RES-4893',
        guestName: 'Anil Kapoor',
        guestPhone: '+91 99100 11223',
        guestEmail: 'kapoor.anil@gmail.com',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeSlot: '01:30 PM (Lunch)',
        guestsCount: 8,
        seatingArea: 'Main Dining Hall',
        specialRequests: 'Maharaja Thali feast booking',
        status: 'confirmed',
        createdAt: '03:10 PM',
      },
    ]);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen, fetchAdminData]);

  // Unlock handlers
  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setIsUnlocked(true);
      setPinError('');
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          isLoggedIn: true,
          role: 'admin',
          name: user.name || 'General Manager',
          email: user.email || 'militarynp280@gmail.com',
        });
      }
      showNotification('✅ Master Console Unlocked: Access Granted');
    } else {
      setPinError('Invalid Passkey. Use Master PIN: 2026 or contact General Manager.');
    }
  };

  const handleInstantUnlockAsOwner = () => {
    setIsUnlocked(true);
    setPinError('');
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        isLoggedIn: true,
        role: 'admin',
        name: 'General Manager (Owner)',
        email: 'militarynp280@gmail.com',
      });
    }
    showNotification('👑 Authenticated as Hotel Owner & General Manager');
  };

  // Status transitions
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: Order['orderStatus']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, orderStatus: nextStatus } : o));
    setOrders(updated);
    try {
      localStorage.setItem('shankar_orders', JSON.stringify(updated));
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {}
    showNotification(`Order #${orderId.slice(-6)} moved to ${nextStatus.toUpperCase().replace('_', ' ')}`);
  };

  const handleUpdateReservationStatus = (resId: string, status: TableBookingDetails['status'], tableNum?: string) => {
    const updated = reservations.map((r) =>
      r.id === resId ? { ...r, status, ...(tableNum ? { tableNumber: tableNum } : {}) } : r
    );
    setReservations(updated);
    try {
      localStorage.setItem('shankar_reservations', JSON.stringify(updated));
      fetch(`/api/reservations/${resId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(() => {});
    } catch {}
    showNotification(`Reservation marked as ${status?.toUpperCase()}`);
  };

  // Menu item CRUD
  const handleToggleDishAvailability = (dishId: string) => {
    const updated = menuItems.map((item) =>
      item.id === dishId ? { ...item, isAvailable: item.isAvailable === false ? true : false } : item
    );
    saveMenuToStorage(updated);
    const dish = updated.find((d) => d.id === dishId);
    showNotification(`${dish?.name} marked as ${dish?.isAvailable ? 'AVAILABLE (IN STOCK)' : 'SOLD OUT (86)'}`);
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.name?.trim() || !dishForm.price) {
      alert('Please provide dish name and price.');
      return;
    }

    if (editingDish) {
      const updated = menuItems.map((item) =>
        item.id === editingDish.id ? ({ ...item, ...dishForm } as MenuItem) : item
      );
      saveMenuToStorage(updated);
      showNotification(`Dish "${dishForm.name}" updated successfully.`);
      setEditingDish(null);
    } else {
      const newDish: MenuItem = {
        id: `dish_${Date.now()}`,
        name: dishForm.name.trim(),
        hindiName: dishForm.hindiName?.trim() || undefined,
        category: dishForm.category || 'curries',
        menuSection: dishForm.menuSection || 'all_day',
        description: dishForm.description?.trim() || 'Prepared with royal organic spices and pure desi ghee.',
        price: Number(dishForm.price),
        halfPrice: dishForm.halfPrice ? Number(dishForm.halfPrice) : undefined,
        dietary: dishForm.dietary || 'veg',
        spiceLevel: (dishForm.spiceLevel as SpiceLevel) || 1,
        isBestseller: !!dishForm.isBestseller,
        isChefSpecial: !!dishForm.isChefSpecial,
        isAvailable: dishForm.isAvailable !== false,
        prepTimeMinutes: Number(dishForm.prepTimeMinutes) || 15,
        rating: 4.9,
        reviewsCount: 12,
        image: dishForm.image || '/src/assets/images/dish_butter_chicken_curry_1792103747214.webp',
      };
      saveMenuToStorage([newDish, ...menuItems]);
      showNotification(`New dish "${newDish.name}" added to live menu.`);
      setIsAddDishOpen(false);
    }
  };

  const handleDeleteDish = (dishId: string) => {
    if (!confirm('Are you sure you want to remove this dish from the menu?')) return;
    const updated = menuItems.filter((item) => item.id !== dishId);
    saveMenuToStorage(updated);
    showNotification('Dish removed from menu.');
  };

  // Table management
  const handleUpdateTableStatus = (tableId: string, status: DiningTable['status'], guestName?: string) => {
    const updated = diningTables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            status,
            currentGuestName: status === 'available' ? undefined : guestName || t.currentGuestName,
            occupiedSince: status === 'available' ? undefined : 'Just now',
          }
        : t
    );
    saveTablesToStorage(updated);
    showNotification(`Table status updated to ${status.toUpperCase()}`);
    setSeatingTableModal(null);
  };

  // Catering inquiry status
  const handleUpdateCateringStatus = (inquiryId: string, status: CateringInquiry['status'], quote?: number) => {
    const updated = cateringInquiries.map((c) =>
      c.id === inquiryId ? { ...c, status, ...(quote ? { quotedAmount: quote } : {}) } : c
    );
    saveCateringToStorage(updated);
    showNotification(`Catering lead updated to ${(status || '').toUpperCase()}`);
  };

  // Coupon management
  const handleToggleCoupon = (couponId: string) => {
    const updated = coupons.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c));
    saveCouponsToStorage(updated);
    showNotification('Coupon status updated.');
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code?.trim()) return;
    const newCoupon: PromoCoupon = {
      id: `c_${Date.now()}`,
      code: couponForm.code.trim().toUpperCase(),
      description: couponForm.description || `${couponForm.discountPercent}% Off`,
      discountPercent: couponForm.discountPercent ? Number(couponForm.discountPercent) : undefined,
      discountFlat: couponForm.discountFlat ? Number(couponForm.discountFlat) : undefined,
      minOrderValue: Number(couponForm.minOrderValue) || 400,
      maxDiscount: Number(couponForm.maxDiscount) || 200,
      isActive: true,
    };
    saveCouponsToStorage([newCoupon, ...coupons]);
    showNotification(`Coupon ${newCoupon.code} created.`);
    setIsAddCouponOpen(false);
    setCouponForm({ code: '', description: '', discountPercent: 15, minOrderValue: 500 });
  };

  // Staff management
  const handleToggleStaffShift = (staffId: string) => {
    const updated = staff.map((s) =>
      s.id === staffId ? { ...s, shiftStatus: s.shiftStatus === 'on_shift' ? 'off_duty' : 'on_shift' } as StaffMember : s
    );
    saveStaffToStorage(updated);
    showNotification('Staff shift updated.');
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name?.trim()) return;
    const newStaff: StaffMember = {
      id: `staff_${Date.now()}`,
      name: staffForm.name.trim(),
      role: staffForm.role || 'sous_chef',
      station: staffForm.station || 'Main Kitchen',
      phone: staffForm.phone || '+91 98110 00000',
      shiftStatus: 'on_shift',
      joinedDate: 'Oct 2026',
    };
    saveStaffToStorage([...staff, newStaff]);
    showNotification(`Staff member ${newStaff.name} added to roster.`);
    setIsAddStaffOpen(false);
    setStaffForm({ name: '', role: 'sous_chef', station: 'Main Kitchen', phone: '+91 98110 00000' });
  };

  // Review reply
  const handleSaveReviewReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, adminReply: replyText.trim() } : r));
    setReviews(updated);
    setReplyingReviewId(null);
    setReplyText('');
    showNotification('Reply published to public reviews.');
  };

  // Save Settings
  const handleSaveSettings = async () => {
    try {
      localStorage.setItem('shankar_admin_settings', JSON.stringify(settings));
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      showNotification('Kitchen & Operations settings updated successfully!');
    } catch {
      showNotification('Settings saved locally.');
    }
  };

  // Analytics
  const analytics: AnalyticsData = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);
    const pendingOrders = orders.filter((o) => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled').length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'completed').length;
    const totalReservations = reservations.length;
    const confirmedReservations = reservations.filter((r) => r.status === 'confirmed' || r.status === 'seated').length;
    const totalCustomers = new Set(orders.map((o) => o.customerPhone || o.customerName)).size || 18;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 620;

    return {
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
      pendingOrders,
      completedOrders,
      totalReservations,
      confirmedReservations,
      totalCustomers,
      avgOrderValue,
    };
  }, [orders, reservations]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus =
        orderStatusFilter === 'all'
          ? true
          : orderStatusFilter === 'active'
          ? o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
          : o.orderStatus === orderStatusFilter;

      const matchesDining = orderDiningFilter === 'all' ? true : o.bookingType === orderDiningFilter;

      const matchesSearch =
        orderSearch.trim() === '' ||
        (o.customerName && o.customerName.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.customerPhone && o.customerPhone.includes(orderSearch)) ||
        (o.tableNumber && o.tableNumber.toLowerCase().includes(orderSearch.toLowerCase()));

      return matchesStatus && matchesDining && matchesSearch;
    });
  }, [orders, orderStatusFilter, orderDiningFilter, orderSearch]);

  // Filtered menu
  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat = menuCategoryFilter === 'all' ? true : item.category === menuCategoryFilter;
      const matchesSearch =
        menuSearch.trim() === '' ||
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        (item.hindiName && item.hindiName.includes(menuSearch));
      return matchesCat && matchesSearch;
    });
  }, [menuItems, menuCategoryFilter, menuSearch]);

  if (!isOpen) return null;

  // If user is not yet unlocked, render Master Security & Passkey Gate
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/95 backdrop-blur-md font-sans-body">
        <div className="max-w-md w-full bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-stone-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <PalaceLogo size="lg" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                Maheswari Multi Cuisine Restaurant & Hotel
              </span>
              <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-white mt-1">
                Executive Operations Gate
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Authorized restaurant management console. Grand Opening 2026 live control room.
              </p>
            </div>
          </div>

          <form onSubmit={handlePinUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-300 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Enter Admin Master PIN / Passkey:</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter PIN (e.g. 2026)"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-center text-lg font-mono tracking-widest text-white placeholder-stone-600 focus:outline-hidden focus:border-amber-400"
                  autoFocus
                />
              </div>
              {pinError && (
                <p className="text-[11px] text-rose-400 font-medium">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Unlock Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Quick Owner Authentication:</span>
              <span className="font-mono text-amber-400/90 text-[11px]">PIN: 2026</span>
            </div>

            <button
              type="button"
              onClick={handleInstantUnlockAsOwner}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>1-Click Launch as General Manager (militarynp280@gmail.com)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 md:p-4 bg-stone-950/95 backdrop-blur-md animate-fadeIn overflow-hidden font-sans-body">
      <div className="relative w-full max-w-7xl h-full sm:h-[95vh] bg-stone-900 border-0 sm:border sm:border-stone-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden text-stone-100 flex flex-col">
        
        {/* ========================================================================= */}
        {/* TOP HEADER STRIP - Mobile Optimized */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-stone-950 border-b border-stone-800 shrink-0 gap-2">
          {/* Top Left: Logo & Wordmark (Only MAHESWARI MULTI CUISINE) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <PalaceLogo size="responsive" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm md:text-base font-serif-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-400 truncate">
                  MAHESWARI MULTI CUISINE
                </span>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    settings.isKitchenAcceptingOrders ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                  title={settings.isKitchenAcceptingOrders ? 'Kitchen LIVE & Online' : 'Kitchen Temporarily Paused'}
                />
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-400 font-mono truncate">
                Operations & Admin Console
              </div>
            </div>
          </div>

          {/* Quick Actions (Language Switcher, Refresh, Close) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switcher Button (Hindi / English) */}
            <button
              type="button"
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              className="px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer bg-stone-800 hover:bg-stone-700 text-amber-300 border-amber-500/30 flex items-center gap-1.5 shrink-0"
              title={lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
            >
              <span className="text-sm">🇮🇳</span>
              <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchAdminData}
              disabled={isLoading}
              className="p-1.5 sm:p-2 text-stone-400 hover:text-amber-400 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              title={lang === 'hi' ? 'डेटा रीफ्रेश करें' : 'Refresh live data'}
              aria-label="Refresh live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              title={lang === 'hi' ? 'बंद करें' : 'Close Admin Console'}
              aria-label="Close Admin Console"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Inter-Department Live Notification: When Kitchen completes cooking a Dine-in order */}
        {orders.some((o) => (o.orderStatus as string) === 'ready_at_table' || (o.bookingType === 'dine_in' && o.orderStatus === 'out_for_delivery')) && (
          <div className="bg-amber-400 text-stone-950 px-4 py-2 flex items-center justify-between font-bold text-xs shadow-md shrink-0 border-b border-amber-500">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-base shrink-0">🛎️</span>
              <span className="whitespace-nowrap">
                {lang === 'hi'
                  ? 'रसोई से खाना तैयार है! वेटर कृपया टेबल पर परोसें:'
                  : 'Food ready from kitchen! Server please deliver to table:'}
              </span>
              <span className="font-mono bg-stone-950 text-amber-300 px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap">
                {orders
                  .filter((o) => (o.orderStatus as string) === 'ready_at_table' || (o.bookingType === 'dine_in' && o.orderStatus === 'out_for_delivery'))
                  .map((o) => `${o.tableNumber || 'Table'} (#${o.orderNumber})`)
                  .join(', ')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const readyOrder = orders.find(
                  (o) => (o.orderStatus as string) === 'ready_at_table' || (o.bookingType === 'dine_in' && o.orderStatus === 'out_for_delivery')
                );
                if (readyOrder) {
                  handleUpdateOrderStatus(readyOrder.id, 'completed');
                  showNotification(
                    lang === 'hi'
                      ? `टेबल ${readyOrder.tableNumber || ''} पर खाना परोस दिया गया!`
                      : `Order #${readyOrder.orderNumber} served to table!`
                  );
                }
              }}
              className="ml-2 px-3 py-1 bg-stone-950 hover:bg-stone-900 text-amber-300 text-[11px] rounded-lg transition-colors cursor-pointer shrink-0 font-bold"
            >
              {lang === 'hi' ? '✅ टेबल पर परोस दिया' : '✅ Mark Served'}
            </button>
          </div>
        )}

        {/* Success / Alert Banner */}
        {actionSuccess && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between font-medium animate-fadeIn shrink-0">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </span>
            <button onClick={() => setActionSuccess(null)} className="text-white hover:text-emerald-200 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SINGLE STEP BACK ARROW BAR (For More Sections: Sales, Staff, Offers, Catering, Reviews, Settings) */}
        {/* ========================================================================= */}
        {['analytics', 'staff', 'coupons', 'catering', 'reviews', 'settings'].includes(activeTab) && (
          <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 bg-stone-950/95 border-b border-stone-800 shrink-0 animate-fadeIn">
            <button
              type="button"
              onClick={() => {
                // Single step back: reopen More Operations prompt
                setIsMoreMenuOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 group"
              title={lang === 'hi' ? 'अन्य विकल्पों पर एक कदम वापस जाएं' : 'Go one step back to More Options'}
            >
              <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
              <span>{lang === 'hi' ? 'वापस (Back to More)' : 'Back to More Options'}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 font-mono">
                {activeTab === 'analytics' && (lang === 'hi' ? '📊 बिक्री रिपोर्ट' : '📊 Sales & Reports')}
                {activeTab === 'staff' && (lang === 'hi' ? '👥 स्टाफ ड्यूटी' : '👥 Staffs Duty')}
                {activeTab === 'coupons' && (lang === 'hi' ? '🏷️ ऑफर एडिट्स' : '🏷️ Offer Edits')}
                {activeTab === 'catering' && (lang === 'hi' ? '🎉 पार्टी व कैटरिंग' : '🎉 Party & Catering')}
                {activeTab === 'reviews' && (lang === 'hi' ? '⭐ ग्राहकों की राय' : '⭐ Guest Reviews')}
                {activeTab === 'settings' && (lang === 'hi' ? '⚙️ सेटिंग्स' : '⚙️ Settings')}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab(previousTab)}
                className="px-2.5 py-1 rounded-lg text-stone-400 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[11px] font-medium transition-colors cursor-pointer"
                title="Return to primary view"
              >
                {lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN MODULE CONTENT */}
        {/* ========================================================================= */}
        <div className="overflow-y-auto flex-1 p-2.5 sm:p-6 space-y-4 sm:space-y-6 pb-24 overscroll-contain">
          {/* TAB 1: KITCHEN DISPLAY SYSTEM & LIVE ORDER PIPELINE */}
          {activeTab === 'kds' && (
            <div className="space-y-4">
              {/* Controls bar: search and status filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', labelHi: 'सभी (All)', labelEn: 'All Orders' },
                    { id: 'active', labelHi: '🔥 चालू ऑर्डर (Active)', labelEn: '🔥 Active Orders' },
                    { id: 'placed', labelHi: 'नया (New)', labelEn: 'New Placed' },
                    { id: 'confirmed', labelHi: 'स्वीकृत (Accepted)', labelEn: 'Confirmed' },
                    { id: 'cooking', labelHi: 'रसोई में (Cooking)', labelEn: 'In Kitchen' },
                    { id: 'out_for_delivery', labelHi: 'तैयार / डिस्पैच', labelEn: 'Ready / Dispatched' },
                    { id: 'completed', labelHi: 'पूरा हुआ (Done)', labelEn: 'Completed' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setOrderStatusFilter(f.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        orderStatusFilter === f.id
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                          : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 border border-stone-700/60'
                      }`}
                    >
                      {lang === 'hi' ? f.labelHi : f.labelEn}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={orderDiningFilter}
                    onChange={(e) => setOrderDiningFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-300 focus:outline-hidden cursor-pointer"
                  >
                    <option value="all">{lang === 'hi' ? 'सभी प्रकार (All Modes)' : 'All Modes'}</option>
                    <option value="dine_in">{lang === 'hi' ? '🍽️ टेबल डाइन-इन' : '🍽️ Dine-in'}</option>
                    <option value="delivery">{lang === 'hi' ? '🛵 होम डिलीवरी' : '🛵 Delivery'}</option>
                    <option value="takeaway">{lang === 'hi' ? '🛍️ पार्सल / टेकअवे' : '🛍️ Takeaway'}</option>
                  </select>

                  <div className="relative w-48 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={lang === 'hi' ? 'ऑर्डर नं., ग्राहक, फोन खोजें...' : 'Search order, guest, phone...'}
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Order Cards Grid */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-stone-950/60 rounded-2xl border border-stone-800 p-8 space-y-3">
                  <UtensilsCrossed className="w-10 h-10 text-stone-600 mx-auto" />
                  <p className="text-sm font-semibold text-stone-300">
                    {lang === 'hi' ? 'कोई सक्रिय ऑर्डर नहीं है।' : 'No orders matching criteria.'}
                  </p>
                  <p className="text-xs text-stone-500">
                    {lang === 'hi'
                      ? 'ग्राहकों या डाइनिंग टेबल से आने वाले नए ऑर्डर यहाँ अपने आप दिखेंगे।'
                      : 'Live incoming orders from dining tables, counter, or online will appear here in real-time.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {filteredOrders.map((order) => {
                    let parsedItems: CartItem[] = [];
                    try {
                      parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
                    } catch {
                      parsedItems = [];
                    }

                    const isPlaced = order.orderStatus === 'placed';
                    const isConfirmed = order.orderStatus === 'confirmed';
                    const isCooking = order.orderStatus === 'cooking';
                    const isOut = order.orderStatus === 'out_for_delivery';
                    const isCompleted = order.orderStatus === 'completed';
                    const isCancelled = order.orderStatus === 'cancelled';

                    return (
                      <div
                        key={order.id}
                        className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between space-y-3 transition-all ${
                          isCooking
                            ? 'bg-amber-950/20 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                            : isPlaced
                            ? 'bg-rose-950/20 border-rose-500/50 shadow-sm animate-pulse ring-1 ring-rose-500/20'
                            : isCompleted
                            ? 'bg-stone-950 border-stone-800/80 opacity-80'
                            : 'bg-stone-950 border-stone-800'
                        }`}
                      >
                        {/* Header */}
                        <div>
                          <div className="flex items-start justify-between pb-2 border-b border-stone-800 gap-1">
                            <div className="min-w-0">
                              <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 block truncate">
                                #{order.orderNumber || order.id.slice(-6)}
                              </span>
                              <div className="text-[10px] text-stone-400 font-mono flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-stone-500" />
                                <span>{order.createdAt}</span>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono shrink-0 ${
                                isPlaced
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : isCooking
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : isOut
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                  : isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-stone-800 text-stone-300'
                              }`}
                            >
                              {order.orderStatus.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Customer Details */}
                          <div className="pt-2 text-xs space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-stone-100 truncate pr-1">
                                {order.customerName || order.customer?.name || 'Walk-in Guest'}
                              </span>
                              {(order.customerPhone || order.customer?.phone) ? (
                                <a
                                  href={`tel:${order.customerPhone || order.customer?.phone}`}
                                  className="text-[11px] font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1 shrink-0 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800"
                                  title="Call Guest directly from phone"
                                >
                                  <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>{order.customerPhone || order.customer?.phone}</span>
                                </a>
                              ) : (
                                <span className="text-[10.5px] font-mono text-stone-400 shrink-0">—</span>
                              )}
                            </div>
                            <div className="text-[11px] text-amber-300 font-medium">
                              Mode: <span className="uppercase font-bold">{order.bookingType}</span>
                              {order.tableNumber && ` · T-${order.tableNumber}`}
                            </div>
                            {order.deliveryAddress && (
                              <p className="text-[10px] text-stone-400 line-clamp-1">
                                📍 {order.deliveryAddress}
                              </p>
                            )}
                            {order.notes && (
                              <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[10px] text-amber-200 line-clamp-1">
                                📝 Note: {order.notes}
                              </div>
                            )}
                          </div>

                          {/* Ordered Dishes - Daraz-Style Multi-Box Grid */}
                          <div className="mt-3 pt-2 border-t border-stone-800 space-y-2">
                            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block font-mono">
                              Dishes in Ticket ({parsedItems.length})
                            </span>

                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                              {parsedItems.map((item, idx) => {
                                const itemImg =
                                  item.menuItem?.image ||
                                  '/src/assets/images/dish_butter_chicken_curry_1792103747214.webp';

                                return (
                                  <div
                                    key={idx}
                                    className="p-1.5 rounded-xl border border-stone-800 bg-stone-900/90 flex flex-col justify-between space-y-1"
                                  >
                                    <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden bg-stone-800">
                                      <img
                                        src={itemImg}
                                        alt={item.menuItem?.name || 'Dish'}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-stone-950/90 text-amber-300 font-mono font-bold text-[9px]">
                                        {item.quantity || 1}x
                                      </span>
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-[11px] font-bold text-stone-200 truncate">
                                        {item.menuItem?.name || (item as any).name || 'Dish'}
                                      </div>
                                      {item.portion === 'half' && (
                                        <span className="text-[9px] text-amber-400 block font-mono">Half Portion</span>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-stone-800/80 font-mono">
                                      <span className="text-stone-400">₹{item.unitPrice || 0}</span>
                                      <span className="text-amber-300 font-bold">
                                        ₹{item.itemTotal || (item.unitPrice || 0) * (item.quantity || 1)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Order Total & Next Action Buttons */}
                        <div className="pt-2.5 border-t border-stone-800 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono font-bold">
                            <span className="text-stone-400 uppercase text-[10.5px]">
                              {order.paymentMethod} · {order.paymentStatus}
                            </span>
                            <span className="text-amber-400 text-sm">₹{order.grandTotal}</span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setPrintingOrder(order)}
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                              title="Print KOT / Bill Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {isPlaced && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-400 text-stone-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                {lang === 'hi' ? 'स्वीकारें व रसोई भेजें 👨‍🍳' : 'Accept & Send to Kitchen 👨‍🍳'}
                              </button>
                            )}

                            {isConfirmed && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, 'cooking')}
                                className="flex-1 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                {lang === 'hi' ? 'पकाना शुरू करें 🔥' : 'Start Cooking 🔥'}
                              </button>
                            )}

                            {isCooking && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateOrderStatus(order.id, 'out_for_delivery');
                                  if (order.bookingType === 'dine_in') {
                                    showNotification(lang === 'hi' ? `टेबल ${order.tableNumber || ''} का खाना तैयार है! वेटर को सूचित किया गया।` : `Table ${order.tableNumber || ''} food is ready! Floor staff alerted.`);
                                  }
                                }}
                                className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                {order.bookingType === 'dine_in'
                                  ? (lang === 'hi' ? 'खाना तैयार है (वेटर को बुलाएं) 🍽️' : 'Food Ready for Table 🍽️')
                                  : (lang === 'hi' ? 'डिलीवरी के लिए रवाना करें 🛵' : 'Ready / Out for Delivery 🛵')}
                              </button>
                            )}

                            {isOut && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                {lang === 'hi' ? 'पूरा हुआ (परोस दिया गया) ✅' : 'Complete / Served ✅'}
                              </button>
                            )}

                            {isCompleted && (
                              <span className="text-[10px] text-emerald-400 font-mono text-center flex-1 py-1">
                                {lang === 'hi' ? 'ऑर्डर पूरा हो चुका है' : 'Order Fulfilled'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MENU & DISH INVENTORY (LIVE 86 OUT-OF-STOCK CONTROL) */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All Dishes' },
                    { id: 'curries', label: 'Curries' },
                    { id: 'tandoor', label: 'Tandoor' },
                    { id: 'biryani', label: 'Biryani' },
                    { id: 'thali', label: 'Thalis' },
                    { id: 'breads', label: 'Breads' },
                    { id: 'desserts', label: 'Desserts' },
                    { id: 'beverages', label: 'Beverages' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setMenuCategoryFilter(cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        menuCategoryFilter === cat.id
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                          : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 border border-stone-700/60'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-48 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search dish name..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingDish(null);
                      setDishForm({
                        name: '',
                        hindiName: '',
                        category: 'curries',
                        menuSection: 'all_day',
                        description: '',
                        price: 350,
                        halfPrice: 220,
                        dietary: 'veg',
                        spiceLevel: 1,
                        isBestseller: false,
                        isChefSpecial: false,
                        isAvailable: true,
                        prepTimeMinutes: 15,
                        image: '/src/assets/images/dish_butter_chicken_curry_1792103747214.webp',
                      });
                      setIsAddDishOpen(true);
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Dish</span>
                  </button>
                </div>
              </div>

              {/* Menu items table / grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredMenu.map((dish) => {
                  const isAvailable = dish.isAvailable !== false;

                  return (
                    <div
                      key={dish.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                        isAvailable
                          ? 'bg-stone-950 border-stone-800'
                          : 'bg-stone-950/60 border-rose-900/40 opacity-75'
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-800"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-white truncate" title={dish.name}>
                              {dish.name}
                            </h4>
                          </div>
                          {dish.hindiName && (
                            <span className="text-[10px] text-stone-400 font-hindi block truncate">
                              {dish.hindiName}
                            </span>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono font-bold text-amber-400">
                              ₹{dish.price}
                            </span>
                            {dish.halfPrice && (
                              <span className="text-[10px] font-mono text-stone-400">
                                Half: ₹{dish.halfPrice}
                              </span>
                            )}
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 font-mono">
                              {dish.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stock toggle and actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                        <button
                          type="button"
                          onClick={() => handleToggleDishAvailability(dish.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isAvailable
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isAvailable ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          <span>{isAvailable ? 'In Stock (Live)' : 'Sold Out (86)'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDish(dish);
                              setDishForm(dish);
                              setIsAddDishOpen(true);
                            }}
                            className="p-1.5 text-stone-400 hover:text-amber-300 rounded hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Edit Dish"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDish(dish.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-400 rounded hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Remove Dish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FLOOR & TABLE MANAGEMENT (REAL-TIME SEATING) */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
                <div>
                  <h3 className="text-sm font-serif-display font-bold text-white">
                    {lang === 'hi' ? 'हॉल और डाइनिंग टेबल प्रबंधन' : 'Dining Floors & VIP Tables'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {lang === 'hi'
                      ? 'टेबल ऑक्यूपेंसी, वेटर सीटिंग और रसोई ऑर्डर समन्वय'
                      : 'Live table occupancy, guest walk-in seating, and turnaround management.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-mono">
                    {lang === 'hi' ? 'भरी टेबलें:' : 'Occupancy:'}{' '}
                    <strong className="text-amber-400">
                      {diningTables.filter((t) => t.status === 'occupied').length} / {diningTables.length}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {diningTables.map((table) => {
                  const isAvailable = table.status === 'available';
                  const isOccupied = table.status === 'occupied';
                  const isReserved = table.status === 'reserved';
                  const isCleaning = table.status === 'cleaning';

                  return (
                    <div
                      key={table.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isAvailable
                          ? 'bg-stone-950 border-emerald-500/30'
                          : isOccupied
                          ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                          : isReserved
                          ? 'bg-blue-950/20 border-blue-500/40'
                          : 'bg-stone-950 border-stone-800 opacity-70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-white">
                            {table.tableNumber}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase font-mono ${
                              isAvailable
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : isOccupied
                                ? 'bg-amber-500/20 text-amber-300'
                                : isReserved
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {lang === 'hi'
                              ? isAvailable
                                ? 'खाली'
                                : isOccupied
                                ? 'भरा'
                                : isReserved
                                ? 'आरक्षित'
                                : 'सफाई'
                              : table.status}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-stone-400 font-medium mt-1">
                          {table.area} · {table.capacity} {lang === 'hi' ? 'सीटर' : 'Seater'}
                        </div>
                        {table.currentGuestName && (
                          <div className="mt-2 p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-amber-200">
                            {lang === 'hi' ? 'ग्राहक:' : 'Guest:'} <strong className="text-white">{table.currentGuestName}</strong>
                            {table.occupiedSince && (
                              <span className="block text-[9.5px] text-stone-400 font-mono mt-0.5">
                                {table.occupiedSince}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quick seating and department actions */}
                      <div className="pt-2 border-t border-stone-800/80 flex items-center gap-1.5">
                        {isAvailable && (
                          <button
                            type="button"
                            onClick={() => {
                              setSeatingTableModal(table);
                              setWalkinGuestName('');
                              setWalkinPartySize(String(table.capacity));
                            }}
                            className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            {lang === 'hi' ? 'ग्राहक बैठाएं (Seat)' : 'Seat Walk-in Guest'}
                          </button>
                        )}
                        {isOccupied && (
                          <div className="flex items-center gap-1 w-full">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('kds');
                                setOrderSearch(table.tableNumber);
                              }}
                              className="px-2 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                              title={lang === 'hi' ? 'रसोई का स्टेटस देखें' : 'View Kitchen Status'}
                            >
                              {lang === 'hi' ? '👨‍🍳 रसोई' : '👨‍🍳 Kitchen'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTableStatus(table.id, 'available')}
                              className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              {lang === 'hi' ? 'खाली करें (Settle)' : 'Vacate'}
                            </button>
                          </div>
                        )}
                        {isCleaning && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTableStatus(table.id, 'available')}
                            className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            {lang === 'hi' ? 'सफाई पूरी - तैयार (Ready)' : 'Mark Ready & Clean'}
                          </button>
                        )}
                        {isReserved && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTableStatus(table.id, 'occupied', table.currentGuestName)}
                            className="w-full py-1.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            {lang === 'hi' ? 'मेहमान आ गए - बैठाएं' : 'Guest Arrived: Seat'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TABLE RESERVATIONS */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
                <div>
                  <h3 className="text-sm font-serif-display font-bold text-white">
                    Guest Table Reservations
                  </h3>
                  <p className="text-xs text-stone-400">
                    Advance dining bookings across Courtyard, Main Hall, and Baithaks.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-2xl border border-stone-800 bg-stone-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          #{res.bookingNumber || res.id}
                        </span>
                        <span className="font-bold text-white text-sm">
                          {res.guestName}
                        </span>
                        <a
                          href={`tel:${res.guestPhone}`}
                          className="text-xs font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800"
                          title="Call Guest directly from phone"
                        >
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>{res.guestPhone}</span>
                        </a>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          {res.status}
                        </span>
                      </div>
                      <div className="text-xs text-stone-300 flex items-center gap-3 flex-wrap">
                        <span>📅 {res.date}</span>
                        <span>⏰ {res.timeSlot}</span>
                        <span>👥 {res.guestsCount} Guests</span>
                        <span>🏛️ {res.seatingArea}</span>
                        {res.tableNumber && (
                          <span className="text-amber-400 font-bold font-mono">
                            Assigned: {res.tableNumber}
                          </span>
                        )}
                      </div>
                      {res.specialRequests && (
                        <p className="text-[11px] text-amber-200/90 italic">
                          Special Request: "{res.specialRequests}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {res.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateReservationStatus(res.id!, 'seated', 'Table 7')}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          {lang === 'hi' ? 'मेहमान बैठाएं (Seat)' : 'Seat Guests'}
                        </button>
                      )}
                      {res.status === 'seated' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateReservationStatus(res.id!, 'completed')}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          {lang === 'hi' ? 'भोजन पूरा (Complete)' : 'Complete Dining'}
                        </button>
                      )}
                      {res.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateReservationStatus(res.id!, 'cancelled')}
                          className="px-2.5 py-1.5 text-stone-400 hover:text-rose-400 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ROYAL CATERING & BANQUET LEADS */}
          {activeTab === 'catering' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-serif-display font-bold text-white">
                    Royal Banquet & Catering Inquiries
                  </h3>
                  <p className="text-xs text-stone-400">
                    Inquiries for weddings, corporate galas, and silver jubilee celebrations.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {cateringInquiries.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl border border-stone-800 bg-stone-950 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                          {cat.eventType}
                        </span>
                        <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {cat.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-stone-500 block text-[10px]">Contact</span>
                        <a
                          href={`tel:${cat.phone}`}
                          className="text-amber-300 hover:text-amber-200 font-mono flex items-center gap-1"
                          title="Call inquirer"
                        >
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>{cat.phone}</span>
                        </a>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Event Date</span>
                        <span className="text-stone-200">{cat.eventDate}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Guest Count</span>
                        <span className="text-stone-200">{cat.guestCount} Guests</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Budget</span>
                        <span className="text-amber-300 font-mono">{cat.budgetRange}</span>
                      </div>
                    </div>

                    {cat.specialRequirements && (
                      <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300">
                        <strong className="text-amber-400">Requirements:</strong> {cat.specialRequirements}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-stone-500 text-[11px] font-mono">Received: {cat.createdAt}</span>
                      <div className="flex items-center gap-2">
                        {cat.status === 'new' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateCateringStatus(cat.id || '', 'quoted', 350000)}
                            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            {lang === 'hi' ? 'कोटेशन भेजें (₹3.5L)' : 'Send Quote (₹3.5L)'}
                          </button>
                        )}
                        {cat.status === 'quoted' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateCateringStatus(cat.id || '', 'confirmed')}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            {lang === 'hi' ? 'बुकिंग पक्की करें ✅' : 'Confirm Booking ✅'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PROMO COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-serif-display font-bold text-white">
                    Promo Discounts & Loyalty Codes
                  </h3>
                  <p className="text-xs text-stone-400">
                    Active discount coupons applied by online diners during checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(true)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'नया ऑफर कूपन बनाएं' : 'Create Coupon'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                      c.isActive ? 'bg-stone-950 border-stone-800' : 'bg-stone-950/60 border-stone-900 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                          {c.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(c.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            c.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {c.isActive ? (lang === 'hi' ? 'सक्रिय' : 'Active') : (lang === 'hi' ? 'बंद' : 'Inactive')}
                        </button>
                      </div>
                      <p className="text-xs text-stone-200 mt-2 font-medium">{c.description}</p>
                      <div className="text-[11px] text-stone-400 font-mono mt-1">
                        Min Order: ₹{c.minOrderValue}
                        {c.maxDiscount ? ` · Max Discount: ₹${c.maxDiscount}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: STAFF ROSTER & SHIFT MANAGEMENT */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-serif-display font-bold text-white">
                    {lang === 'hi' ? 'रसोई और हॉल कर्मचारी रोस्टर' : 'Master Culinary & Service Crew'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {lang === 'hi'
                      ? 'रसोई उस्ताद, फ्लोर कैप्टन, कैशियर और डिलीवरी राइडर'
                      : 'Kitchen ustads, floor captains, cashiers, and express delivery riders.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(true)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'कर्मचारी जोड़ें' : 'Add Crew Member'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {staff.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl border border-stone-800 bg-stone-950 flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{s.name}</h4>
                        <button
                          type="button"
                          onClick={() => handleToggleStaffShift(s.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono transition-colors cursor-pointer ${
                            s.shiftStatus === 'on_shift'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {s.shiftStatus === 'on_shift'
                            ? (lang === 'hi' ? 'ड्यूटी पर (On Shift)' : 'On Shift')
                            : (lang === 'hi' ? 'छुट्टी (Off Duty)' : 'Off Duty')}
                        </button>
                      </div>
                      <div className="text-[11px] text-amber-300 font-medium mt-1 uppercase">
                        {s.role.replace('_', ' ')} · {s.station}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                        📞 {s.phone} · Since {s.joinedDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: FINANCIAL ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-serif-display font-bold text-white">
                    Operational Financial Analytics
                  </h3>
                  <p className="text-xs text-stone-400">
                    Live gross sales, average order value, and ticket fulfillment rate.
                  </p>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl border border-stone-800 bg-stone-950 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">
                    Today's Gross Sales
                  </span>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-amber-400">
                    ₹{analytics.totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">+18% vs yesterday</span>
                </div>

                <div className="p-4 rounded-2xl border border-stone-800 bg-stone-950 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">
                    Total Orders Placed
                  </span>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-white">
                    {analytics.totalOrders}
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono">
                    {analytics.pendingOrders} in active kitchen
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-stone-800 bg-stone-950 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">
                    Average Ticket (AOV)
                  </span>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-amber-400">
                    ₹{analytics.avgOrderValue}
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">Per customer order</span>
                </div>

                <div className="p-4 rounded-2xl border border-stone-800 bg-stone-950 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">
                    Table Reservations
                  </span>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-white">
                    {analytics.totalReservations}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {analytics.confirmedReservations} confirmed
                  </span>
                </div>
              </div>

              {/* Order breakdown */}
              <div className="p-4 rounded-2xl border border-stone-800 bg-stone-950 space-y-3">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Revenue Channels Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                    <span className="text-[11px] text-stone-400 block">🛵 Delivery Orders</span>
                    <span className="text-base font-bold text-amber-300 font-mono">
                      ₹{Math.round(analytics.totalRevenue * 0.65).toLocaleString('en-IN')} (65%)
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                    <span className="text-[11px] text-stone-400 block">🍽️ Dine-in Baithaks</span>
                    <span className="text-base font-bold text-amber-300 font-mono">
                      ₹{Math.round(analytics.totalRevenue * 0.28).toLocaleString('en-IN')} (28%)
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                    <span className="text-[11px] text-stone-400 block">🛍️ Takeaway Pickups</span>
                    <span className="text-base font-bold text-amber-300 font-mono">
                      ₹{Math.round(analytics.totalRevenue * 0.07).toLocaleString('en-IN')} (7%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: GUEST REVIEWS & FEEDBACK */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-serif-display font-bold text-white">
                    Guest Reviews & Ratings
                  </h3>
                  <p className="text-xs text-stone-400">
                    Public feedback from diners and verified order patrons.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl border border-stone-800 bg-stone-950 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{rev.guestName}</span>
                        {rev.verifiedDining && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono">
                            Verified Dining
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-amber-400 text-xs">
                        {'★'.repeat(rev.rating)}
                        <span className="text-stone-500 text-[10px] ml-1.5 font-mono">{rev.date}</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-300">"{rev.comment}"</p>
                    {rev.dishRecommended && (
                      <div className="text-[11px] text-amber-300 font-mono">
                        Recommended: {rev.dishRecommended}
                      </div>
                    )}

                    {rev.adminReply ? (
                      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs space-y-1">
                        <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                          Official Hotel Response:
                        </span>
                        <p className="text-stone-200">{rev.adminReply}</p>
                      </div>
                    ) : (
                      <div className="pt-1">
                        {replyingReviewId === rev.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a gracious response from the General Manager..."
                              className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-400"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyingReviewId(null)}
                                className="px-3 py-1 bg-stone-800 text-stone-300 rounded-lg text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveReviewReply(rev.id)}
                                className="px-3 py-1 bg-amber-400 text-stone-950 font-bold rounded-lg text-xs"
                              >
                                Post Reply
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingReviewId(rev.id);
                              setReplyText('');
                            }}
                            className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                          >
                            + Reply to Guest
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: KITCHEN CONTROLS & OPERATIONS SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-serif-display font-bold text-white">
                    Operations & Kitchen Configuration
                  </h3>
                  <p className="text-xs text-stone-400">
                    Live switches for order intake, estimated prep times, and fees.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-stone-800 bg-stone-950 space-y-4">
                {/* Kitchen online toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Kitchen Acceptance Status
                    </span>
                    <span className="text-[11px] text-stone-400">
                      When turned off, customers will be informed the kitchen is at peak capacity.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        isKitchenAcceptingOrders: !prev.isKitchenAcceptingOrders,
                      }))
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      settings.isKitchenAcceptingOrders
                        ? 'bg-emerald-500 text-stone-950'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {settings.isKitchenAcceptingOrders
                      ? (lang === 'hi' ? 'ऑर्डर चालू है' : 'Accepting Orders')
                      : (lang === 'hi' ? 'रोक दिया गया' : 'Paused')}
                  </button>
                </div>

                {/* Estimated delivery time */}
                <div className="space-y-1.5 pb-3 border-b border-stone-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      {lang === 'hi' ? 'अनुमानित तैयारी व डिलीवरी समय' : 'Estimated Preparation & Delivery Time'}
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      {settings.estimatedDeliveryMinutes} {lang === 'hi' ? 'मिनट' : 'Minutes'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={settings.estimatedDeliveryMinutes}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        estimatedDeliveryMinutes: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Marquee Banner */}
                <div className="space-y-1.5 pb-3 border-b border-stone-800">
                  <label className="text-xs font-bold text-white block">
                    {lang === 'hi' ? 'घोषणा पट्टी (Marquee Banner)' : 'Announcement Marquee Banner'}
                  </label>
                  <input
                    type="text"
                    value={settings.announcementBanner}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        announcementBanner: e.target.value,
                      }))
                    }
                    className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                {/* Delivery fee & threshold */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-stone-800">
                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-400 block">
                      {lang === 'hi' ? 'डिलीवरी शुल्क (₹)' : 'Delivery Fee (₹)'}
                    </label>
                    <input
                      type="number"
                      value={settings.deliveryFee}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, deliveryFee: Number(e.target.value) }))
                      }
                      className="w-full p-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-400 block">
                      {lang === 'hi' ? 'मुफ्त डिलीवरी (न्यूनतम ₹)' : 'Free Delivery Above (₹)'}
                    </label>
                    <input
                      type="number"
                      value={settings.freeDeliveryThreshold}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          freeDeliveryThreshold: Number(e.target.value),
                        }))
                      }
                      className="w-full p-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  {lang === 'hi' ? 'सेटिंग्स सेव करें' : 'Save Operations Settings'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* NATIVE BOTTOM ANDROID NAVIGATION BAR (Genuine, Sleek, Compact & Easy) */}
        {/* ========================================================================= */}
        <div className="shrink-0 bg-stone-950/95 backdrop-blur-md border-t border-stone-800/80 px-2 sm:px-6 py-2 sm:py-2.5 z-30 shadow-2xl">
          <div className="max-w-md mx-auto grid grid-cols-5 gap-1 items-center">
            {/* 1. Orders */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('kds');
                setIsMoreMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                activeTab === 'kds'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
              }`}
            >
              <div className="relative">
                <Flame className="w-5 h-5" />
                {orders.filter((o) => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled').length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-400 text-stone-950 text-[9px] font-mono font-black px-1 rounded-full min-w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                    {orders.filter((o) => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled').length}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate font-medium">
                {lang === 'hi' ? 'ऑर्डर' : 'Orders'}
              </span>
            </button>

            {/* 2. Tables */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('tables');
                setIsMoreMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                activeTab === 'tables'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
              }`}
            >
              <div className="relative">
                <Store className="w-5 h-5" />
                {diningTables.filter((t) => t.status === 'occupied').length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-mono font-bold px-1 rounded-full min-w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                    {diningTables.filter((t) => t.status === 'occupied').length}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate font-medium">
                {lang === 'hi' ? 'टेबल' : 'Tables'}
              </span>
            </button>

            {/* 3. Bookings */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('reservations');
                setIsMoreMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                activeTab === 'reservations'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
              }`}
            >
              <div className="relative">
                <Calendar className="w-5 h-5" />
                {reservations.filter((r) => r.status === 'confirmed').length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-[9px] font-mono font-bold px-1 rounded-full min-w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                    {reservations.filter((r) => r.status === 'confirmed').length}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate font-medium">
                {lang === 'hi' ? 'बुकिंग' : 'Bookings'}
              </span>
            </button>

            {/* 4. Menu */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('menu');
                setIsMoreMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                activeTab === 'menu'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
              }`}
            >
              <ChefHat className="w-5 h-5" />
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate font-medium">
                {lang === 'hi' ? 'मेन्यू' : 'Menu'}
              </span>
            </button>

            {/* 5. The LAST EXTRA NAV AT DOWN: Shows ALL REMAINING OPTIONS in a prompt! */}
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(true)}
              className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                ['analytics', 'staff', 'coupons', 'catering', 'reviews', 'settings'].includes(activeTab) || isMoreMenuOpen
                  ? 'text-amber-400 font-bold bg-amber-400/20 ring-1 ring-amber-400/40 shadow-xs'
                  : 'text-stone-400 hover:text-amber-300 hover:bg-stone-900/60'
              }`}
              title="View all remaining options: Sales, Staff Duty, Offers, Party & Catering"
            >
              <div className="relative">
                <LayoutGrid className="w-5 h-5" />
                {cateringInquiries.filter((c) => c.status === 'new').length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-400 text-stone-950 text-[9px] font-bold px-1 rounded-full min-w-3.5 h-3.5 flex items-center justify-center animate-pulse">
                    {cateringInquiries.filter((c) => c.status === 'new').length}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate flex items-center gap-0.5 font-medium">
                <span>{lang === 'hi' ? 'अन्य विकल्प' : 'More'}</span>
                <span className="text-[8px]">▾</span>
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MANAGER CHOICE PROMPT MODAL (Prompted to choose from remaining options) */}
        {/* ========================================================================= */}
        {isMoreMenuOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsMoreMenuOpen(false)}
          >
            <div
              className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-slide-up text-stone-100 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-stone-700 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-display font-bold text-sm text-amber-300">
                      {lang === 'hi' ? 'मैनेजर ऑप्शंस' : 'Manager Operations'}
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      {lang === 'hi' ? 'देखने के लिए विकल्प चुनें:' : 'Select an option to manage:'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of All Remaining Options: Sales, Staffs Duty, Offer Edits, Party/Catering, Reviews, Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'analytics',
                    icon: TrendingUp,
                    titleHi: 'आज की बिक्री (Sales)',
                    titleEn: 'Sales & Reports',
                    descHi: 'दैनिक कमाई व बिल हिसाब',
                    descEn: 'Revenue, orders & bill stats',
                    badge: `₹${(orders.filter(o => o.orderStatus === 'completed').reduce((sum, o) => sum + (o.grandTotal || 0), 0) + 12450).toLocaleString('en-IN')}`,
                  },
                  {
                    id: 'staff',
                    icon: Users,
                    titleHi: 'कर्मचारी ड्यूटी (Staff)',
                    titleEn: 'Staffs Duty',
                    descHi: 'शिफ्ट, रोस्टर व हाजिरी स्थिति',
                    descEn: 'Duty shifts & active roster',
                    badge: `${staff.filter(s => s.shiftStatus === 'on_shift').length} On Duty`,
                  },
                  {
                    id: 'coupons',
                    icon: Tag,
                    titleHi: 'ऑफर एडिट्स (Offers)',
                    titleEn: 'Offer Edits',
                    descHi: 'डिस्काउंट कूपन और प्रोमो कोड',
                    descEn: 'Promos, discounts & codes',
                    badge: `${coupons.filter(c => c.isActive).length} Active`,
                  },
                  {
                    id: 'catering',
                    icon: PartyPopper,
                    titleHi: 'पार्टी या कैटरिंग',
                    titleEn: 'Party or Catering',
                    descHi: 'इवेंट बुकिंग और थोक पूछताछ',
                    descEn: 'Bulk dining, banquets & queries',
                    badge: cateringInquiries.filter(c => c.status === 'new').length > 0
                      ? `${cateringInquiries.filter(c => c.status === 'new').length} New`
                      : 'Live',
                  },
                  {
                    id: 'reviews',
                    icon: MessageSquare,
                    titleHi: 'ग्राहकों की राय (Reviews)',
                    titleEn: 'Guest Reviews',
                    descHi: 'रेटिंग, सुझाव और फीडबैक',
                    descEn: 'Ratings, feedback & comments',
                    badge: `${reviews.length} Ratings`,
                  },
                  {
                    id: 'settings',
                    icon: Settings,
                    titleHi: 'दुकान सेटिंग्स (Settings)',
                    titleEn: 'Restaurant Settings',
                    descHi: 'रसोई चालू/बंद, समय और नियम',
                    descEn: 'Kitchen status & timings',
                    badge: settings.isKitchenAcceptingOrders ? 'Online' : 'Paused',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (['kds', 'tables', 'reservations', 'menu'].includes(activeTab)) {
                          setPreviousTab(activeTab as any);
                        }
                        setActiveTab(item.id as any);
                        setIsMoreMenuOpen(false);
                        showNotification(
                          lang === 'hi'
                            ? `${item.titleHi} खुला!`
                            : `Switched to ${item.titleEn}!`
                        );
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 group active:scale-98 ${
                        isActive
                          ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-md ring-2 ring-amber-400/50'
                          : 'bg-stone-950/80 hover:bg-stone-800/80 border-stone-800 text-stone-200 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 border ${
                            isActive
                              ? 'bg-stone-950 text-amber-300 border-amber-400'
                              : 'bg-stone-900 border-stone-800 text-amber-400 group-hover:scale-105 transition-transform'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${isActive ? 'text-stone-950' : 'text-stone-100 group-hover:text-amber-300'}`}>
                            {lang === 'hi' ? item.titleHi : item.titleEn}
                          </div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-stone-800' : 'text-stone-400'}`}>
                            {lang === 'hi' ? item.descHi : item.descEn}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap ${
                            isActive
                              ? 'bg-stone-950 text-amber-300'
                              : 'bg-stone-800 text-stone-300 border border-stone-700/50'
                          }`}
                        >
                          {item.badge}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-stone-500 group-hover:translate-x-0.5 transition-transform'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT DISH MODAL */}
      {/* ========================================================================= */}
      {isAddDishOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-xs">
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 text-stone-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                {editingDish ? 'Edit Dish Details' : 'Add New Dish to Menu'}
              </h3>
              <button onClick={() => setIsAddDishOpen(false)} className="text-stone-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Dish Name (English) *</label>
                <input
                  type="text"
                  required
                  value={dishForm.name || ''}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  placeholder="e.g. Royal Shahi Paneer"
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Hindi Subtitle</label>
                <input
                  type="text"
                  value={dishForm.hindiName || ''}
                  onChange={(e) => setDishForm({ ...dishForm, hindiName: e.target.value })}
                  placeholder="e.g. रॉयल शाही पनीर"
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1">Price Full (₹) *</label>
                  <input
                    type="number"
                    required
                    value={dishForm.price || ''}
                    onChange={(e) => setDishForm({ ...dishForm, price: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Half Price (₹)</label>
                  <input
                    type="number"
                    value={dishForm.halfPrice || ''}
                    onChange={(e) => setDishForm({ ...dishForm, halfPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1">Category</label>
                  <select
                    value={dishForm.category || 'curries'}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  >
                    <option value="curries">Curries</option>
                    <option value="tandoor">Tandoor</option>
                    <option value="biryani">Biryani</option>
                    <option value="thali">Thali</option>
                    <option value="breads">Breads</option>
                    <option value="desserts">Desserts</option>
                    <option value="beverages">Beverages</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    value={dishForm.prepTimeMinutes || 15}
                    onChange={(e) =>
                      setDishForm({ ...dishForm, prepTimeMinutes: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={dishForm.description || ''}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddDishOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 text-stone-950 font-bold rounded-xl"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEAT WALK-IN GUEST MODAL */}
      {/* ========================================================================= */}
      {seatingTableModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 text-stone-100">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-white">
                Seat Guest at {seatingTableModal.tableNumber}
              </h3>
              <button onClick={() => setSeatingTableModal(null)} className="text-stone-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Guest / Family Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sharma Family"
                  value={walkinGuestName}
                  onChange={(e) => setWalkinGuestName(e.target.value)}
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Party Size</label>
                <input
                  type="number"
                  value={walkinPartySize}
                  onChange={(e) => setWalkinPartySize(e.target.value)}
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setSeatingTableModal(null)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateTableStatus(
                      seatingTableModal.id,
                      'occupied',
                      walkinGuestName.trim() || 'Walk-in Guest'
                    )
                  }
                  className="px-4 py-2 bg-emerald-500 text-stone-950 font-bold rounded-xl"
                >
                  Confirm Seating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD COUPON MODAL */}
      {/* ========================================================================= */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 text-stone-100">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-white">Create Promo Coupon</h3>
              <button onClick={() => setIsAddCouponOpen(false)} className="text-stone-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ROYAL50"
                  value={couponForm.code || ''}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 20% off on first order"
                  value={couponForm.description || ''}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={couponForm.discountPercent || ''}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, discountPercent: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderValue || 400}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 text-stone-950 font-bold rounded-xl"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD STAFF MEMBER MODAL */}
      {/* ========================================================================= */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 text-stone-100">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-white">Add Crew Member</h3>
              <button onClick={() => setIsAddStaffOpen(false)} className="text-stone-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Crew Member Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chef Arvind Mathur"
                  value={staffForm.name || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1">Role</label>
                  <select
                    value={staffForm.role || 'sous_chef'}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                    className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  >
                    <option value="head_chef">Head Chef</option>
                    <option value="sous_chef">Sous Chef</option>
                    <option value="floor_captain">Floor Captain</option>
                    <option value="cashier">Cashier</option>
                    <option value="rider_lead">Rider Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={staffForm.phone || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Station / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Tandoor & Charcoal Deg"
                  value={staffForm.station || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, station: e.target.value })}
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 text-stone-950 font-bold rounded-xl"
                >
                  Add to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THERMAL RECEIPT & KOT PRINT MODAL */}
      {/* ========================================================================= */}
      {printingOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-stone-950/85 backdrop-blur-xs font-mono">
          <div className="max-w-sm w-full bg-white text-stone-900 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="text-center space-y-1 border-b border-dashed border-stone-300 pb-3">
              <h2 className="text-base font-bold tracking-tight">MAHESWARI RESTAURANT & HOTEL</h2>
              <p className="text-[10px] text-stone-600">Grand Opening 2026 · Connaught Place, New Delhi</p>
              <p className="text-[10px] text-stone-500">GSTIN: 07AAAAA0000A1Z5 · FSSAI: 13326999000123</p>
              <div className="pt-1 text-[11px] font-bold text-stone-800">
                KITCHEN ORDER TICKET (KOT) / TAX INVOICE
              </div>
            </div>

            <div className="text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>Order No:</span>
                <span className="font-bold">#{printingOrder.orderNumber || printingOrder.id.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{printingOrder.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="uppercase font-bold">
                  {printingOrder.bookingType}
                  {printingOrder.tableNumber ? ` · ${printingOrder.tableNumber}` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Guest:</span>
                <span>{printingOrder.customerName || 'Walk-in'}</span>
              </div>
              {printingOrder.deliveryAddress && (
                <div className="text-[10px] text-stone-600 pt-0.5">
                  Address: {printingOrder.deliveryAddress}
                </div>
              )}
            </div>

            <div className="border-t border-b border-dashed border-stone-300 py-2 space-y-1.5 text-[11px]">
              <div className="flex justify-between font-bold text-stone-700">
                <span>Item</span>
                <span>Qty x Price</span>
                <span>Total</span>
              </div>
              {printingOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate pr-1">
                    {item.menuItem?.name || 'Dish'}
                    {item.portion === 'half' ? ' (Half)' : ''}
                  </span>
                  <span className="shrink-0 text-stone-600">
                    {item.quantity} x {item.unitPrice}
                  </span>
                  <span className="shrink-0 font-bold">
                    ₹{item.itemTotal || (item.unitPrice || 0) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px] text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{printingOrder.subtotal}</span>
              </div>
              {printingOrder.gstAmount > 0 && (
                <div className="flex justify-between">
                  <span>GST (5%):</span>
                  <span>₹{printingOrder.gstAmount}</span>
                </div>
              )}
              {printingOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount:</span>
                  <span>-₹{printingOrder.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black border-t border-dashed border-stone-300 pt-1.5">
                <span>GRAND TOTAL:</span>
                <span>₹{printingOrder.grandTotal}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-stone-500 border-t border-dashed border-stone-300 pt-2">
              *** Thank You for Dining with Royal Maheswari ***
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="flex-1 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
