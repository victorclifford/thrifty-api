import mongoose from "mongoose";

const Schema = mongoose.Schema;

const itemConditionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ItemCondition", itemConditionSchema);
