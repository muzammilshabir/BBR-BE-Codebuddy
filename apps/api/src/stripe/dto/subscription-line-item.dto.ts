import { ProductData } from "./product-data";

export class SubscriptionLineItemDto {
  price_data: {
    currency: 'usd';
    product_data: ProductData;
    unit_amount: number;
    recurring: {
      interval:  'day' | 'week' | 'month' | 'year';
      interval_count: number;
    },
  };
  quantity: number;
}
