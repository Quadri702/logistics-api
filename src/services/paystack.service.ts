import axios from "axios";

const paystackClient = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export interface InitializePaymentData {
  email: string;
  amount: number;
  reference: string;
  callback_url?: string;
}

export const initializePaystackPayment = async (
  data: InitializePaymentData,
) => {
  const response = await paystackClient.post("/transaction/initialize", {
    email: data.email,
    amount: data.amount,
    reference: data.reference,
    callback_url: data.callback_url,
  });

  return response.data;
};

export const verifyPaystackPayment = async (reference: string) => {
  const response = await paystackClient.get(`/transaction/verify/${reference}`);

  return response.data;
};
