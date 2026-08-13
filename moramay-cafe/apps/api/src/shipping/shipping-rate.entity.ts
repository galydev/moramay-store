/**
 * A configured shipping rate for a specific city (or the `default` fallback
 * used for any city not explicitly configured).
 */
export interface ShippingRate {
  id: string;
  city: string;
  rate: number;
  updatedAt: string;
}
