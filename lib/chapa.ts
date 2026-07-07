import crypto from "crypto";
import { Chapa, isAxiosError, SplitType } from "chapa-nodejs";
import type {
  CreateSubaccountResponse,
  GetBanksResponse,
  InitializeResponse,
  VerifyResponse,
} from "chapa-nodejs";

export type ChapaSplitType = "percentage" | "flat";

export interface ChapaBank {
  id?: number;
  code?: string | number;
  name?: string;
  swift?: string;
  [key: string]: unknown;
}

export interface CreateChapaSubaccountInput {
  businessName?: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  splitType: ChapaSplitType;
  splitValue: number;
}

export interface InitializeChapaPaymentInput {
  txRef: string;
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  callbackUrl?: string | null;
  returnUrl?: string | null;
  title: string;
  description: string;
  subaccountId?: string | null;
  splitType?: ChapaSplitType | null;
  splitValue?: number | null;
}

export interface ChapaSubaccountResponse extends CreateSubaccountResponse {
  data: string;
}

export interface ChapaInitializePaymentResponse extends InitializeResponse {
  data?: {
    checkout_url: string;
  };
}

export class ChapaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = "ChapaApiError";
  }
}

function readableChapaMessage(value: unknown, fallback = "Chapa request failed."): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => readableChapaMessage(item, ""))
      .filter(Boolean)
      .join("; ") || fallback;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const nestedMessage =
      record.message ||
      record.error ||
      record.detail ||
      record.details ||
      record.msg;

    if (nestedMessage && nestedMessage !== value) {
      return readableChapaMessage(nestedMessage, fallback);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

function getChapaSecretKey() {
  const secretKey = process.env.CHAPA_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CHAPA_SECRET_KEY is not configured.");
  }
  return secretKey;
}

function getChapaWebhookSecret() {
  return process.env.CHAPA_WEBHOOK_SECRET || process.env.CHAPA_SECRET_KEY;
}

function getChapaClient() {
  return new Chapa({
    secretKey: getChapaSecretKey(),
    webhookSecret: getChapaWebhookSecret(),
    timeout: 30_000,
  });
}

function normalizeChapaError(error: unknown): never {
  if (isAxiosError(error)) {
    const message = readableChapaMessage(error.response?.data?.message || error.response?.data || error.message);
    throw new ChapaApiError(message, error.response?.status ?? 502, error.response?.data ?? null);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Chapa request failed.");
}

export async function listChapaBanks() {
  try {
    return await getChapaClient().getBanks() as GetBanksResponse & { status?: string; data?: ChapaBank[] };
  } catch (error) {
    normalizeChapaError(error);
  }
}

export async function createChapaSubaccount(input: CreateChapaSubaccountInput) {
  try {
    return await getChapaClient().createSubaccount({
      business_name: input.businessName || input.accountName,
      account_name: input.accountName,
      account_number: input.accountNumber,
      bank_code: Number(input.bankCode),
      split_type: input.splitType === "flat" ? SplitType.FLAT : SplitType.PERCENTAGE,
      split_value: input.splitValue,
    }) as ChapaSubaccountResponse;
  } catch (error) {
    normalizeChapaError(error);
  }
}

export async function initializeChapaPayment(input: InitializeChapaPaymentInput) {
  try {
    const payload = {
      amount: String(input.amount),
      currency: "ETB",
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone_number: input.phoneNumber || undefined,
      tx_ref: input.txRef,
      ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
      ...(input.returnUrl ? { return_url: input.returnUrl } : {}),
      customization: {
        title: input.title,
        description: input.description,
      },
      ...(input.subaccountId
        ? {
            subaccounts: {
              id: input.subaccountId,
              split_type: input.splitType === "flat" ? "flat" : "percentage",
              split_value: input.splitValue ?? 0.05,
            },
          }
        : {}),
    };

    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getChapaSecretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
      throw new ChapaApiError(
        readableChapaMessage(data?.message || data, "Chapa payment initialization failed."),
        response.status || 502,
        data,
      );
    }

    return data as ChapaInitializePaymentResponse;
  } catch (error) {
    if (error instanceof ChapaApiError) throw error;
    normalizeChapaError(error);
  }
}

export async function verifyChapaPayment(txRef: string) {
  try {
    return await getChapaClient().verify({ tx_ref: txRef }) as VerifyResponse;
  } catch (error) {
    normalizeChapaError(error);
  }
}

export function extractChapaSubaccountId(payload: ChapaSubaccountResponse | { data?: unknown }) {
  if (typeof payload.data === "string") return payload.data;
  if (payload.data && typeof payload.data === "object") {
    const data = payload.data as { id?: string; subaccount_id?: string };
    return data.id || data.subaccount_id || null;
  }
  return null;
}

function safeCompareHex(value: string, expected: string) {
  try {
    const normalizedValue = value.trim();
    if (normalizedValue.length !== expected.length) return false;

    return crypto.timingSafeEqual(
      Buffer.from(normalizedValue, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}

export function verifyChapaWebhookSignature(rawBody: string, signatures: Array<string | null>) {
  const providedSignatures = signatures
    .filter((signature): signature is string => Boolean(signature))
    .flatMap((signature) => signature.split(",").map((value) => value.trim()).filter(Boolean));

  if (providedSignatures.length === 0) return false;

  const webhookSecret = getChapaWebhookSecret();
  if (!webhookSecret) return false;

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const expectedSecretHash = crypto.createHmac("sha256", webhookSecret).update(webhookSecret).digest("hex");

  for (const signature of providedSignatures) {
    if (safeCompareHex(signature, expected) || safeCompareHex(signature, expectedSecretHash)) {
      return true;
    }
  }

  for (const signature of providedSignatures) {
    try {
      if (getChapaClient().verifyWebhook(rawBody, signature)) return true;
    } catch {
      // Keep trying any alternate signature headers Chapa supplied.
    }
  }

  return false;
}
