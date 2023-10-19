import TransactionRecord from "../models/TransactionRecord.js";
import { MongoDataSource } from "apollo-datasource-mongodb";

class TransactionRecords extends MongoDataSource {
  constructor(options) {
    super(options);
    this.initialize({ cache: options.cache, context: options.token });
  }
  async createRecord(newRecord) {
    const tnx_record = new TransactionRecord(newRecord);
    await tnx_record.save();
    return tnx_record;
  }

  async getUserTnxRecords(id) {
    return TransactionRecord.find({ owner: id }).sort({ _id: -1 }).exec();
  }

  async getUserRefundedTnxRecordForOrder(userId, orderId) {
    return TransactionRecord.findOne({
      owner: userId,
      order: orderId,
      transaction: "Refund",
      type: "credit",
    });
  }

  async getUserReversedTnxRecordForOrder(userId, orderId) {
    return TransactionRecord.findOne({
      owner: userId,
      order: orderId,
      transaction: "Payment Reversal",
      type: "credit",
    });
  }

  async getUserLastPurchaseTnxRecord(id) {
    return TransactionRecord.find({
      owner: id,
      transaction: { $regex: "purchase", $options: "i" },
    })
      .sort({ _id: -1 })
      .exec();
  }

  getUserTnxRecordWithinRange(userId, startDate, endDate) {
    return TransactionRecord.find({
      owner: userId,
      createdAt: {
        $gte: new Date(startDate).toISOString(),
        $lte: new Date(endDate).toISOString(),
      },
    })
      .sort({ _id: -1 })
      .exec();
  }
}

export default TransactionRecords;
