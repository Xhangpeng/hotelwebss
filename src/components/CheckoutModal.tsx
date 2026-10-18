import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  MapPin,
  Lock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Phone,
  User as UserIcon
} from 'lucide-react';
import {
  CartItem,
  GeofenceState,
  BookingType,
  Order,
  UserProfile
} from '../types/restaurant';
import { cloudflareTurnstile } from '../services/cloudflareTurnstile';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  bookingType: BookingType;
  geofenceState: GeofenceState;
  deliveryRadiusKm: number;
  discountCode: string;
  appliedDiscount: number;
  user: UserProfile;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cartItems,
  bookingType,
  geofenceState,
  deliveryRadiusKm,
  discountCode,
  appliedDiscount,
  user,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(
    user.savedAddresses[0] || 'Flat 402, Block B, Barakhamba Road, Connaught Place, New Delhi'
  );
  const [tableNumber, setTableNumber] = useState('Table 7');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  const gstAmount = Math.round(subtotal * 0.05);
  const deliveryFee = bookingType === 'delivery' ? (subtotal > 500 ? 0 : 50) : 0;
  const grandTotal = Math.max(0, subtotal + gstAmount + deliveryFee - appliedDiscount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please provide a valid 10-digit mobile phone number.');
      return;
    }
    if (bookingType === 'delivery' && !address.trim()) {
      setError('Please provide the full delivery address within the radius.');
      return;
    }

    // Strict Geofence verification check
    if (bookingType !== 'takeaway' && !geofenceState.isInsideDeliveryRadius) {
      setError(
        `Order blocked: You are currently outside Shankar Restaurant's ${deliveryRadiusKm} km radius. Please switch to an authorized location.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute final Turnstile background assertion
      const cfStatus = await cloudflareTurnstile.runBackgroundChallenge(false);

      // Generate order record
      const orderId = `SHK-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder: Order = {
        id: orderId,
        orderNumber: orderId,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bookingType,
        items: [...cartItems],
        subtotal,
        gstAmount,
        deliveryFee,
        discountAmount: appliedDiscount,
        discountCode: appliedDiscount > 0 ? discountCode : undefined,
        grandTotal,
        customer: {
          name,
          phone,
          address: bookingType === 'delivery' ? address : undefined,
          tableNumber: bookingType === 'dine_in' ? tableNumber : undefined
        },
        paymentMethod: paymentMethod === 'cod' ? (bookingType === 'dine_in' ? 'pay_at_counter' : 'cod') : paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'placed',
        geofenceVerification: {
          verified: true,
          distanceKm: geofenceState.distanceKm ?? 0.5,
          userLocationLabel: geofenceState.userCoords?.addressLabel || 'Verified Geofence'
        },
        turnstileToken: cfStatus.token || '0.cf_tnst_verified',
        estimatedTimeMinutes: bookingType === 'dine_in' ? 20 : 35
      };

      await new Promise((res) => setTimeout(res, 800)); // Smooth processing settling
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Verification failed. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans-body">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-stone-100">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-serif-display font-semibold text-amber-300">
              Shankar Restaurant Express Checkout
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Fast Delivery Assurance */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <span>Direct Kitchen Dispatch · Connaught Place</span>
            <span className="font-medium text-stone-900">Estimated ~30 mins</span>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              1. Customer Contact & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3 text-stone-400" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajeev Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-stone-400" />
                  <span>Mobile Phone</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800"
                />
              </div>
            </div>

            {bookingType === 'delivery' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-700 block">
                  Delivery Address (Within {deliveryRadiusKm} km radius)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="House/Flat number, building name, street, nearby landmark..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800"
                />
              </div>
            )}

            {bookingType === 'dine_in' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-700 block">
                  Table Number in Dining Hall
                </label>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800"
                >
                  {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 7', 'Table 10 (Courtyard)'].map(
                    (tbl) => (
                      <option key={tbl} value={tbl}>
                        {tbl}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              2. Payment Option
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-amber-900 bg-amber-50/70 text-stone-950 font-semibold'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <QrCode className="w-4 h-4 text-amber-800" />
                  <span className="text-xs">Instant UPI</span>
                </div>
                <p className="text-[10px] text-stone-500">GPay, PhonePe, Paytm QR</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'card'
                    ? 'border-amber-900 bg-amber-50/70 text-stone-950 font-semibold'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-amber-800" />
                  <span className="text-xs">Debit / Credit</span>
                </div>
                <p className="text-[10px] text-stone-500">Visa, RuPay, MasterCard</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-amber-900 bg-amber-50/70 text-stone-950 font-semibold'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Banknote className="w-4 h-4 text-amber-800" />
                  <span className="text-xs">
                    {bookingType === 'dine_in' ? 'Pay at Table' : 'Cash on Delivery'}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500">Pay when served / delivered</p>
              </button>
            </div>

            {/* UPI QR preview when UPI is selected */}
            {paymentMethod === 'upi' && (
              <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-stone-900">Virtual Payment UPI ID:</span>
                  <span className="font-mono text-stone-700 block text-[11px]">shankarrestaurant@upi</span>
                  <span className="text-[10px] text-stone-500">Seamless instant confirmation</span>
                </div>
                <div className="w-12 h-12 rounded bg-white border border-stone-200 p-1 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-stone-800" />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary & Submit Bar */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-500 block">Total Payable</span>
              <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                ₹{grandTotal}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-amber-900 hover:bg-amber-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Confirming Order...</span>
                </>
              ) : (
                <>
                  <span>Place Shankar Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
