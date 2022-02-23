export default interface Product {
  id: number;
  productId: string;
  name: string;
  salePrice: string;
  size: string;
  unit: string;
  convertedSize?: number;
  sizeInGram?: number;
}
