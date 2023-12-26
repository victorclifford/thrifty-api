import mongoose from "mongoose";

const Schema = mongoose.Schema;

const itemSchema = new Schema(
  {
    owner: { type: Schema.ObjectId, ref: "User", required: true },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    size: {
      type: String,
    },
    color: {
      type: String,
    },
    quantity_in_stock: {
      type: Number,
      default: 1,
    },
    cover_image: {
      type: String,
      required: true,
    },
    other_snapshots: {
      type: Array,
      default: [],
    },
    price: {
      type: Number,
      required: true,
    },
    min_offer: {
      type: Number,
      required: true,
    },
    brand: { type: Schema.ObjectId, ref: "Brand" },
    condition: { type: Schema.ObjectId, ref: "ItemCondition" },

    category: { type: Schema.ObjectId, ref: "Category" },
    subcategory: { type: Schema.ObjectId, ref: "SubCategory" },
    item_type: { type: Schema.ObjectId, ref: "ItemType" },
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
