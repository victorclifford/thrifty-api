import { MongoDataSource } from "apollo-datasource-mongodb";
import Item from "../models/Item.js";

class Items extends MongoDataSource {
  constructor(options) {
    super(options);
    this.initialize({ cache: options.cache, context: options.token });
  }

  async addItem(data) {
    return Item.create(data);
  }

  async getItems() {
    return Item.find({});
  }

  async getItem(id) {
    return Item.findById(id);
  }

  async findItemsByItemTypeId(id) {
    return Item.find({ item_type: id });
  }

  async findListOfItemsById(ids) {
    let items = [];
    for (const id of ids) {
      const item = await Item.findById(id);
      if (item) items.push(item);
    }
    return items;
  }
}

export default Items;
