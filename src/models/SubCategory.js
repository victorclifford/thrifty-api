import mongoose from "mongoose";

const Schema = mongoose.Schema;

const subcategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: { type: Schema.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

export default mongoose.model("SubCategory", subcategorySchema);
