import mongoose from "mongoose";
import crypto from "crypto";
import config from "../utils/config.js";

const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    country: {
      type: String,
      // required: true,
    },
    face_id: {
      type: String,
    },
    fcm_token: {
      type: [String],
      default: [],
    },
    show_face_id: {
      type: Boolean,
      default: true,
    },
    profile_picture: {
      type: String,
    },
    gender: {
      type: Number,
    },
    isVerified: {
      type: Number,
      default: 0,
    },
    content_preference: {
      type: Array,
      default: [],
    },
    verification_code: String,
    verificationExpiry: Date,
    resetPasswordCode: String,
    resetPasswordExpiration: Date,
  },
  { timestamps: true }
);

//method to generate the reset password token
UserSchema.methods.getResetCode = function () {
  //generating a secure random 6-digit code to be sent to user
  const resetCode = crypto
    .randomInt(0, 1000000)
    .toString()
    .padStart(6, config.FILL_STRING);

  //hash reset code (*will be saved and used to find user*)
  this.resetPasswordCode = crypto
    .createHmac("sha256", config.RESET_SALT)
    .update(resetCode)
    .digest("hex");

  //setting the token expiry
  this.resetPasswordExpiration = Date.now() + 60 * (60 * 1000);

  return {
    resetCode,
    // hashedResetCode,
  };
};

//method to generate verification code
UserSchema.methods.getVerificationCode = function () {
  const verificationCode = crypto
    .randomInt(0, 1000000)
    .toString()
    .padStart(6, config.FILL_STRING);

  //hashing verification code (*will be saved and used to find user*)
  this.verification_code = crypto
    .createHmac("sha256", config.RESET_SALT)
    .update(verificationCode)
    .digest("hex");

  //setting the verification code expiry
  this.verificationExpiry = Date.now() + 60 * 24 * (60 * 1000);

  return verificationCode;
};

export default mongoose.model("User", UserSchema);
