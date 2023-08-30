import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "./utils/sendEmail.js";
import config from "./utils/config.js";
import {
  slugify,
  toTitleCase,
  generateRandom4DigitNumber,
} from "../library/utilityFunctionsLibrary.js";
import {
  registerSchema,
  sixDigitCodeSchema,
} from "./helpers/validationSchemas.js";

const resolvers = {
  Mutation: {
    // mutations here...
    async registerUser(_, { inputData }, { dataSources }, info) {
      try {
        //validations
        try {
          await registerSchema.validate(inputData, { abortEarly: true });
        } catch (error) {
          return {
            code: 400,
            success: false,
            message: error.message,
          };
        }

        //check for duplicate email
        const userExists = await dataSources.Users.findUserByEmail(
          inputData.email
        );
        if (userExists) {
          return {
            code: 409,
            success: false,
            message: "This email already exists",
          };
        }

        const hashedPassword = await bcrypt.hash(inputData.password, 10);
        const slugifiedName = slugify(
          `${inputData.firstname} ${
            inputData.lastname
          } ${generateRandom4DigitNumber()}`
        );

        const userData = {
          firstname: toTitleCase(inputData.firstname),
          lastname: toTitleCase(inputData.lastname),
          slug: slugifiedName,
          gender: inputData.gender,
          email: inputData.email,
          mobile: inputData.mobile,
          password: hashedPassword,
        };

        const user = await dataSources.Users.addUser(userData);

        if (user) {
          //check if there is fcm and add new fcm for user here

          //get verification code and send mail
          const verificationCode = await user.getVerificationCode();
          await user.save();

          //send Email containing verification code
          sendEmail({
            to: user.email,
            subject: "Activate Your Thrifty Account",
            verificationCode,
            template: "welcome",
          });

          return {
            code: 201,
            success: true,
            message: "Please check your inbox to verify your email",
            userId: user._id,
          };
        }
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },
    async login(_, { email, password }, { dataSources }, info) {
      try {
        const user = await dataSources.Users.findUserByEmail(
          email.toLowerCase()
        );

        if (!user) {
          return {
            code: 404,
            success: false,
            message: "Invalid email or password",
          };
        } else {
          // compare password
          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) {
            return {
              code: 400,
              success: false,
              message: "Invalid email or password",
            };
          }
          //continue with login process if password is valid
          // return jwt
          const token = jwt.sign(
            { id: user._id, email: user.email },
            config.JWT_SECRET,
            { expiresIn: "1d" }
          );

          console.log({ token });

          //checking if user is verified
          if (user.isVerified !== 1) {
            return {
              userId: user._id,
              isVerified: user.isVerified,
              message: "Please verify your account to continue",
              code: 403,
              success: false,
            };
          }

          //return auth response if user is verified
          return {
            token: token,
            isVerified: user.isVerified,
            user,
            message: "Authentication Succesful",
            code: 200,
            success: true,
          };
        }
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },

    userVerification: async (_, args, { dataSources }) => {
      try {
        const { verificationCode, userId } = args;

        //validate
        await sixDigitCodeSchema.validate(
          { code: verificationCode },
          {
            abortEarly: true,
          }
        );

        //checking if ID is a valid mongoose type
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return {
            code: 400,
            success: false,
            message: "Invalid User ID!",
          };
        }
        const hashCode = crypto
          .createHmac("sha256", config.RESET_SALT)
          .update(verificationCode)
          .digest("hex");

        //finding user by validated args
        const user = await dataSources.Users.getUserByVerificationCodeAndId(
          hashCode,
          userId
        );

        //returning response if code is invalid, or expired
        if (!user) {
          return {
            code: 400,
            success: false,
            message: "Invalid Or Expired verification Code!",
          };
        }

        //if code is valid, and user was found, then update fields
        user.isVerified = 1;
        user.verification_code = undefined;
        // return jwt
        const token = jwt.sign(
          { id: user._id, email: user.email },
          config.JWT_SECRET,
          { expiresIn: "1d" }
        );

        await user.save();

        //finally return response
        return {
          token,
          isVerified: user.isVerified,
          user,
          userId: user._id,
          message: "Authentication succesful",
          code: 200,
          success: true,
        };
      } catch (error) {
        return {
          code: 400,
          success: false,
          message: error.message,
        };
      }
    },

    async requestUserVerification(_, { userId }, { dataSources }, info) {
      try {
        //validations
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return {
            code: 400,
            success: false,
            message: "Invalid User ID!",
          };
        }

        //find user
        const user = await dataSources.Users.findUserById(userId);
        if (!user) {
          return {
            code: 404,
            success: false,
            message: "User not found!",
          };
        }

        //if user is already verified log user in again without doing anything
        if (user.isVerified) {
          // return jwt
          const token = jwt.sign(
            { id: user._id, email: user.email },
            config.JWT_SECRET,
            { expiresIn: "1d" }
          );

          await user.save();

          //finally return response
          return {
            token,
            isVerified: user.isVerified,
            user,
            userId: user._id,
            message: "Authentication succesful. You have already been verified",
            code: 200,
            success: true,
          };
        } else {
          // generate verification code
          const verificationCode = await user.getVerificationCode();
          await user.save();

          //send Email containing verification code
          sendEmail({
            to: user.email,
            subject: "Activate Your Thrifty Account",
            verificationCode,
            template: "welcome",
          });

          return {
            code: 200,
            success: true,
            message:
              "Verification Code sent successfully. Please check your Inbox",
          };
        }
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },
  },
  Query: {
    // queries here...
    async getUsers(_, args, ctx, info) {
      return "user query called";
    },
  },

  //resolver chaining here...
};

export default resolvers;
