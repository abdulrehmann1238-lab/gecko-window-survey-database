import { Coupon } from '../types';

export const seededCoupons: Coupon[] = [
  {
    code: 'HERITAGE10',
    description: '10% discount on all pane lines',
    type: 'percent',
    amount: 10,
    isValid: true,
    syncedAt: '2026-10-10T09:42:00Z',
  },
  {
    code: 'TRADE5',
    description: '5% trade partner discount',
    type: 'percent',
    amount: 5,
    isValid: true,
    syncedAt: '2026-10-10T09:42:00Z',
  },
  {
    code: 'WELCOMEBACK',
    description: '£75.00 off orders with panes over £1,500 ex VAT',
    type: 'fixed',
    amount: 75.00,
    minSpend: 1500.00,
    isValid: true,
    syncedAt: '2026-10-10T09:42:00Z',
  },
  {
    code: 'SPRING-FROST',
    description: 'Expired seasonal promotion: £50 off frosted secondary glazing',
    type: 'fixed',
    amount: 50.00,
    isValid: false,
    invalidReason: 'Coupon expired 30 Apr 2026',
    syncedAt: '2026-10-10T09:42:00Z',
  },
];
