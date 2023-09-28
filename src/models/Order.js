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
    // stores user the ID of all sellers in the items of an order:helpful when finding seller orders
    sellers: {
      type: Array,
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
    delivery_details: {
      street_address: {
        type: String,
        required: true,
      },
      apt_or_suite_number: {
        type: String,
      },
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      additional_phone_number: {
        type: String,
      },
      special_instructions: {
        type: String,
      },
      zip_code: {
        type: String,
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
      default: 0,
    },
    accepted_by: {
      type: String,
    },
    is_settled: {
      type: Number,
      default: 0,
    },
    settlement_reason: {
      type: String,
    },
    is_rejected: {
      type: Number,
      default: 0,
    },
    rejection_reason: {
      type: String,
    },
    is_refunded: {
      type: Number,
      default: 0,
    },
    refund_reason: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
