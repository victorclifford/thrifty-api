import {
  spreadAndOmitKeys,
  calculatePercentage,
} from "./utilityFunctionsLibrary.js";

export async function creditUser(args) {
  const {
    tnxDataSource,
    walletToCredit,
    amount_to_credit,
    userId,
    // inputData,
    owner_type,
    pm,
    reference_type,
    record_reference,
    status,
    transaction,
    order,
  } = args;

  //get user balances
  let { pendingBal, availableBal } = await getUserBalances(
    tnxDataSource,
    userId
  );

  //-------credit user wallet
  walletToCredit
    ? (availableBal = availableBal + amount_to_credit)
    : (pendingBal = pendingBal + amount_to_credit);

  //create the record
  let recordData = {
    // ...data,
    type: "credit",
    amount: amount_to_credit,
    owner: userId,
    owner_type,
    pending_balance: pendingBal,
    available_balance: availableBal,
    reference: record_reference ? record_reference : null,
    reference_type: reference_type ? reference_type : null,
    status,
    transaction: transaction ? transaction : "Wallet",
    payment_method: pm,
    wallet_type: walletToCredit,
    date: Date.now(),
    order,
  };

  //   console.log({ recordData });
  const creditWalletRecord = await tnxDataSource.createRecord(recordData);

  //push created record in array to be returned at the end of function operation
  if (creditWalletRecord) {
    // completedTransactions.push(creditWalletRecord);
    return creditWalletRecord;
  }
}

export async function debitUser(args) {
  const {
    tnxDataSource,
    walletToDebit,
    amount_to_debit,
    userId,
    ref,
    ref_type,
    status,
    owner_type,
    transaction,
    order,
  } = args;

  let record_reference = ref;

  //get user balances
  let { pendingBal, availableBal } = await getUserBalances(
    tnxDataSource,
    userId
  );

  //debit user wallet
  walletToDebit
    ? (availableBal = availableBal - amount_to_debit)
    : (pendingBal = pendingBal - amount_to_debit);
  //   console.log({ availableBalOnDebit: availableBal });

  //create the record
  let recordData = {
    transaction,
    status,
    owner: userId,
    pending_balance: pendingBal,
    available_balance: availableBal,
    reference: record_reference ? record_reference : null,
    reference_type: ref_type,
    type: "debit",
    amount: -amount_to_debit,
    payment_method: "Wallet",
    wallet_type: walletToDebit,
    status,
    date: Date.now(),
    order,
  };

  const debitWalletRecord = await tnxDataSource.createRecord(recordData);
  console.log({ debitWalletRecord });

  //push created record in array to be returned at the end of function operation
  if (debitWalletRecord) {
    return debitWalletRecord;
  }
}

//function to get user balance
export async function getUserBalances(tnxDataSource, userId, type) {
  let pendingBal = 0;
  let availableBal = 0;

  //get last inserted records for user, to get wallet balances
  const lastTnxRecords = await tnxDataSource.getUserTnxRecords(userId);
  //   console.log({ lastTnxRecords });

  //we can use this same function to get user tnx history, by passing "history" as type
  if (type === "history") {
    // console.log({ lastTnxRecords });
    return lastTnxRecords;
  }

  if (lastTnxRecords?.length) {
    console.log("there is lastUserTnx records:::");
    // console.log({ lastTnxRecords });
    return {
      pendingBal: lastTnxRecords[0]?.pending_balance,
      availableBal: lastTnxRecords[0]?.available_balance,
    };
  }
  //   console.log({ pendingBal, availableBal });
  return {
    pendingBal,
    availableBal,
  };
}

//function to check if user has been refunded before
async function hasBeenRefunded(userId, orderId, tnxDataSource) {
  const refundExists = await tnxDataSource.getUserRefundedTnxRecordForOrder(
    userId,
    orderId
  );
  //   console.log({ refundExists });
  if (refundExists) {
    return true;
  }
  return false;
}

//function to check if order has been completed or not
async function checkOrderAcceptanceStatus(order, reviewDataSource) {
  const orderReview = await reviewDataSource.getReviewForOrder(order._id);
  console.log({ orderReview });
  if (orderReview || order?.is_completed === 1) return false;
  return true;
}

export async function onUserPurchase(datasources, inputData) {
  const { tnxDataSource, orderDataSource, userDataSource } = datasources;

  const { owner, order, amount, platform_percentage, sellersArray } = inputData;

  let record_reference = null;
  let completedTransactions = [];
  const transactionOrder = await orderDataSource.getOrdersById(order);

  let args = {
    ...datasources,
    walletToCredit: 1,
    userId: owner,
    record_reference: null,
    amount_to_credit: amount,
    status: 1,
    // inputData,
    pm: "Card",
    transaction: `Wallet (Funding from ${transactionOrder?.payment_method})`,
  };

  //credit user

  const creditedUser = await creditUser(args);
  if (creditedUser) completedTransactions.push(creditedUser);

  //------------------------------------------------------------------------

  //debit user ******************************************************

  args = {
    ...datasources,
    walletToDebit: 1,
    userId: owner,
    ref: creditedUser?.order,
    amount_to_debit: amount,
    ref_type: "order",
    status: 1,
    transaction: `Purchase of Item(s)`,
    order,
  };

  const debitedUser = await debitUser(args);
  if (debitedUser) completedTransactions.push(debitedUser);

  record_reference = debitedUser?._id;
  //--***********************************************************************

  //return array of transactions completed, progress and status res
  return {
    status: "complete",
    stepsCompleted: ["credit user wallet", "debit user wallet"],
    completedTransactions,
    debitReference: debitedUser._id,
  };
}

export async function creditBeneficiaryPendingBalOnUserPurchase(
  datasources,
  inp
) {
  const { order, platform_percentage, sellerArray, ref, sellerId } = inp;
  const { tnxDataSource, orderDataSource, userDataSource } = datasources;

  const completedTransactions = [];

  //credit sellers **********************************************************
  const thriftyAdminMail = "admin@thrifty.com";
  const thriftyAdmin = await userDataSource.findUserByEmail(thriftyAdminMail);
  const adminId = thriftyAdmin._id;

  let totalPrice = 0;
  for (const item of sellerArray) {
    const currItemPriceWithQty = item.price * item.temporalQty;
    totalPrice = totalPrice + currItemPriceWithQty;
  }

  const sellerExist = await userDataSource.findUserById(sellerId);
  if (!sellerExist) {
    return {
      status: "incomplete",
      cause: `Process failed at finding seller with ID: ${sellerId}`,
      stepsCompleted: [],
      completedTransactions,
    };
  }

  //get amount to credit seller from total price of seller items passed and calculate seller cut.
  const sellerPercentageCut = 100 - platform_percentage;
  const sellerCut = calculatePercentage(totalPrice, sellerPercentageCut);
  console.log("TotalPriceOfItem::", totalPrice);

  //credit user(seller) wallet

  let args = {
    ...datasources,
    walletToCredit: 0,
    userId: sellerExist._id,
    record_reference: ref,
    amount_to_credit: sellerCut,
    pm: "Sales",
    status: 0,
    reference_type: "transction",
    transaction: `Income for sales of items(s)`,
    order,
  };

  const creditedSeller = await creditUser(args);
  if (creditedSeller) completedTransactions.push(creditedSeller);

  //for each seller a percentage is taken and sent to thrifty. credit thrifty her percentage for each seller

  //credit thrifty commision fee ******************************************************

  const thriftyAdminId = adminId;

  //get amount to credit user(thrifty) by percentage cut of total_items_price
  const thriftyPercentageCut = platform_percentage;

  //calculate amount to be credited by percentage cut
  const thriftyCut = calculatePercentage(totalPrice, thriftyPercentageCut);
  console.log({ thriftyCut });

  //credit user(thrifty) wallet

  args = {
    ...datasources,
    walletToCredit: 0,
    userId: thriftyAdminId,
    record_reference: ref,
    amount_to_credit: thriftyCut,
    pm: "Sales",
    status: 0,
    reference_type: "transction",
    transaction: `Wallet (platform fee ${platform_percentage}%)`,
    order,
  };

  const creditedThrifty = await creditUser(args);
  if (creditedThrifty) completedTransactions.push(creditedThrifty);

  //--*****************************************************************

  //return array of transactions completed, progress and status res
  return {
    status: "complete",
    stepsCompleted: ["credit seller", "credit thrifty(platform)"],
    completedTransactions,
  };
}
