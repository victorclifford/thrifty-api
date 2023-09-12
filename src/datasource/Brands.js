import { MongoDataSource } from "apollo-datasource-mongodb";
import Brand from "../models/Brand.js";

class Brands extends MongoDataSource {
  constructor(options) {
    super(options);
    this.initialize({ cache: options.cache, context: options.token });
  }

  async addBrand(data) {
    return Brand.create(data);
  }

  async getBrands() {
    return Brand.find({});
  }

  async findBrandByName(string) {
    return Brand.findOne({ name: string });
  }

  async findBrandById(id) {
    return Brand.findById(id);
  }
}

export default Brands;
