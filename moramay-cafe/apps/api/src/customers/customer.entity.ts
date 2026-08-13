export type CustomerCreatedVia = 'self_registered' | 'guest_checkout';

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  nationalId: string | null;
  phone: string | null;
  billingAddress: string | null;
  shippingAddress: string | null;
  city: string | null;
  createdVia: CustomerCreatedVia;
  createdAt: string;
  updatedAt: string;
}
