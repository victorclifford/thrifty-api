const typeDefs = `#graphql
scalar JSON

# custom types here...
type User {
    id: ID
    slug: String!
    firstname: String!
    lastname: String!
    email: String!
    mobile: String!
    password: String
    face_id: String
    show_face_id: Boolean
    fcm_token: [String]
    gender: Int
    isVerified: Int
    content_preference: [String]
    resetPasswordToken: String
    resetPasswordExpiration: String
    "Timestamp"
    createdAt: String!
  }

    # inputs here...
  input RegisterInput {
    firstname: String!
    lastname: String!
    email: String!
    mobile: String!
    password: String
    gender: Int
  }

  type Query {
    getUsers: String
  }

  type Mutation {
    # mutations here...
    registerUser(inputData: RegisterInput): RegisterPayload!
    login(email: String! password: String): AuthPayload!
    userVerification(userId: ID!, verificationCode: String!): AuthPayload!
    requestUserVerification(userId: ID!): AuthPayload!
  }

# response types here...
 type RegisterPayload {
    code: Int!
    success: Boolean!
    message: String!
    userId: ID
  }

   type AuthPayload {
    token: String
    userId: ID
    isVerified: Int
    user: User
    code: Int!
    success: Boolean!
    message: String!
  }

`;

export default typeDefs;
