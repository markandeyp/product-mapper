import Mapping from "../models/Mapping";
import Product from "../models/Product";

export function getProductType(): Product {
  const type: Product = {
    id: 0,
    productId: "",
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
