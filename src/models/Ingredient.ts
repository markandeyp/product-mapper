export default interface Ingredient {
  id: number;
  recipeId: number;
  ingredientId: number;
  name: string;
  metricUnit: string;
  metricQuantity: number;
  exists: boolean;
}
