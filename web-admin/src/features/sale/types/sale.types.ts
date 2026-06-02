export interface PosProduct {
  id: number;
  quantity_on_hand: number;

  variant: {
    id: number;
    sku: string;
    price_cents: number;

    attributes: Record<
      string,
      string
    >;

    product: {
      id: number;
      name: string;
      category: string;
      thumbnail_url: string | null;
    };
  };
}

export interface CartItem {
  variantId: number;

  productId: number;

  name: string;

  sku: string;

  price: number;

  stock: number;

  quantity: number;

  attributes?: Record<string, string>;
}

export interface Facility {
  id: number;
  name: string;
  address: string;
}

export interface CreateOrderPayload {
  facilityId: number;

  paymentMethod: string;

  note?: string;

  items: {
    variantId: number;
    quantity: number;
  }[];
}