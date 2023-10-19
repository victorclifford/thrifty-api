import { RESTDataSource } from "@apollo/datasource-rest";

class PaystackAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.paystack.co/";
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  }

  willSendRequest(_path, request) {
    request.headers["Authorization"] = `Bearer ${this.paystackSecretKey}`;
    request.headers["Content-Type"] = "application/json";
    // console.log({ request });
  }

  async processRefund(options) {
    // console.log({ this: this });

    try {
      console.log("paystack refund called...");
      const response = await this.post("refund", { body: options });
      console.log("success-refund::", response);
      return response;
    } catch (error) {
      console.log("err-paystack-refund::", error);
      console.log("err-paystack-refund-body::", error.extensions.response.body);
      return {
        success: false,
        message: "An error occurred during refund",
        error: error.message,
      };
    }
  }

  async resolveAccountNumber(accountNumber, bankCode) {
    const resolveEndpoint = `bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`;
    try {
      const response = await this.get(resolveEndpoint);

      return { ...response.data, success: true };
    } catch (error) {
      const errorMessage = "Failed to resolve account number.";
      return {
        success: false,
        message: errorMessage,
        error: error.message,
      };
    }
  }

  async transferToBankAccount(transferPayload) {
    try {
      const transferEndpoint = "transfer";
      const transferResponse = await this.post(
        transferEndpoint,
        transferPayload
      );
      return transferResponse;
    } catch (error) {
      const errorMessage = "Failed to initiate bank transfer.";
      console.log("tf-er:::", error.extensions.response.body);
      return {
        success: false,
        message: errorMessage,
        error: error.message,
      };
    }
  }

  async verifyPayment(ref) {
    try {
      const response = await this.get(`transaction/verify/${ref}`);
      return response;
    } catch (error) {
      return error;
    }
  }

  async getAllTransactions() {
    const response = await this.get("transaction");
    return response;
  }
  async getBanks() {
    const response = await this.get("bank");
    return response?.data;
  }
}

export default PaystackAPI;
