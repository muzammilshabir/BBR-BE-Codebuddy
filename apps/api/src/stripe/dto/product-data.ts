export class ProductData {
    name: string;
    description: string;
    metadata: {
      type: 'listing' | 'ranked' | 'featured';
      id: string;
    };
}
