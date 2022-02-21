export default interface Ingredient {
  Id: number;
  recipeId: number;
  ingredientId: number;
  name: string;
  metricQuantity: number;
  metricUnit: string;
}
