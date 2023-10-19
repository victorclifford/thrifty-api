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

  async getOrdersById(id) {
    return Order.findById(id);
  }

  async getOrderByPaymentRef(ref) {
    return Order.findOne({
      payment_ref: ref,
    });
  }

  async getOrdersAsBuyer(id) {
    return Order.find({ owner: id });
  }

  async deleteAllOrders() {
    return Order.deleteMany({});
  }

  async getOrdersAsSeller(id) {
    try {
      return Order.find({ sellers: id });
    } catch (error) {
      console.log("err-fs::", error);
    }
  }
}

export default Orders;
