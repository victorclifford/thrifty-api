import { MongoDataSource } from "apollo-datasource-mongodb";
import SubCategory from "../models/SubCategory.js";

class SubCategories extends MongoDataSource {
  constructor(options) {
    super(options);
    this.initialize({ cache: options.cache, context: options.token });
  }

  async addSubCategory(data) {
    return SubCategory.create(data);
  }

  async findSubCategoryByName(string) {
    return SubCategory.findOne({ name: string });
  }

  async findSubCategoryById(id) {
    return SubCategory.findById(id);
  }

  async findSubCategoryByCategoryId(id) {
    return SubCategory.find({ category: id });
  }
}

export default SubCategories;
