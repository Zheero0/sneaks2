
import type { Service } from './types';
import type { ButtonProps } from '@/components/ui/button';

export const services: (Service & { buttonVariant: ButtonProps['variant'], bestValue?: boolean, features: string[] })[] = [
  {
    id: "standard",
    name: "Standard",
    description: "Our classic deep clean.",
    price: 30,
    features: ["Deep Clean", "Lace Cleaning", "Midsole Treatment", "Deodorization"],
    buttonVariant: "outline",
    bestValue: false,
  },
  {
    id: "express",
    name: "Express",
    description: "Standard clean with extras.",
    price: 40,
    features: [
      "Everything in Standard",
      "Minor Scuff Removal",
      "Protective Coating",
      "48-Hour Turnaround",
    ],
    buttonVariant: "default",
    bestValue: true,
  },
  {
    id: "sameday",
    name: "Same-Day VIP",
    description: "The full works, same day.",
    price: 50,
    features: [
      "Everything in Express",
      "Premium Restoration",
      "Waterproofing",
      "Same-Day Service",
    ],
    buttonVariant: "outline",
    bestValue: false,
  },
];

// Mock data for available booking slots
export const availableSlotsByDate: Record<string, string[]> = {
  // Dates are in 'yyyy-MM-dd' format
  [new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: ["09:00", "11:00", "14:00"],
  [new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: ["10:00", "12:00", "15:00", "17:00"],
  [new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: ["09:00", "13:00", "16:00"],
  [new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: ["11:00", "14:00"],
  [new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00"],
  [new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: ["10:00", "12:00", "15:00", "17:00"],
};
