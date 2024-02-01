const typeDefs = `#graphql
scalar JSON

# custom types here...
type UserBalances {
  pending_balance: Float!
  available_balance: Float!
}

type User {
    id: ID
    slug: String!
    firstname: String!
    lastname: String!
    email: String!
    mobile: String!
    password: String
    country: String
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
    # chained fields...
    orders_as_seller: [Order]
    orders_as_buyer: [Order]
    wallet: UserBalances!
  }

  type Category {
    id: ID!
    name: String!
    subcategories: [SubCategory]
    "Timestamp"
    createdAt: String!
  }

  type SubCategory {
    id: ID!
    name: String!
    category: ID!
    item_type: [ItemType]
    "Timestamp"
    createdAt: String!
  }

   type ItemType {
    id: ID!
    name: String!
    subcategory: ID!
    items: [Item]
    "Timestamp"
    createdAt: String!
  }

   type ItemCondition {
    id: ID!
    "Condition Name e.g (good, brandnew, new without tags etc.)"
    name: String!
    "Optional field to explain to user what each condition means"
    description: String
    "Timestamp"
    createdAt: String!
  }

  type Brand {
    id: ID!
    name: String!
    abbreviation: String
    "Optional field to explain what the brand is about, who they are, what they do, or sell"
    description: String
    "Brand identity logo"
    logo: String
    "Timestamp"
    createdAt: String!
  }

  type PriceBreakdown {
    "price of all items orderd for, considering the qty of each, and exclusive of additional costs like delivery fees. (it is important this field is correct and properly crosschecked, because total_accumulated_price, and other values saved, and relyed on are dependent on it.)"
    total_items_price: Float!
    platform_percentage: String!
    platform_fee: Float!
    delivery_fee: Float!
    "total of all prices of items, inclusive of platform and delivery fees if any"
    total_accumulated_price: Float!
  }

  type DeliveryDetails {
    "The street name and number where the package will be delivered."
    street_address: String!
    "If applicable, especially for apartment buildings or suite numbers.(Optional)"
    apt_or_suite_number: String
    "The state or province associated with the city."
    state: String!
    "The city where the recipient resides."
    city: String!
    additional_phone_number: String
    "Additional information that may be necessary for delivery, such as specific delivery instructions or landmarks."
    special_instructions: String
    zip_code: String
  }

  type QuantityBreakdown {
    item: ID!
    qty: Int!
  }

   type Item {
    id: ID!
    name: String!
    "size of item"
    size: String
    "Short message to describe the item, condition, or usage requirements"
    description: String!
    "color of item"
    color: String
    "Image url to be previewed by default"
    cover_image: String!
    "Array of Image urls, to be shown on item screen"
    other_snapshots: [String!]
    "Total incurred price of item (inclusive of all charges)"
    price: Float!
    "Minimum amout that can be used to start a price negotiation for the item"
    min_offer: Float
    quantity_in_stock: Int!
    brand: Brand
    condition: ItemCondition!
    "This stores the category, subcategory, and group the item belongs"
    item_type: ID!
    owner: User!
    "Timestamp"
    createdAt: String!
  }

  type Order {
    id: ID!
    "user who paid for this order"
    owner: User!
    "Item(s) paid for / included in this order"
    items: [Item]
    "total price paid for all items in this order"
    total_price_paid: Float!
    "Breakdown of costs incurred that amounts to total_price_paid"
    price_breakdown: PriceBreakdown
    "breakdown of the item and qty for every item in the order"
    item_quantity: [QuantityBreakdown]
    sellers: [ID]!
    "Priced used might differ from price of itm, due to discounts or offers, so the price used for each item will be saved here, including the item ID and qty"
    price_used_breakdown: String
    # ----- ORDER TRACKING STATUS FIELDS --------- #
    "If items(s) have been sent out to delivery stations"
    is_sent_out: Int
    "If transportation of Item(s) has begun by logistics service provider"
    is_delivered: Int
    "If item has reached the hands of customer (doesn't matter if it's later rejected by customer)"
    is_recieved: Int
    # ---------------------------------------------#
    "If customer accepts item manually, or marked as accepted if time for acceptance has ellapsed"
    is_accepted: Int
    "if acceptance was triggered by buyer or acceptance time ellapse mechanism"
    accepted_by: String
    "If there is a problem with item"
    is_rejected: Int
    rejection_reason: String
    "If refunds for the order has been initiated"
    is_refunded: Int
    "Reason for refund (Optional)"
    refund_reason: String
    "Will be true if order is closed or completed. when Order is settled, no action can be perfomed"
    is_settled: Int
    "Reason for closing, or completing the order"
    settlement_reason: String
    "Shipping address of buyer"
    delivery_details: DeliveryDetails
    "Timestamp"
    createdAt: String!
  }

  type TransactionRecord {
    id: ID!
    owner: ID!,
    order: ID,
    transaction: String!,
    type: String!,
    amount: Float!,
    date: String!,
    payment_method: String!,
    reference: ID,
    reference_type: String,
    wallet_type: Int!,
    status: Int,
    available_balance: Float!,
    pending_balance: Float!,
  }

    # inputs here...
  input RegisterInput {
    firstname: String!
    lastname: String!
    email: String!
    mobile: String!
    password: String
    country: String
    gender: Int
  }

   input ResetPasswordInput {
    resetCode: String!
    password: String!
    userId: String!
  }

  input ItemTypeInput {
    categoryId: ID!
    subcategoryId: ID!
    name: String!
  }

  input AddBrandInput {
    name: String!
    logo: String!
    description: String
    abbreviation: String
  }

   input PriceBreakdownInput {
    total_items_price: Float!
    # platform_percentage: String!
    # platform_fee: Float!
    delivery_fee: Float!
  }

  input DeliveryDetailsInput {
    "The street name and number where the package will be delivered."
    street_address: String!
    "If applicable, especially for apartment buildings or suite numbers.(Optional)"
    apt_or_suite_number: String
    "The state or province associated with the city."
    state: String!
    "The city where the recipient resides."
    city: String!
    additional_phone_number: String
    "Additional information that may be necessary for delivery, such as specific delivery instructions or landmarks."
    special_instructions: String
    "postal code or zip code"
    zip_code: String
  }

  input ItemQtyInput {
    item: ID!
    qty: Int!
    applied_discount: String
  }

  input AddItemInput {
    name: String!
    description: String!
    size: String
    color: String
    quantity_in_stock: Int!
    "Image url to be previewed by default"
    cover_image: String!
    "Array of Image urls, to be shown on item screen"
    other_snapshots: [String!]
    "price of item"
    price: Float!
    "selected brand for item"
    brand: ID
    "selected condition of item"
    condition: ID!
    "This stores the category, subcategory, and group the item belongs"
    item_type: ID!
    "The lowest offer that can be made for this item"
    min_offer: Float!
  }

   input CreateOrderInput {
    items: [ItemQtyInput]!
    total_price_paid: Float!
    price_breakdown: PriceBreakdownInput
    delivery_details: DeliveryDetailsInput
    payment_method: String!
    payment_ref: String!
    payment_data: String!
  }

  # type SinglOrderPriceBreakdown {
  #   platform_percentage: String!
  #   platform_fee: Float
  #   delivery_fee: Float!
  # }

  input CreateSingleOrderInput {
    item: ID!
    price_paid: Float!
    qty: Int!
    delivery_fee: Float!
    # price_breakdown: SinglOrderPriceBreakdown
    delivery_details: DeliveryDetailsInput
    payment_method: String!
    payment_ref: String!
    payment_data: String!
  }

  type Query {
    getItemConditions: [ItemCondition]
    getBrands: [Brand]
    getCategories: [Category]
    getItemTypes: [ItemType]
    getOrdersAsBuyer: orderListResponse!
    getOrdersAsSeller: orderListResponse!
    getUserBalances: getBalancesResponse!
    getTnxHistory: getTnxHistoryResponse!
  }

  type Mutation {
    # mutations here...
    registerUser(inputData: RegisterInput): RegisterPayload!
    login(email: String! password: String): AuthPayload!
    userVerification(userId: ID!, verificationCode: String!): AuthPayload!
    requestUserVerification(userId: ID!): AuthPayload!
    forgetPassword(email: String!): ForgetPasswordPayload!
    resetPasswordVerification(resetCode: String! userId: ID!): successResponseAlone!
    resetPassword(resetData: ResetPasswordInput!): successResponseAlone!
    createCategory(name: String!): createCategoryResponse!
    createSubCategory(name: String! categoryId: ID!): createSubCategoryResponse!
    createItemType(inputData: ItemTypeInput!): createItemTypeResponse!
    createItemCondition(name: String! description: String): createItemConditionResponse!
    createBrand(inputData: AddBrandInput!): createBrandResponse!
    addItem(inputData: AddItemInput): addItemResponse!
    createOrder(inputData: CreateOrderInput!): createOrderResponse!
    createSingleOrder(inputData: CreateSingleOrderInput!): createOrderResponse!
    updateTrackingProgress(orderId: ID!, trackingLevel: Int!): orderTrackingProgressResponse!
  }

# response types here...
type successResponseAlone {
    code: Int!
    success: Boolean!
    message: String!
  }

  type getBalancesResponse {
    code: Int!
    success: Boolean!
    message: String!
    wallet: UserBalances
  }

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

type ForgetPasswordPayload {
    code: Int!
    success: Boolean!
    message: String!
    userId: String
  }

  type createCategoryResponse {
    code: Int!
    success: Boolean!
    message: String!
    category: Category
  }

    type createSubCategoryResponse {
    code: Int!
    success: Boolean!
    message: String!
    subCategory: SubCategory
  }

   type createItemTypeResponse {
    code: Int!
    success: Boolean!
    message: String!
    itemType: ItemType
  }

   type createItemConditionResponse {
    code: Int!
    success: Boolean!
    message: String!
    itemCondition: ItemCondition
  }

   type createBrandResponse {
    code: Int!
    success: Boolean!
    message: String!
    brand: Brand
  }

  type addItemResponse {
    code: Int!
    success: Boolean!
    message: String!
    item: Item
  }

  type createOrderResponse {
    code: Int!
    success: Boolean!
    message: String!
    order: Order
  }

  type orderTrackingProgressResponse {
    code: Int!
    success: Boolean!
    message: String!
    order: Order
  }

   type orderListResponse {
    code: Int!
    success: Boolean!
    message: String!
    orders: [Order]
  }

  type getTnxHistoryResponse {
    code: Int!
    success: Boolean!
    message: String!
    history: [TransactionRecord]
  }

`;

export default typeDefs;
