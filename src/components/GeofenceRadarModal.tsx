import React from 'react';
import {
  MapPin,
  Compass,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Sliders,
  X,
  Crosshair,
  ShieldAlert
} from 'lucide-react';
import { GeofenceState, LocationCoordinates } from '../types/restaurant';
import { PRESET_LOCATIONS, SHANKAR_RESTAURANT_LOCATION } from '../services/locationService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  geofenceState: GeofenceState;
  deliveryRadiusKm: number;
  dineInRadiusMeters: number;
  onUpdateRadiusKm: (newRadius: number) => void;
  onSelectPreset: (presetId: string) => void;
  onRequestLiveGPS: () => void;
}

export const GeofenceRadarModal: React.FC<Props> = ({
  isOpen,
  onClose,
  geofenceState,
  deliveryRadiusKm,
  dineInRadiusMeters,
  onUpdateRadiusKm,
  onSelectPreset,
  onRequestLiveGPS
}) => {
  if (!isOpen) return null;

  const distanceKm = geofenceState.distanceKm ?? 0;
  const isInside = geofenceState.isInsideDeliveryRadius;
  const isDineInInside = geofenceState.isInsideDineInRadius;

  // Radar visualization calculations
  // Map 0km to center, deliveryRadiusKm to 80% of radius circle
  const maxDisplayKm = Math.max(deliveryRadiusKm * 1.8, 16);
  const radarRadiusPx = 130; // Scope radius in px

  // Clamped visual distance
  const clampedDistance = Math.min(distanceKm, maxDisplayKm);
  const distanceRatio = clampedDistance / maxDisplayKm;
  const visualDistancePx = distanceRatio * radarRadiusPx;

  // Mock angle based on user coords for stable visual orientation
  const angle =
    geofenceState.userCoords
      ? ((geofenceState.userCoords.lat * 1000 + geofenceState.userCoords.lng * 1000) % 360) *
        (Math.PI / 180)
      : Math.PI / 4;

  const userDotX = Math.cos(angle) * visualDistancePx;
  const userDotY = Math.sin(angle) * visualDistancePx;

  const deliveryBoundaryPx = (deliveryRadiusKm / maxDisplayKm) * radarRadiusPx;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-900/10 flex items-center justify-center text-amber-900">
              <Compass className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 font-serif-display">
                Shankar Geofence Radar & Abuse Prevention
              </h2>
              <p className="text-xs text-stone-500 font-sans-body">
                High-precision GPS perimeter security for booking & order verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto font-sans-body">
          {/* Status banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 transition-colors ${
              isInside
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}
          >
            {isInside ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {isInside
                    ? 'Within Shankar Restaurant Authorized Radius'
                    : 'Strict Hotel Radius Abuse Lock Triggered'}
                </span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white/70 border border-current">
                  {distanceKm.toFixed(2)} km away
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isInside
                  ? `Your verified coordinates are within our strict ${deliveryRadiusKm} km service perimeter. Booking, checkout, and table reservations are fully authorized.`
                  : `You are currently ${distanceKm.toFixed(
                      2
                    )} km away, exceeding our ${deliveryRadiusKm} km maximum limit. Bookings and checkouts are blocked to prevent false orders, phantom bookings, and food coldness.`}
              </p>
            </div>
          </div>

          {/* Interactive Radar Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual Radar Scope */}
            <div className="flex flex-col items-center">
              <div className="relative w-[280px] h-[280px] rounded-full bg-stone-900 border-2 border-stone-800 flex items-center justify-center overflow-hidden shadow-inner">
                {/* Concentric rings */}
                <div
                  className="absolute rounded-full border border-stone-800"
                  style={{ width: radarRadiusPx * 0.5 * 2, height: radarRadiusPx * 0.5 * 2 }}
                />
                <div
                  className="absolute rounded-full border border-stone-800"
                  style={{ width: radarRadiusPx * 1.0 * 2, height: radarRadiusPx * 1.0 * 2 }}
                />
                <div
                  className="absolute rounded-full border border-stone-800"
                  style={{ width: radarRadiusPx * 1.5 * 2, height: radarRadiusPx * 1.5 * 2 }}
                />

                {/* Crosshairs */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-px bg-stone-800/80" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-full w-px bg-stone-800/80" />
                </div>

                {/* Delivery Boundary Green Circle */}
                <div
                  className="absolute rounded-full border-2 border-emerald-500/70 bg-emerald-500/10 pointer-events-none transition-all duration-300"
                  style={{
                    width: Math.max(10, deliveryBoundaryPx * 2),
                    height: Math.max(10, deliveryBoundaryPx * 2)
                  }}
                />

                {/* Shankar Restaurant Center Pin */}
                <div className="absolute z-10 flex flex-col items-center -translate-y-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-md animate-pulse" />
                  <span className="text-[9px] font-semibold text-amber-300 bg-stone-900/90 px-1 rounded mt-0.5">
                    Shankar CP
                  </span>
                </div>

                {/* User Coordinate Dot */}
                <div
                  className="absolute z-20 transition-all duration-500 flex flex-col items-center"
                  style={{
                    transform: `translate(${userDotX}px, ${userDotY}px)`
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                      isInside ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'
                    }`}
                  />
                  <div
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap ${
                      isInside ? 'bg-emerald-900 text-emerald-100' : 'bg-rose-900 text-rose-100'
                    }`}
                  >
                    You ({distanceKm.toFixed(1)} km)
                  </div>
                </div>

                {/* Radar sweep line */}
                <div className="absolute inset-0 rounded-full border border-stone-700/50 pointer-events-none" />
              </div>

              <div className="flex items-center gap-4 mt-3 text-[11px] text-stone-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Shankar Restaurant
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Max Radius ({deliveryRadiusKm} km)
                </span>
              </div>
            </div>

            {/* Coordinates & Verification Telemetry */}
            <div className="space-y-4">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Restaurant Epicenter</span>
                  <span className="font-semibold text-stone-800">Connaught Place, New Delhi</span>
                </div>
                <div className="font-mono text-xs text-stone-600 bg-white p-2 rounded border border-stone-100">
                  Lat: {SHANKAR_RESTAURANT_LOCATION.center.lat} · Lng:{' '}
                  {SHANKAR_RESTAURANT_LOCATION.center.lng}
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Your Current Coordinates</span>
                  <span className="font-semibold text-stone-800">
                    {geofenceState.userCoords?.addressLabel || 'Detecting...'}
                  </span>
                </div>
                <div className="font-mono text-xs text-stone-600 bg-white p-2 rounded border border-stone-100 flex items-center justify-between">
                  <span>
                    Lat: {geofenceState.userCoords?.lat.toFixed(4) || '--'} · Lng:{' '}
                    {geofenceState.userCoords?.lng.toFixed(4) || '--'}
                  </span>
                  <span className="text-stone-400">
                    ±{geofenceState.userCoords?.accuracyMeters?.toFixed(0) || '15'}m
                  </span>
                </div>
              </div>

              {/* Strict Radius Range Slider (Interactive Demonstration) */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-amber-950 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-amber-800" />
                    Delivery Radius Threshold
                  </span>
                  <span className="font-bold font-mono text-amber-900">{deliveryRadiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={deliveryRadiusKm}
                  onChange={(e) => onUpdateRadiusKm(parseFloat(e.target.value))}
                  className="w-full accent-amber-700 cursor-pointer"
                />
                <p className="text-[11px] text-amber-800">
                  Slide to test perimeter boundaries. In production, this is managed by restaurant dispatch.
                </p>
              </div>

              {/* Real GPS trigger */}
              <button
                onClick={onRequestLiveGPS}
                className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Acquire Real Device GPS Position</span>
              </button>
            </div>
          </div>

          {/* Test Locations Presets (Allows instant testing of Inside vs Outside Abuse scenarios) */}
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-stone-600" />
              <span>Simulate Testing Coordinates (Inside vs. Abuse Scenarios):</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_LOCATIONS.map((preset) => {
                const isSelected =
                  geofenceState.userCoords?.lat === preset.lat &&
                  geofenceState.userCoords?.lng === preset.lng;

                const isPresetInside = preset.expectedStatus !== 'outside_radius';

                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset.id)}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-amber-700 bg-amber-50/80 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-stone-900">{preset.name}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isPresetInside
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800 font-semibold'
                        }`}
                      >
                        {isPresetInside ? 'Inside Radius' : 'Abuse Blocked'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <span>Protected by Haversine Distance Geofencing & Cloudflare Turnstile</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 font-medium transition-colors"
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
