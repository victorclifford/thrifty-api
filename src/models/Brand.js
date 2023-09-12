import mongoose from "mongoose";

const Schema = mongoose.Schema;

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    abbreviation: {
      type: String,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Brand", brandSchema);
