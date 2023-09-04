import { MongoDataSource } from "apollo-datasource-mongodb";
import ItemType from "../models/ItemType.js";

class ItemTypes extends MongoDataSource {
  constructor(options) {
    super(options);
    this.initialize({ cache: options.cache, context: options.token });
  }

  async addItemType(data) {
    return ItemType.create(data);
  }

  async findItemTypeByName(string) {
    return ItemType.findOne({ name: string });
  }
}

export default ItemTypes;
