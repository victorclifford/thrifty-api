import mongoose from "mongoose";

const Schema = mongoose.Schema;

const discountSchema = new Schema(
  {
    itemQty: {
      type: Number,
      required: true,
    },
    percentage_off: {
      type: Number,
      required: true,
    },
    owner: { type: Schema.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Discount", discountSchema);
