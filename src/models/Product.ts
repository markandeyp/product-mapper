export default interface Product {
  id: number;
  productId: string;
  itemId: string;
  offerId: string;
  name: string;
  salePrice: string;
  size: string;
  unit: string;
  convertedSize?: number;
  sizeInGram?: number;
}
