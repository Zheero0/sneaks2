
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

    