import { Search, Smartphone, BatteryCharging, Sparkles } from 'lucide-react';

export const defaultServices = [
  {
    id: 'srv-1',
    name: 'Diagnóstico Técnico',
    duration: '1-2 horas',
    price: 0,
    priceLabel: '$0 COP',
    icon: Search,
  },
  {
    id: 'srv-2',
    name: 'Cambio de Pantalla',
    duration: '2-4 horas',
    price: 250000,
    priceLabel: 'Desde $250.000 COP',
    icon: Smartphone,
  },
  {
    id: 'srv-3',
    name: 'Cambio de Batería',
    duration: '1-2 horas',
    price: 120000,
    priceLabel: 'Desde $120.000 COP',
    icon: BatteryCharging,
  },
  {
    id: 'srv-4',
    name: 'Mantenimiento Preventivo',
    duration: '2-3 horas',
    price: 85000,
    priceLabel: '$85.000 COP',
    icon: Sparkles,
  },
];
