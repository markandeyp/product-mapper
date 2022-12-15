import Ingredient from "../models/Ingredient";
import IngredientProductMapping from "../models/IngredientProductMapping";
import Mapping from "../models/Mapping";
import Product from "../models/Product";

export function getProductType(): Product {
  const type: Product = {
    id: 0,
    productId: "",
    itemId: "",
    offerId: "",
    name: "",
    salePrice: "",
    size: "",
    unit: "",
  };

  return type;
}

export function getMappingType(): Mapping {
  const type: Mapping = {
    name: "",
    nameKey: "",
    query: "",
  };

  return type;
}

export function getIngredientProductMappingType(): IngredientProductMapping {
  const type: IngredientProductMapping = {
    id: 0,
    recipeId: 0,
    ingredientId: 0,
    productId: "",
    itemId: "",
    offerId: "",
    price: 0.0,
    quantity: 0,
    createdOnUtc: "",
    updtaedOnUtc: "",
  };

  return type;
}

export function getIngredientType(): Ingredient {
  const type: Ingredient = {
    id: 0,
    recipeId: 0,
    ingredientId: 0,
    name: "",
    metricQuantity: 0,
    metricUnit: "",
    exists: false,
  };

  return type;
}
