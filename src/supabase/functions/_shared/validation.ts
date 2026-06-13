export type OrderInitializationInput = {
  user_id: string;
  level_id: string;
  amount: number;
  provider: "paychangu" | "airtel" | "orange";
  phone: string;
};

export function validateOrderInput(body: any): OrderInitializationInput {
  if (!body) {
    throw new Error("Request body is required");
  }

  const {
    user_id,
    level_id,
    amount,
    provider,
    phone,
  } = body;

  if (!user_id) throw new Error("user_id is required");
  if (!level_id) throw new Error("level_id is required");

  if (!amount || typeof amount !== "number" || amount <= 0) {
    throw new Error("amount must be a valid number greater than 0");
  }

  const allowedProviders = ["paychangu", "airtel", "orange"];
  if (!provider || !allowedProviders.includes(provider)) {
    throw new Error("Invalid provider");
  }

  if (!phone || phone.length < 8) {
    throw new Error("Valid phone number is required");
  }

  return {
    user_id,
    level_id,
    amount,
    provider,
    phone,
  };
}