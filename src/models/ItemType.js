import mongoose from "mongoose";

const Schema = mongoose.Schema;

const itemTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // category: { type: Schema.ObjectId, ref: "Category" },
    subcategory: { type: Schema.ObjectId, ref: "SubCategory" },
  },
  { timestamps: true }
);

export default mongoose.model("ItemType", itemTypeSchema);
