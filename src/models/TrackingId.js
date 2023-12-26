import mongoose from "mongoose";

const Schema = mongoose.Schema;

const trackingIdSchema = new Schema(
  {
    tracking_id: {
      type: String,
      required: true,
    },
    order: { type: Schema.ObjectId, ref: "Order", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("TrackingId", trackingIdSchema);
