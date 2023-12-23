import { MongoDataSource } from "apollo-datasource-mongodb";
import Discount from "../models/Discount.js";

class Discounts extends MongoDataSource {
  constructor(options) {
    super(options);
    this.initialize({ cache: options.cache, context: options.token });
  }

  async addDiscount(data) {
    return Discount.create(data);
  }

  async getDiscounts() {
    return Discount.find({});
  }

  async getDiscount(id) {
    return Discount.findById(id);
  }
}

export default Discounts;
