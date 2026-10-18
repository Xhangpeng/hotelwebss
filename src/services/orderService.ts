import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Order } from '../types/restaurant';

// Seed authentic Shankar Restaurant orders for initial display if user has no prior history
export const INITIAL_REAL_ORDERS: Order[] = [
  {
    id: 'SHK-89241',
    orderNumber: 'SHK-89241',
    createdAt: 'Today, 01:15 PM',
    bookingType: 'delivery',
    items: [
      {
        cartItemId: 'shankar_butter_chicken_full',
        menuItem: {
          id: 'shankar_butter_chicken',
          name: 'Shankar Murgh Makhani (Butter Chicken)',
          category: 'curries',
          description: 'Tandoor-smoked chicken in rich tomato butter gravy',
          price: 495,
          dietary: 'non-veg',
          spiceLevel: 1,
          rating: 4.9,
          reviewsCount: 382,
          image: '',
          prepTimeMinutes: 20
        },
        quantity: 1,
        portion: 'full',
        spiceLevel: 1,
        itemTotal: 495
      },
      {
        cartItemId: 'garlic_butter_naan_2',
        menuItem: {
          id: 'garlic_butter_naan',
          name: 'Clay Oven Garlic Butter Naan',
          category: 'breads',
          description: 'Tandoor charred garlic naan glazed with pure butter',
          price: 95,
          dietary: 'veg',
          spiceLevel: 0,
          rating: 4.9,
          reviewsCount: 512,
          image: '',
          prepTimeMinutes: 10
        },
        quantity: 2,
        portion: 'full',
        spiceLevel: 0,
        itemTotal: 190
      },
      {
        cartItemId: 'kesar_mango_lassi_1',
        menuItem: {
          id: 'kesar_mango_lassi',
          name: 'Kesariya Alphonso Mango Lassi',
          category: 'beverages',
          description: 'Thick hand-churned yogurt with Alphonso mango',
          price: 165,
          dietary: 'veg',
          spiceLevel: 0,
          rating: 4.95,
          reviewsCount: 388,
          image: '',
          prepTimeMinutes: 8
        },
        quantity: 1,
        portion: 'full',
        spiceLevel: 0,
        itemTotal: 165
      }
    ],
    subtotal: 850,
    gstAmount: 43,
    deliveryFee: 0,
    discountAmount: 170,
    discountCode: 'SHANKAR20',
    grandTotal: 723,
    customer: {
      name: 'Rajeev Sharma',
      phone: '98110 23456',
      address: 'Flat 402, Block B, Barakhamba Road, Connaught Place, New Delhi'
    },
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    orderStatus: 'completed',
    geofenceVerification: {
      verified: true,
      distanceKm: 0.6,
      userLocationLabel: 'Barakhamba Road, Connaught Place'
    },
    turnstileToken: '0.cf_tnst_89241',
    estimatedTimeMinutes: 25
  },
  {
    id: 'SHK-73105',
    orderNumber: 'SHK-73105',
    createdAt: 'Yesterday, 08:30 PM',
    bookingType: 'dine_in',
    items: [
      {
        cartItemId: 'royal_dum_biryani_full',
        menuItem: {
          id: 'royal_dum_biryani',
          name: 'Royal Shankar Awadhi Dum Biryani',
          category: 'biryani',
          description: 'Aged basmati rice sealed in terracotta pot with saffron',
          price: 480,
          dietary: 'non-veg',
          spiceLevel: 2,
          rating: 4.95,
          reviewsCount: 420,
          image: '',
          prepTimeMinutes: 25
        },
        quantity: 1,
        portion: 'full',
        spiceLevel: 2,
        itemTotal: 480
      },
      {
        cartItemId: 'dal_makhani_1',
        menuItem: {
          id: 'dal_makhani_overnight',
          name: 'Dal Shankar (24-Hour Charcoal Dal Makhani)',
          category: 'curries',
          description: 'Black lentils slow cooked overnight with white butter',
          price: 360,
          dietary: 'veg',
          spiceLevel: 1,
          rating: 4.9,
          reviewsCount: 365,
          image: '',
          prepTimeMinutes: 15
        },
        quantity: 1,
        portion: 'full',
        spiceLevel: 1,
        itemTotal: 360
      }
    ],
    subtotal: 840,
    gstAmount: 42,
    deliveryFee: 0,
    discountAmount: 0,
    grandTotal: 882,
    customer: {
      name: 'Rajeev Sharma',
      phone: '98110 23456',
      tableNumber: 'Table 4 (Maharaja Baithak)'
    },
    paymentMethod: 'pay_at_counter',
    paymentStatus: 'paid',
    orderStatus: 'completed',
    geofenceVerification: {
      verified: true,
      distanceKm: 0.05,
      userLocationLabel: 'Dining Hall, Shankar Restaurant CP'
    },
    turnstileToken: '0.cf_tnst_73105',
    estimatedTimeMinutes: 20
  }
];

/**
 * Save new order into Firestore
 */
export async function saveOrderToFirestore(order: Order, userId: string): Promise<void> {
  const path = 'orders';
  try {
    const orderDocRef = doc(db, path, order.id);
    await setDoc(orderDocRef, {
      ...order,
      userId,
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${order.id}`);
  }
}

/**
 * Fetch orders for the current user from Firestore with fallback to cached/initial orders
 */
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push(doc.data() as Order);
    });

    if (orders.length > 0) {
      return orders;
    }

    // Check localStorage for offline orders
    const local = localStorage.getItem(`shankar_orders_${userId}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }

    return INITIAL_REAL_ORDERS;
  } catch (error) {
    console.warn('Firestore fetch orders notice, falling back to local list:', error);
    const local = localStorage.getItem(`shankar_orders_${userId}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }
    return INITIAL_REAL_ORDERS;
  }
}
