import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { Order } from '../types/restaurant';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<Props> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const [copied, setCopied] = useState(false);
  const [kitchenStep, setKitchenStep] = useState<number>(1);

  // Simulate kitchen order progress
  useEffect(() => {
    const timer1 = setTimeout(() => setKitchenStep(2), 2500);
    const timer2 = setTimeout(() => setKitchenStep(3), 6000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleCopyReceipt = () => {
    const dist = order.geofenceVerification?.distanceKm ?? 0;
    const receiptText = `Maheswari Restaurant Order #${order.orderNumber}\nTotal: ₹${order.grandTotal}\nItems: ${order.items
      .map((i) => `${i.quantity}x ${i.menuItem.name}`)
      .join(', ')}\nGeofence Distance: ${dist} km\nTurnstile Ray: ${order.turnstileToken || 'verified'}`;
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans-body">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
        {/* Header with Royal Success Tone */}
        <div className="p-6 bg-stone-900 text-stone-100 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-serif-display font-semibold text-amber-300">
            Order Confirmed & Sent to Kitchen!
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Order ID: <span className="font-mono text-white font-bold">{order.orderNumber}</span> · Shankar Restaurant CP
          </p>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Kitchen Preparation Tracker */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-800" />
                <span>Estimated Time: ~{order.estimatedTimeMinutes} Minutes</span>
              </span>
              <span className="text-amber-800 font-mono">
                {kitchenStep === 1
                  ? 'Order Received'
                  : kitchenStep === 2
                  ? 'Smoking in Tandoor / Simmering'
                  : order.bookingType === 'dine_in'
                  ? 'Serving to Table'
                  : 'Packing with Thermal Foil'}
              </span>
            </div>

            {/* Step progress bar */}
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  kitchenStep >= 1 ? 'bg-amber-800' : 'bg-stone-200'
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  kitchenStep >= 2 ? 'bg-amber-800' : 'bg-stone-200'
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  kitchenStep >= 3 ? 'bg-emerald-600' : 'bg-stone-200'
                }`}
              />
            </div>
          </div>

          {/* Order Details note */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1 text-stone-700">
            <div className="flex justify-between">
              <span className="text-stone-500">Order Service:</span>
              <span className="font-semibold capitalize text-stone-900">
                {order.bookingType === 'dine_in'
                  ? 'Dine-In Table'
                  : order.bookingType === 'takeaway'
                  ? 'Self Pickup'
                  : 'Home Delivery'}
              </span>
            </div>
            {order.customer?.address && (
              <div className="flex justify-between pt-1">
                <span className="text-stone-500">Destination:</span>
                <span className="text-stone-800 text-right max-w-xs truncate">{order.customer.address}</span>
              </div>
            )}
          </div>

          {/* Itemized summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Dishes Ordered
            </h3>
            <div className="space-y-2 border-t border-stone-100 pt-2">
              {order.items.map((item) => (
                <div key={item.cartItemId} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-stone-900">{item.quantity}x</span>
                    <span className="text-stone-800">{item.menuItem.name}</span>
                    <span className="text-[10px] text-stone-400 capitalize">({item.portion})</span>
                  </div>
                  <span className="font-mono tabular-nums text-stone-900 font-medium">
                    ₹{item.itemTotal}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-sm font-bold text-stone-950">
              <span>Paid Amount ({order.paymentMethod.toUpperCase()})</span>
              <span className="font-mono text-base tabular-nums">₹{order.grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={handleCopyReceipt}
            className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium px-3 py-2 rounded-lg border border-stone-200 bg-white"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Receipt</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Receipt</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors"
          >
            Back to Shankar Home
          </button>
        </div>
      </div>
    </div>
  );
};
