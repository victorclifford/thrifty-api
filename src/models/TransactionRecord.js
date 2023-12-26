import mongoose from "mongoose";

const transactionRecord = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.ObjectId, ref: "Order" },
    transaction: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    payment_method: { type: String, required: true },
    reference: { type: mongoose.Schema.ObjectId },
    reference_type: { type: String },
    wallet_type: { type: Number, required: true },
    status: { type: Number },
    available_balance: { type: Number, required: true },
    pending_balance: { type: Number, required: true },
    discountPercentageOff: { type: String, default: ` (-0% off)` },
    details: { type: String, default: `` },
  },
  { timestamps: true }
);

export default mongoose.model("TransactionRecord", transactionRecord);
