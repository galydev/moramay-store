/** Wompi API response for a Payment Source (tokenized payment method). */
export interface WompiPaymentSource {
  id: number;
  status: 'PENDING' | 'AVAILABLE' | 'DECLINED';
  customer_email: string;
  token: string;
  type: string;
}

/** Wompi API response for a Transaction (charge). */
export interface WompiTransaction {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED';
  amount_in_cents: number;
  reference: string;
  payment_source_id?: number;
}

export interface CreatePaymentSourceParams {
  /** Tokenized card/nequi token obtained client-side via Wompi.js (`tok_...`). */
  acceptanceToken: string;
  paymentToken: string;
  customerEmail: string;
  type: 'CARD' | 'NEQUI';
}

export interface ChargeWithSourceParams {
  amountInCents: number;
  currency: 'COP';
  customerEmail: string;
  paymentSourceId: number;
  reference: string;
}
