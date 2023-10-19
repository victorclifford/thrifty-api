import dotenv from "dotenv";
import config from "./src/utils/config.js";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import pkg from "body-parser";
const { json } = pkg;
import jwt from "jsonwebtoken";
import typeDefs from "./src/schema.js";
import resolvers from "./src/resolvers.js";
import { connectDB } from "./src/utils/db.js";

//models
import User from "./src/models/User.js";
import Category from "./src/models/Category.js";
import SubCategory from "./src/models/SubCategory.js";
import ItemType from "./src/models/ItemType.js";
import ItemCondition from "./src/models/ItemCondition.js";
import Brand from "./src/models/Brand.js";
import Item from "./src/models/Item.js";
import Order from "./src/models/Order.js";
import TransactionRecord from "./src/models/TransactionRecord.js";

//datasources
import PaystackAPI from "./src/datasource/Paystack.js";
import Users from "./src/datasource/Users.js";
import Categories from "./src/datasource/Categories.js";
import SubCategories from "./src/datasource/SubCategories.js";
import ItemTypes from "./src/datasource/ItemTypes.js";
import ItemConditions from "./src/datasource/ItemConditions.js";
import Brands from "./src/datasource/Brands.js";
import Items from "./src/datasource/Items.js";
import Orders from "./src/datasource/Orders.js";
import TransactionRecords from "./src/datasource/TransactioRecords.js";

dotenv.config();

const { JWT_SECRET } = config;
const getUser = (token) => {
  try {
    // console.log("verifying user token...");
    if (token) {
      return jwt.verify(token, JWT_SECRET);
    }
    return null;
  } catch (error) {
    // console.log("errVerifyingToken::", error);
    return null;
  }
};

const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();
app.use(
  "/graphql",
  cors(),
  json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const { cache } = server;
      const token = req.get("Authorization") || "";
      return {
        loggedInUser: getUser(token),
        dataSources: {
          Users: new Users(User),
          Categories: new Categories(Category),
          SubCategories: new SubCategories(SubCategory),
          ItemTypes: new ItemTypes(ItemType),
          ItemConditions: new ItemConditions(ItemCondition),
          Brands: new Brands(Brand),
          Items: new Items(Item),
          Orders: new Orders(Order),
          TransactionRecords: new TransactionRecords(TransactionRecord),

          //rest dataSources
          PaystackAPI: new PaystackAPI(),
        },
      };
    },
  })
);

await connectDB();
await new Promise((resolve) => httpServer.listen({ port: 4040 }, resolve));
console.log(`🚀 Server ready at http://localhost:4040/graphql...`);
