import DBService from "./db.service";
import { DBConfig } from "../config";
import { getIngredientType } from "../helpers/type";
import Ingredient from "../models/Ingredient";
import MappingService from "./mapping.service";
import IngredientProductMapping from "../models/IngredientProductMapping";
import { Request, TYPES } from "tedious";

export default class BatchService {
  mappingService: MappingService = new MappingService();

  async mapIngredients(batchSize: number = 5) {
    const mappings: IngredientProductMapping[] = [];

    let ingredientsToMap = await this.getIngredientsToMap(batchSize);
    if (ingredientsToMap && ingredientsToMap.length < batchSize) {
      const outdatedMapping = await this.getOutDatedMappings(
        batchSize - ingredientsToMap.length
      );
      if (outdatedMapping) {
        ingredientsToMap = ingredientsToMap.concat(outdatedMapping);
      }
    }

    for (const ingToMap of ingredientsToMap) {
      ingToMap.name = ingToMap.name ? ingToMap.name.trim() : ingToMap.name;
      const mapping = await this.mappingService.getProductMapping(
        ingToMap.name.trim(),
        ingToMap.metricQuantity,
        ingToMap.metricUnit
      );
      if (mapping) {
        let mappingData = {
          ingredientId: ingToMap.ingredientId,
          recipeId: ingToMap.recipeId,
          productId: mapping.productId,
          offerId: mapping.offerId,
          itemId: mapping.itemId,
          price: Number(mapping.salePrice),
          quantity: ingToMap.metricQuantity,
          exists: ingToMap.exists,
        };

        mappings.push(mappingData);

        try {
          ingToMap.exists
            ? this.updateMapping(mappingData)
            : this.insertMapping(mappingData);
        } catch (err) {
          console.log(
            "Error while updating/inserting mapping in database",
            err
          );
        }
      } else {
        try {
          this.updateMappingUpdateTime(
            ingToMap.ingredientId,
            ingToMap.recipeId
          );
        } catch (err) {
          console.log(
            "Error while updating mapping timestamp in database",
            err
          );
        }
      }
    }

    return mappings;
  }

  private async getIngredientsToMap(batchSize: number): Promise<Ingredient[]> {
    try {
      const dbService = new DBService(DBConfig);
      const connected = await dbService.connect();
      if (connected) {
        const type: Ingredient = getIngredientType();
        const results = await dbService.query(
          `SELECT TOP ${batchSize} i.RecipeId, i.IngredientId, i.Name, i.MetricQuantity, i.MetricUnit FROM [dbo].[Ingredients] i WHERE NOT EXISTS (SELECT 1 FROM IngredientProductMapping ipm WHERE ipm.RecipeId = i.RecipeId AND ipm.IngredientId = i.IngredientId);`,
          type
        );
        return results;
      }
    } catch (err) {
      console.log("Error while fetching ingredients to map", err);
      return;
    }
  }

  private async getOutDatedMappings(batchSize: number): Promise<Ingredient[]> {
    try {
      const dbService = new DBService(DBConfig);
      const connected = await dbService.connect();
      if (connected) {
        const type: Ingredient = getIngredientType();
        const results = await dbService.query(
          `SELECT TOP ${batchSize} i.RecipeId, i.IngredientId, i.Name, i.MetricQuantity, i.MetricUnit, CAST(1 AS BIT) AS [Exists] FROM [dbo].[Ingredients] i JOIN [dbo].[IngredientProductMapping] ipm ON i.RecipeId = ipm.RecipeId AND i.IngredientId = ipm.IngredientId WHERE DATEDIFF(day, ipm.UpdtaedOnUtc, GETDATE()) > 1;`,
          type
        );
        return results;
      }
    } catch (err) {
      console.log("Error while fetching outdated mappings", err);
      return;
    }
  }

  private async insertMapping(mapping: IngredientProductMapping) {
    try {
      const dbService = new DBService(DBConfig);
      const connected = await dbService.connect();
      if (connected) {
        const sql = `INSERT INTO IngredientProductMapping (RecipeId, IngredientId, ProductId, ItemId, OfferId, Price, Quantity, CreatedOnUtc, UpdtaedOnUtc) VALUES (@recipeId, @ingredientId, @productId, @itemId, @offerId, @price, @quantity, @createdOnUtc, @updtaedOnUtc)`;

        const request = new Request(sql, (err, rowCount) => {
          if (err) {
            throw err;
          }
        });

        request.on("requestCompleted", () => {
          dbService.disconnect();
          return true;
        });

        const timestamp = new Date().toUTCString();

        request.addParameter("recipeId", TYPES.BigInt, mapping.recipeId);
        request.addParameter(
          "ingredientId",
          TYPES.BigInt,
          mapping.ingredientId
        );
        request.addParameter("productId", TYPES.NVarChar, mapping.productId);
        request.addParameter("itemId", TYPES.NVarChar, mapping.itemId);
        request.addParameter("offerId", TYPES.NVarChar, mapping.offerId);
        request.addParameter("price", TYPES.Decimal, mapping.price);
        request.addParameter("quantity", TYPES.Int, 1);
        request.addParameter("createdOnUtc", TYPES.DateTime2, timestamp);
        request.addParameter("updtaedOnUtc", TYPES.DateTime2, timestamp);

        dbService.execute(request);
      }
    } catch (err) {
      console.log("Error while inserting product mappings", err);
      return;
    }
  }

  private async updateMapping(mapping: IngredientProductMapping) {
    try {
      const dbService = new DBService(DBConfig);
      const connected = await dbService.connect();
      if (connected) {
        const sql = `UPDATE IngredientProductMapping SET ProductId = @productId, ItemId = @itemId, OfferId = @offerId, Price = @price, UpdtaedOnUtc = @updtaedOnUtc WHERE RecipeId = @recipeId AND IngredientId = @ingredientId`;

        const request = new Request(sql, (err, rowCount) => {
          if (err) {
            throw err;
          }
        });

        request.on("requestCompleted", () => {
          dbService.disconnect();
          return true;
        });

        const timestamp = new Date().toUTCString();

        request.addParameter("recipeId", TYPES.BigInt, mapping.recipeId);
        request.addParameter(
          "ingredientId",
          TYPES.BigInt,
          mapping.ingredientId
        );
        request.addParameter("productId", TYPES.NVarChar, mapping.productId);
        request.addParameter("itemId", TYPES.NVarChar, mapping.itemId);
        request.addParameter("offerId", TYPES.NVarChar, mapping.offerId);
        request.addParameter("price", TYPES.Decimal, mapping.price);
        request.addParameter("updtaedOnUtc", TYPES.DateTime2, timestamp);

        dbService.execute(request);
      }
    } catch (err) {
      console.log("Error while updating product mappings", err);
      return;
    }
  }

  private async updateMappingUpdateTime(
    ingredientId: number,
    recipeId: number
  ) {
    try {
      const dbService = new DBService(DBConfig);
      const connected = await dbService.connect();
      if (connected) {
        const sql = `UPDATE IngredientProductMapping SET UpdtaedOnUtc = @updtaedOnUtc WHERE RecipeId = @recipeId AND IngredientId = @ingredientId`;

        const request = new Request(sql, (err, rowCount) => {
          if (err) {
            throw err;
          }
        });

        request.on("requestCompleted", () => {
          dbService.disconnect();
          return true;
        });

        const timestamp = new Date().toUTCString();

        request.addParameter("recipeId", TYPES.BigInt, recipeId);
        request.addParameter("ingredientId", TYPES.BigInt, ingredientId);
        request.addParameter("updtaedOnUtc", TYPES.DateTime2, timestamp);

        dbService.execute(request);
      }
    } catch (err) {
      console.log("Error while updating product mappings", err);
      return;
    }
  }
}
