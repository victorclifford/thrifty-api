import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "./utils/sendEmail.js";
import config from "./utils/config.js";
import {
  addDaysToCurrentDate,
  dateStringToReadableDate,
} from "../library/timeLibrary.js";
import {
  slugify,
  toTitleCase,
  generateRandom4DigitNumber,
  calculatePercentage,
} from "../library/utilityFunctionsLibrary.js";
import {
  registerSchema,
  sixDigitCodeSchema,
  emailSchema,
  passwordResetSchema,
  addCategorySchema,
  addSubCategorySchema,
  addItemTypeSchema,
  addItemConditionSchema,
  addBrandSchema,
  addItemSchema,
  PriceBreakdownchema,
  urlValidator,
  DeliveryDetailsSchema,
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
            firstname: user.firstname.toUpperCase(),
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
            { expiresIn: "3d" }
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
            firstname: user.firstname.toUpperCase(),
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
    forgetPassword: async (root, args, { dataSources }, info) => {
      try {
        const { email } = args;

        const user = await dataSources.Users.findUserByEmail(email);
        // console.log("user-log", customer);

        if (user) {
          try {
            //calling generate reserCode method on user Schema
            const { resetCode } = await user.getResetCode();

            await user.save();

            sendEmail({
              to: user.email,
              firstname: user.firstname.toUpperCase(),
              resetCode,
              subject: "Password Reset Request",
              template: "forget-password",
            });

            return {
              code: 200,
              success: true,
              message:
                "Cool, A reset code has been sent to your email. Please check your Inbox",
              userId: user._id,
            };
          } catch (error) {
            return {
              code: 400,
              success: false,
              message: "Unable to send mail",
            };
          }
        } else {
          return {
            code: 401,
            success: false,
            message:
              "If your email is correct and registered with Thrifty, you will recieve a mail from us",
          };
        }
      } catch (e) {
        return {
          code: 400,
          success: false,
          message: "an error occured",
        };
      }
    },

    resetPasswordVerification: async (_, args, { dataSources }) => {
      try {
        //validate reset code
        const { resetCode, userId } = args;
        try {
          await sixDigitCodeSchema.validate(
            { code: resetCode },
            {
              abortEarly: true,
            }
          );
        } catch (err) {
          return {
            code: 400,
            success: false,
            message: err.message,
          };
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return {
            code: 400,
            success: false,
            message: "Invalid User Id!",
          };
        }
        const resetPasswordCode = crypto
          .createHmac("sha256", config.RESET_SALT)
          .update(resetCode)
          .digest("hex");

        //find user by hashed reset code
        const user = await dataSources.Users.getUserByResetCodeAndId(
          resetPasswordCode,
          userId
        );

        if (!user) {
          return {
            code: 400,
            success: false,
            message: "Invalid or expired Reset Code",
          };
        }

        return {
          code: 200,
          success: true,
          message: "Code verification successful",
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },

    resetPassword: async (root, { resetData }, { dataSources }, info) => {
      const { resetCode, password, userId } = resetData;
      const resetSalt = config.RESET_SALT;

      try {
        //validating args
        try {
          await passwordResetSchema.validate(resetData, {
            abortEarly: true,
          });
          // console.log("validated>>", validatedData);
        } catch (err) {
          return {
            code: 400,
            success: false,
            message: err.message,
          };
        }

        //validate customerId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return {
            code: 400,
            success: false,
            message: "Invalid User ID!",
          };
        }

        const resetPasswordCode = crypto
          .createHmac("sha256", resetSalt)
          .update(resetCode)
          .digest("hex");

        //finding user with the reset code and making sure its not expired
        const user = await dataSources.Users.getUserByResetCodeAndId(
          resetPasswordCode,
          userId
        );
        if (!user) {
          return {
            code: 400,
            success: false,
            message: "Invalid Or Expired Reset Code",
          };
        }

        //if all went well, hash password
        const hashedNewPassword = await bcrypt.hash(password, 10);
        //update password and discard reset token and expiry
        user.password = hashedNewPassword;
        user.resetPasswordExpiration = undefined;
        user.resetPasswordCode = undefined;
        await user.save();
        //send password reset success email
        sendEmail({
          to: user.email,
          firstname: user.firstname.toUpperCase(),
          subject: "Password Reset Successful",
          template: "reset-success",
        });
        //finally return response
        return {
          code: 200,
          success: true,
          message: "Great! Your password has been reset Successfully",
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },

    createCategory: async (_, args, { dataSources }) => {
      try {
        //validations
        try {
          await addCategorySchema.validate(args, { abortEarly: true });
        } catch (err) {
          return {
            code: 400,
            success: false,
            message: err.message,
          };
        }

        //check if category with the exact same name already exists
        const categoryExists = await dataSources.Categories.findCategoryByName(
          toTitleCase(args.name)
        );

        if (categoryExists) {
          return {
            code: 409,
            success: false,
            message: "Another category with the same name, already exists!",
          };
        }

        //capitalize first letter of every word in category name
        args.name = toTitleCase(args.name);

        //create category
        const category = await dataSources.Categories.addCategory(args);
        if (!category) {
          return {
            code: 500,
            success: false,
            message: "Unable to perform operation at the moment!",
          };
        }

        //return success
        return {
          code: 201,
          success: true,
          message: "Category created successfully",
          category,
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },

    createSubCategory: async (_, args, { dataSources }) => {
      try {
        //validations
        if (!mongoose.Types.ObjectId.isValid(args.categoryId)) {
          return {
            code: 400,
            success: false,
            message: "Invalid Category ID",
          };
        }

        //check if category selected still exists
        const categoryExistsById =
          await dataSources.Categories.findCategoryById(args.categoryId);
        if (!categoryExistsById) {
          return {
            code: 404,
            success: false,
            message:
              "The selected Category does not exist, or may have been deleted permanently!",
          };
        }

        try {
          await addSubCategorySchema.validate(args, { abortEarly: true });
        } catch (err) {
          return {
            code: 400,
            success: false,
            message: err.message,
          };
        }

        //check if category with the exact same name already exists
        const subcategoryExists =
          await dataSources.SubCategories.findSubCategoryByName(
            toTitleCase(args.name)
          );

        if (subcategoryExists) {
          return {
            code: 409,
            success: false,
            message: "Another subcategory with the same name, already exists!",
          };
        }

        const data = {
          name: toTitleCase(args.name),
          category: args.categoryId,
        };

        //create category
        const subcategory = await dataSources.SubCategories.addSubCategory(
          data
        );
        if (!subcategory) {
          return {
            code: 500,
            success: false,
            message: "Unable to perform operation at the moment!",
          };
        }

        //return success
        return {
          code: 201,
          success: true,
          message: "SubCategory created successfully",
          subCategory: subcategory,
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },

    createItemType: async (_, { inputData }, { dataSources }) => {
      try {
        //validations
        const { categoryId, subcategoryId, name } = inputData;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          return {
            code: 400,
            success: false,
            message: "Invalid Category ID",
          };
        }

        if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
          return {
            code: 400,
            success: false,
            message: "Invalid SubCategory ID",
          };
        }

        try {
          await addItemTypeSchema.validate(inputData, { abortEarly: true });
        } catch (err) {
          return {
            code: 400,
            success: false,
            message: err.message,
          };
        }

        //check if subCategory selected still exists
        const subcategoryExistsById =
          await dataSources.SubCategories.findSubCategoryById(subcategoryId);
        if (!subcategoryExistsById) {
          return {
            code: 404,
            success: false,
            message:
              "The selected SubCategory does not exist, or may have been deleted permanently!",
          };
        }

        //extra check to make sure category passed is the same category stored on subcategory doc
        const catOnSub = await dataSources.Categories.findCategoryById(
          subcategoryExistsById.category
        );
        if (catOnSub._id.toString() != categoryId) {
          return {
            code: 400,
            success: false,
            message:
              "The selected Category does not match subcategories own category!",
          };
        }

        //check if item type with the exact same name already exists
        const itemTypeExists = await dataSources.ItemTypes.findItemTypeByName(
          toTitleCase(name)
        );

        if (itemTypeExists) {
          return {
            code: 409,
            success: false,
            message:
              "Another item type with the exact same name, already exists!",
          };
        }

        const data = {
          name: toTitleCase(name),
          subcategory: subcategoryId,
        };

        //create item type
        const itemType = await dataSources.ItemTypes.addItemType(data);
        if (!itemType) {
          return {
            code: 500,
            success: false,
            message: "Unable to perform operation at the moment!",
          };
        }

        //return success
        return {
          code: 201,
          success: true,
          message: "Item type created successfully",
          itemType,
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },

    createItemCondition: async (_, args, { dataSources }) => {
      try {
        //validations
        try {
          await addItemConditionSchema.validate(args, { abortEarly: true });
        } catch (err) {
          return {
            code: 400,
            success: false,
            message: err.message,
          };
        }

        //check if category with the exact same name already exists
        const conditionExists =
          await dataSources.ItemConditions.findItemConditionByName(
            toTitleCase(args.name)
          );

        if (conditionExists) {
          return {
            code: 409,
            success: false,
            message:
              "Another item condition with the same name, already exists!",
          };
        }

        //capitalize first letter of every word in condition name
        args.name = toTitleCase(args.name);

        //create category
        const itemCondition = await dataSources.ItemConditions.addItemCondition(
          args
        );
        if (!itemCondition) {
          return {
            code: 500,
            success: false,
            message: "Unable to perform operation at the moment!",
          };
        }

        //return success
        return {
          code: 201,
          success: true,
          message: "Item condition created successfully",
          itemCondition,
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },

    createBrand: async (_, { inputData }, { dataSources }) => {
      try {
        const { name, description, logo } = inputData;
        //validations
        try {
          await addBrandSchema.validate(inputData, { abortEarly: true });
        } catch (err) {
          return {
            code: 400,
            success: false,
            message: err.message,
          };
        }

        //check if category with the exact same name already exists
        const brandExists = await dataSources.Brands.findBrandByName(
          toTitleCase(name)
        );

        if (brandExists) {
          return {
            code: 409,
            success: false,
            message: "Another brand with the exact same name, already exists!",
          };
        }

        const data = {
          name: toTitleCase(name),
          description,
          logo,
        };

        //create category
        const brand = await dataSources.Brands.addBrand(data);
        if (!brand) {
          return {
            code: 500,
            success: false,
            message: "Unable to perform operation at the moment!",
          };
        }

        //return success
        return {
          code: 201,
          success: true,
          message: "Brand created successfully",
          brand,
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },
    addItem: async (_, { inputData }, { dataSources, loggedInUser }) => {
      try {
        //check token
        if (!loggedInUser) {
          return {
            code: 401,
            success: false,
            message: "Session Expired!",
            shoutty: null,
          };
        }

        console.log({ loggedInUser });

        const {
          other_snapshots,
          brand,
          condition,
          item_type,
          quantity_in_stock,
          price_breakdown,
        } = inputData;
        //validations

        if (!mongoose.Types.ObjectId.isValid(condition)) {
          return {
            code: 400,
            success: false,
            message: "Invalid item condition ID",
          };
        }

        if (!mongoose.Types.ObjectId.isValid(item_type)) {
          return {
            code: 400,
            success: false,
            message: "Invalid item type ID",
          };
        }

        //validate qty in stock
        if (!quantity_in_stock || quantity_in_stock < 1) {
          return {
            code: 400,
            success: false,
            message:
              "If this item is not in stock it cannot be uploaded yet. Make sure this item is available, and indicate how many before trying again.",
          };
        }

        //validate brand if any
        if (brand) {
          if (!mongoose.Types.ObjectId.isValid(brand)) {
            return {
              code: 400,
              success: false,
              message: "Invalid brand ID",
            };
          }
        }

        try {
          await addItemSchema.validate(inputData, { abortEarly: true });
          //   await PriceBreakdownchema.validate(price_breakdown, {
          //     abortEarly: true,
          //   });

          //validate other_snapshots if any
          if (other_snapshots?.length) {
            for (const url of other_snapshots) {
              await urlValidator.validate({ url }, { abortEarly: true });
            }
          }
        } catch (err) {
          return {
            code: 400,
            success: false,
            message: err.message,
          };
        }

        //get user
        const user = await dataSources.Users.findUserById(loggedInUser.id);
        if (!user) {
          return {
            code: 404,
            success: false,
            message: "User not found!",
          };
        }

        //prepare item data
        const data = {
          ...inputData,
          owner: user._id,
        };

        //create item
        const newItem = await dataSources.Items.addItem(data);
        if (!newItem) {
          return {
            code: 500,
            success: false,
            message: "Unable to perform operation at the moment!",
          };
        }

        //return success
        return {
          code: 201,
          success: true,
          message: "Item uploaded successfully",
          item: newItem,
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },

    createOrder: async (_, { inputData }, { dataSources, loggedInUser }) => {
      try {
        //check token
        if (!loggedInUser) {
          return {
            code: 401,
            success: false,
            message: "Session Expired!",
            shoutty: null,
          };
        }

        const { items, total_price_paid, price_breakdown, delivery_details } =
          inputData;
        //validations

        let itemIds = [];

        try {
          await PriceBreakdownchema.validate(price_breakdown, {
            abortEarly: true,
          });

          await DeliveryDetailsSchema.validate(delivery_details, {
            abortEarly: true,
          });

          //validate other_snapshots if any
          if (items?.length) {
            for (const item of items) {
              if (!mongoose.Types.ObjectId.isValid(item?.item)) {
                return {
                  code: 400,
                  success: false,
                  message: "Invalid item ID",
                };
              }
            }
          } else {
            return {
              code: 400,
              success: false,
              message: "item ID(s) cannot be empty!",
            };
          }
        } catch (err) {
          return {
            code: 400,
            success: false,
            message: err.message,
          };
        }

        //validate payment here...
        //...........

        //get user
        const user = await dataSources.Users.findUserById(loggedInUser.id);
        if (!user) {
          return {
            code: 404,
            success: false,
            message: "User not found!",
          };
        }

        const itemsPurchased = [];
        //modify qty to be even with stock
        for (const item of items) {
          itemIds.push(item.item);
          const itm = await dataSources.Items.getItem(item.item);
          if (itm) itemsPurchased.push(itm);
        }

        for (const item of items) {
          const itemToModify = itemsPurchased.find(
            (itm) => itm._id.toString() == item.item.toString()
          );
          //check if qty in stock is enough based on qty to be purchased
          if (
            itemToModify.quantity_in_stock === 0 ||
            itemToModify.quantity_in_stock < item.qty
          ) {
            return {
              code: 400,
              success: false,
              message: `Qty demanded exceeds qty in stock for item with ID: #${item.item}`,
            };
          }
        }

        //.................................................

        //modify qty of item by deducting qty purchased from qty in stock
        for (const item of items) {
          const itemToModify = itemsPurchased.find(
            (itm) => itm._id.toString() == item.item.toString()
          );

          itemToModify.quantity_in_stock =
            itemToModify.quantity_in_stock - item.qty;
          await itemToModify.save();
        }

        //prepare order data
        const platformPercentage = "10%";
        price_breakdown.platform_percentage = platformPercentage;
        price_breakdown.platform_fee = calculatePercentage(
          price_breakdown.total_items_price,
          platformPercentage.split("%")[0]
        );

        // console.log({ price_breakdown });

        price_breakdown.total_accumulated_price =
          price_breakdown.total_items_price +
          // price_breakdown.platform_fee +
          price_breakdown.delivery_fee;

        //get all sellers ID
        const allSellers = itemsPurchased.map(({ owner }) => owner.toString());
        // remove duplicate IDs
        const sellersSet = new Set(allSellers);
        //conver set bac to array
        const uniqueSellers = Array.from(sellersSet);

        const data = {
          owner: user._id,
          total_price_paid,
          price_breakdown,
          items: itemIds,
          item_quantity: items,
          sellers: uniqueSellers,
          delivery_details,
        };

        //create order
        const newOrder = await dataSources.Orders.createOrder(data);
        if (!newOrder) {
          return {
            code: 500,
            success: false,
            message: "Unable to perform operation at the moment!",
          };
        }

        //seller mailing...
        // console.log({ itemsPurchased });
        //adding seller data on the fly to item object, to be used to get personal details of seller
        function fetchSellerDetails() {
          return new Promise(async (resolve, reject) => {
            try {
              for (const product of itemsPurchased) {
                // Find seller by id and append email
                const seller = await dataSources.Users.findUserById(
                  product?.owner
                );
                // console.log({ seller });
                if (!seller) {
                  return reject({
                    code: 404,
                    success: false,
                    message: `Seller not found`,
                  });
                }

                product.owner = seller;
              }

              // All products have been processed successfully
              resolve(itemsPurchased);
            } catch (error) {
              reject(error);
            }
          });
        }

        const updatedItemsPurchased = await fetchSellerDetails();
        // console.log({ updatedItemsPurchased });

        //split purchased items into special arrays based on sellerEmail

        // Use reduce to group products by sellerEmail
        const itemsBySeller = updatedItemsPurchased.reduce(
          (result, product) => {
            // Find an existing group for the sellerEmail
            const group = result.find(
              (group) => group[0].owner.email === product.owner.email
            );

            if (group) {
              // Add the product to the existing group
              group.push(product);
            } else {
              // Create a new group with the product
              result.push([product]);
            }

            return result;
          },
          []
        );

        const pp = "10%"; //get current platform fee at that time from database instead of static val

        //for each seller found, process data for email sending
        for (const seller of itemsBySeller) {
          //first sum up the prices of all items to get the seller and platform shares
          // console.log("seller::", ...seller);
          const prices = seller.map(({ price }) => parseInt(price));
          const totalPriceOfItemsForASeller = prices.reduce(
            (accumulator, currentValue) => {
              return accumulator + currentValue;
            },
            0
          );

          const sellerMail = seller.map(({ owner }) => owner.email)[0];

          // console.log({ totalPriceOfItemsForASeller });

          //calculating platform fee(thrifty cut of shares)
          let pf = 0;

          //calculating seller cut
          let sellerCut = 0;
          let totalPrice = 0; //this will hold the value for price of items before deductions

          //get the qty of the particular item in each iteration and append to seller item
          function addItmQty() {
            return new Promise(async (resolve, reject) => {
              for (const itm of seller) {
                const itmQty = items.find(
                  (prod) => prod.item == itm._id.toString()
                );

                let sellerObj = [];
                const itmObj = itm.toObject();
                itmObj.temporalQty = itmQty.qty;
                sellerObj.push(itmObj);

                totalPrice = totalPriceOfItemsForASeller * itmQty.qty;

                pf = calculatePercentage(
                  totalPriceOfItemsForASeller * itmQty.qty,
                  pp.split("%")[0]
                );

                sellerCut = calculatePercentage(
                  totalPriceOfItemsForASeller * itmQty.qty,
                  100 - pp.split("%")[0]
                );
                // console.log({ itmObj });
                resolve(sellerObj);
              }
            });
          }
          const sellerItemsWithQty = await addItmQty();
          // console.log({ sellerCut });
          // console.log({ pf });
          // console.log("seller-itmQTY::", sellerItemsWithQty);

          const estimatedDaysFordropoff = 3;
          const estimatedDateOfdropoff = addDaysToCurrentDate(
            estimatedDaysFordropoff
          );
          const formattedDropoffDateEstimate = dateStringToReadableDate(
            estimatedDateOfdropoff
          );

          sendEmail({
            to: sellerMail,
            estimatedDropoffDate: formattedDropoffDateEstimate,
            platformFee: pf.toLocaleString("en-US", {
              style: "currency",
              currency: "NGN",
            }),
            sellerCut: sellerCut.toLocaleString("en-US", {
              style: "currency",
              currency: "NGN",
            }),
            // firstname: user.firstname.toUpperCase(),
            subject: "You Have Recieved A New Order",
            items: sellerItemsWithQty,
            orderId: newOrder._id,
            totalCost: totalPrice,
            platformPercentage: pp,
            template: "order-sent-for-seller",
          });
        }

        //prepare email data and send email
        let itemData = [];
        for (const item of items) {
          const itm = await dataSources.Items.getItem(item.item);
          // console.log("itmID::", item.item);
          // console.log("itm::", itm);
          itemData.push({
            itemName: itm.name,
            itemQty: item.qty,
            itemPrice: itm.price.toLocaleString("en-US", {
              style: "currency",
              currency: "NGN",
            }),
          });
        }

        const estimatedDaysForDelivery = 7;
        const estimatedDateOfDelivery = addDaysToCurrentDate(
          estimatedDaysForDelivery
        );
        const formattedDeliveryDateEstimate = dateStringToReadableDate(
          estimatedDateOfDelivery
        );

        //send Email for order placement
        sendEmail({
          to: user.email,
          firstname: user.firstname.toUpperCase(),
          subject: "Your Order Has Been Sent",
          items: itemData,
          orderId: newOrder._id,
          estimatedDeliveryDate: formattedDeliveryDateEstimate,
          streetAddress: delivery_details.street_address,
          suiteNumber: delivery_details.apt_or_suite_number,
          cityAndZip: `${delivery_details.city}, ${delivery_details.state} ${delivery_details.zip_code}`,
          totalCost: price_breakdown.total_accumulated_price.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "NGN",
            }
          ),
          platformFee: price_breakdown.platform_fee.toLocaleString("en-US", {
            style: "currency",
            currency: "NGN",
          }),
          deliveryFee: price_breakdown.delivery_fee.toLocaleString("en-US", {
            style: "currency",
            currency: "NGN",
          }),
          template: "order-confirmed",
        });

        //return success
        return {
          code: 201,
          success: true,
          message: "Order placed successfully",
          order: newOrder,
        };
      } catch (error) {
        console.log({ error });
        return {
          code: 500,
          success: false,
          message: error.message,
        };
      }
    },
    updateTrackingProgress: async (
      _,
      { orderId, trackingLevel },
      { dataSources }
    ) => {
      try {
        //validations
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
          return {
            code: 400,
            success: false,
            message: "Invalid order ID!",
          };
        }

        const order = await dataSources.Orders.getOrdersById(orderId);
        if (!order) {
          return {
            code: 404,
            success: false,
            message: "Order not found",
          };
        }

        if (trackingLevel === 1) {
          order.is_sent_out = 1;
          await order.save();
        } else if (trackingLevel === 2) {
          order.is_delivered = 1;
          await order.save();
        } else if (trackingLevel === 3) {
          order.is_recieved = 1;
          await order.save();
        } else {
          return {
            code: 400,
            success: false,
            message: `Invalid tracking level passed. Recieved: ${trackingLevel}`,
          };
        }

        return {
          success: true,
          code: 200,
          message: "Tracking level updated successfully",
          order,
        };
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
    async getCategories(_, args, { dataSources }, info) {
      return dataSources.Categories.getCategories();
    },

    async getItemConditions(_, args, { dataSources }, info) {
      return dataSources.ItemConditions.getItemConditions();
    },

    async getBrands(_, args, { dataSources }, info) {
      return dataSources.Brands.getBrands();
    },

    async getOrdersAsBuyer(_, args, { dataSources, loggedInUser }, info) {
      try {
        if (!loggedInUser) {
          return {
            code: 401,
            success: false,
            message: "Session Expired!",
          };
        } else {
          // await dataSources.Orders.deleteAllOrders();
          const orders = await dataSources.Orders.getOrdersAsBuyer(
            loggedInUser.id
          );
          return {
            code: 200,
            success: true,
            message: "Orders for buyer fetch successful",
            orders,
          };
        }
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: "Session Expired!",
        };
      }
    },

    async getOrdersAsSeller(_, args, { dataSources, loggedInUser }, info) {
      try {
        if (!loggedInUser) {
          return {
            code: 401,
            success: false,
            message: "Session Expired!",
          };
        } else {
          const orders = await dataSources.Orders.getOrdersAsSeller(
            loggedInUser.id
            // "64ee6f820abbf17eb5e7d733"
            // "6514050a7230a2fd7f5df3ca"
          );
          return {
            code: 200,
            success: true,
            message: "Orders for seller fetch successful",
            orders,
          };
        }
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: "Session Expired!",
        };
      }
    },
  },

  //resolver chaining here...
  Category: {
    subcategories: async ({ id }, args, { dataSources }, info) => {
      return dataSources.SubCategories.findSubCategoryByCategoryId(id);
    },
  },
  SubCategory: {
    item_type: async ({ id }, _, { dataSources }, info) => {
      return dataSources.ItemTypes.findItemTypesBySubCatId(id);
    },
  },

  ItemType: {
    items: async ({ id }, _, { dataSources }, info) => {
      return dataSources.Items.findItemsByItemTypeId(id);
    },
  },

  Item: {
    condition: async ({ condition }, _, { dataSources }, info) => {
      return dataSources.ItemConditions.findItemConditionId(condition);
    },
    brand: async ({ brand }, _, { dataSources }, info) => {
      return dataSources.Brands.findBrandById(brand);
    },
    owner: async ({ owner }, _, { dataSources }, info) => {
      return dataSources.Users.findUserById(owner);
    },
  },

  Order: {
    items: async ({ items }, _, { dataSources }, info) => {
      return dataSources.Items.findListOfItemsById(items);
    },
    owner: async ({ owner }, _, { dataSources }, info) => {
      return dataSources.Users.findUserById(owner);
    },
  },

  User: {
    orders_as_buyer: async ({ id }, _, { dataSources }, info) => {
      return dataSources.Orders.getOrdersAsBuyer(id.toString());
    },
    orders_as_seller: async ({ id }, _, { dataSources }, info) => {
      return dataSources.Orders.getOrdersAsSeller(id.toString());
    },
  },
};

export default resolvers;
