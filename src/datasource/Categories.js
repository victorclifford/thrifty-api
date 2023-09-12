import { MongoDataSource } from "apollo-datasource-mongodb";
import Category from "../models/Category.js";

class Categories extends MongoDataSource {
  constructor(options) {
    super(options);
    this.initialize({ cache: options.cache, context: options.token });
  }

  async addCategory(data) {
    return Category.create(data);
  }

  async findCategoryByName(string) {
    return Category.findOne({ name: string });
  }

  async findCategoryById(id) {
    return Category.findById(id);
  }

  async getCategories() {
    return Category.find({});
  }
}

export default Categories;
