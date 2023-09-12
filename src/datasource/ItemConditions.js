import { MongoDataSource } from "apollo-datasource-mongodb";
import ItemCondition from "../models/ItemCondition.js";

class ItemConditions extends MongoDataSource {
  constructor(options) {
    super(options);
    this.initialize({ cache: options.cache, context: options.token });
  }

  async addItemCondition(data) {
    return ItemCondition.create(data);
  }

  async getItemConditions() {
    return ItemCondition.find({});
  }

  async findItemConditionByName(string) {
    return ItemCondition.findOne({ name: string });
  }

  async findItemConditionId(id) {
    return ItemCondition.findById(id);
  }
}

export default ItemConditions;
