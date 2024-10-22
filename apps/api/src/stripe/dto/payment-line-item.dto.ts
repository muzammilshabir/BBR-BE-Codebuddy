import { ProductData } from "./product-data";

export class PaymentLineItemDto {
  price_data: {
    currency: 'usd';
    product_data: ProductData;
    unit_amount: number;
  };
}
