import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import pkg from "body-parser";
const { json } = pkg;
import typeDefs from "./src/schema.js";
import resolvers from "./src/resolvers.js";
import { connectDB } from "./src/utils/db.js";

//models
import User from "./src/models/User.js";
import Category from "./src/models/Category.js";
import SubCategory from "./src/models/SubCategory.js";
import ItemType from "./src/models/ItemType.js";

//datasources
import Users from "./src/datasource/Users.js";
import Categories from "./src/datasource/Categories.js";
import SubCategories from "./src/datasource/SubCategories.js";
import ItemTypes from "./src/datasource/ItemTypes.js";

dotenv.config();
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
        dataSources: {
          Users: new Users(User),
          Categories: new Categories(Category),
          SubCategories: new SubCategories(SubCategory),
          ItemTypes: new ItemTypes(ItemType),
        },
      };
    },
  })
);

await connectDB();
await new Promise((resolve) => httpServer.listen({ port: 4040 }, resolve));
console.log(`🚀 Server ready at http://localhost:4040/graphql...`);
