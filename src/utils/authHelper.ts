import { UserProfile } from '../types/restaurant';

export const ADMIN_EMAILS = [
  'militarynp280@gmail.com',
  'tejsinghsaud55@gmail.com',
  'tejsinghsaud70@gmail.com',
  'admin@maheswarirestaurant.com',
];

export const ADMIN_MASTER_PINS = ['2026', '7788', '1234'];

export function isAdminUser(user?: UserProfile | null): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'kitchen' || user.role === 'captain') return true;
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) {
    return true;
  }
  if (user.name && user.name.toLowerCase().includes('tej')) {
    return true;
  }
  return false;
}

export function verifyAdminPin(pin: string): boolean {
  return ADMIN_MASTER_PINS.includes(pin.trim());
}
