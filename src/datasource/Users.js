import { MongoDataSource } from "apollo-datasource-mongodb";
import User from "../models/User.js";

class Users extends MongoDataSource {
  constructor(options) {
    super(options);
    this.initialize({ cache: options.cache, context: options.token });
  }

  async addUser(data) {
    return User.create(data);
  }

  async findUserByEmail(email) {
    return User.findOne({ email: email });
  }

  async findUserById(userId) {
    return User.findById(userId);
  }

  async getUserByVerificationCodeAndId(verificationCode, userId) {
    return User.findOne({
      _id: userId,
      verification_code: verificationCode,
      verificationExpiry: { $gt: Date.now() },
    });
  }

  async getUserByResetCodeAndId(code, userId) {
    return User.findOne({
      _id: userId,
      resetPasswordCode: code,
      resetPasswordExpiration: { $gt: Date.now() },
    });
  }
}

export default Users;
