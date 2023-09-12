import { MongoDataSource } from "apollo-datasource-mongodb";
import Order from "../models/Order.js";

class Orders extends MongoDataSource {
  constructor(options) {
    super(options);
    this.initialize({ cache: options.cache, context: options.token });
  }

  async createOrder(data) {
    return Order.create(data);
  }

  async getOrders() {
    return Order.find({});
  }
}

export default Orders;
