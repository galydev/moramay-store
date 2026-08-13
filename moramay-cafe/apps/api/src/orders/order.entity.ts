export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string | null;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingCity: string;
  shippingAddress: string;
  paymentReference: string | null;
  placedAsGuest: boolean;
  guestFullName: string | null;
  guestEmail: string | null;
  guestNationalId: string | null;
  guestPhone: string | null;
  createdAt: string;
  updatedAt: string;
}
