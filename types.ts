export interface Product {
  id: string;
  name: string;
  category: 'Bridal' | 'Party Wear' | 'Sangeet' | 'Reception';
  price: number; // Rental price per day
  originalPrice: number; // For comparison
  description: string;
  image: string;
  available: boolean;
  size: string;
}

export interface FilterState {
  category: string;
  maxPrice: number;
}