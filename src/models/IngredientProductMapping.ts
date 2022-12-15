export default interface IngredientProductMapping {
  id?: number;
  recipeId: number;
  ingredientId: number;
  productId: string;
  itemId: string;
  offerId: string;
  price: number;
  quantity: number;
  createdOnUtc?: string;
  updtaedOnUtc?: string;
  exists?: boolean;
}
