import DBService from "./db.service";
import { DBConfig } from "../config";
import Mapping from "../models/Mapping";
import Product from "../models/Product";
import { getProductType, getMappingType } from "../helpers/type";
import units from "../data/units.json";
import conversion from "../data/conversion.json";

export default class MappingService {
  private readonly unitsData: { name: string; aka: string[] }[] = units;
  private readonly conversionData: {
    from: string;
    to: string;
    rate: number;
  }[] = conversion;

  async getProductMapping(ingredient: string, size: number, unit: string) {
    const mappings = await this.getMapping(ingredient);
    if (mappings && mappings.length) {
      let walmartProducts = await this.getWalmartProducts(mappings[0].query);
      if (walmartProducts && walmartProducts.length > 1) {
        walmartProducts = walmartProducts.filter(
          (p) => p.size && p.size.length > 0 && p.unit && p.unit.length > 0
        );

        const userStandardUnit = this.getStandardisedUnit(unit);
        let userQuantityInGram = this.convertIntoGram(size, userStandardUnit);

        if (!userQuantityInGram && mappings[0].WeightPerUnit_g) {
          userQuantityInGram = size * Number(mappings[0].WeightPerUnit_g);
        }

        walmartProducts.forEach((wp) => {
          const [wpSize, wpUnit] = this.getSizeAndUnit(wp.size);
          const standardUnit = this.getStandardisedUnit(wpUnit || wp.unit);
          const sizeInGram = this.convertIntoGram(wpSize, standardUnit);

          if (sizeInGram) {
            wp.sizeInGram = sizeInGram;
          } else if (mappings[0].WeightPerUnit_g) {
            wp.sizeInGram = wpSize * Number(mappings[0].WeightPerUnit_g);
          }
        });

        const sizeMatchedProducts = walmartProducts.filter(
          (wp) => wp.sizeInGram >= userQuantityInGram
        );

        const notEnoughQuantityArray = walmartProducts.filter(
          (wp) => wp.sizeInGram < userQuantityInGram
        );

        notEnoughQuantityArray.forEach((element) => {
          let qtToBeAdded = Math.ceil(userQuantityInGram / element.sizeInGram);
          element.salePrice = "" + Number(element.salePrice) * qtToBeAdded;
          element.sizeInGram = Number(element.sizeInGram) * qtToBeAdded;
        });

        sizeMatchedProducts.concat(notEnoughQuantityArray);

        sizeMatchedProducts.sort((a, b) => +a.salePrice - +b.salePrice);

        return sizeMatchedProducts[0];
      }
      return walmartProducts;
    } else {
      return; // admin notification
    }
  }

  private async getMapping(ingredient: string): Promise<Mapping[]> {
    try {
      const query = `SELECT TOP 1 Name, NameKey, Query FROM [dbo].[Mapping] WHERE Name = '${ingredient}' OR NameKey = '${ingredient}' AND Query IS NOT NULL`;
      const dbService = new DBService(DBConfig);
      const connected = await dbService.connect();
      if (connected) {
        const type: Mapping = getMappingType();
        const results = await dbService.query(query, type);
        return results;
      }
    } catch (err) {
      console.log("Error while fetching walmart products", err);
      return;
    }
  }

  private async getWalmartProducts(query: string): Promise<Product[]> {
    try {
      const dbService = new DBService(DBConfig);
      const connected = await dbService.connect();
      if (connected) {
        const type: Product = getProductType();
        const results = await dbService.query(query, type);
        return results;
      }
    } catch (err) {
      console.log("Error while fetching walmart products", err);
      return;
    }
  }

  private getStandardisedUnit(unit: string) {
    const match = this.unitsData.find((ud) =>
      ud.aka.includes(unit.toLocaleLowerCase())
    );
    if (match) {
      return match.name;
    } else {
      console.log("no match found for ", unit);
      return unit;
    }
  }

  private getSizeAndUnit(wpSize: string): [size: number, unit?: string] {
    const regex = new RegExp(/([0-9.\/]+)([a-zA-z\s]+)*/);
    const matches = regex.exec(wpSize);
    if (matches && matches.length > 0) {
      return [+matches[1], matches[2] ? matches[2].trim() : null];
    } else {
      return [parseFloat(wpSize)];
    }
  }

  private convertIntoGram(wpSize: number, wpUnit: string) {
    const conversionRate = this.conversionData.find((cd) => {
      return cd.from === wpUnit;
    });
    if (conversionRate && conversionRate.rate) {
      return wpSize * conversionRate.rate;
    } else return null;
  }
}
