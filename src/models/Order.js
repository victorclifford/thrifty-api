import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    owner: { type: Schema.ObjectId, ref: "User", required: true },
    items: [{ type: Schema.ObjectId, ref: "ItemType", required: true }],
    total_price_paid: {
      type: Number,
      required: true,
    },
    item_quantity: [
      {
        item: { type: Schema.ObjectId, ref: "ItemType", required: true },
        qty: {
          type: Number,
        },
      },
    ],
    price_breakdown: {
      total_items_price: {
        type: Number,
        required: true,
      },
      platform_percentage: {
        type: String,
        required: true,
      },
      platform_fee: {
        type: Number,
        required: true,
      },
      delivery_fee: {
        type: Number,
        required: true,
      },
      total_accumulated_price: {
        type: Number,
        required: true,
      },
    },
    is_sent_out: {
      type: Number,
      default: 0,
    },
    is_recieved: {
      type: Number,
      default: 0,
    },
    is_accepted: {
      type: Number,
    },
    is_rejected: {
      type: Number,
      default: 0,
    },
    is_refunded: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
