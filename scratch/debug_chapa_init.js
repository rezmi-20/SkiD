require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");
const { Chapa, SplitType } = require("chapa-nodejs");

const sql = neon(process.env.DATABASE_URL);
const jobId = process.argv[2];

function normalizeUrl(url) {
  return String(url || "").replace(/\/$/, "");
}

function appUrl() {
  return normalizeUrl(
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  );
}

function normalizeEthiopianPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (/^0[79]\d{8}$/.test(digits)) return digits;
  if (/^[79]\d{8}$/.test(digits)) return `0${digits}`;
  if (/^251[79]\d{8}$/.test(digits)) return `0${digits.slice(3)}`;
  return null;
}

function splitName(fullName) {
  const parts = String(fullName || "DireSkill Client").trim().split(/\s+/);
  return {
    firstName: parts[0] || "DireSkill",
    lastName: parts.slice(1).join(" ") || "Client",
  };
}

function publicError(error) {
  const ownProperties = {};
  for (const key of Object.getOwnPropertyNames(error || {})) {
    if (key === "stack") continue;
    ownProperties[key] = error[key];
  }

  return {
    name: error?.name,
    message: error?.message,
    status: error?.response?.status,
    data: error?.response?.data,
    errors: error?.errors,
    ownProperties,
  };
}

async function main() {
  if (!jobId) throw new Error("Pass a job id.");

  const rows = await sql`
    SELECT
      j.id,
      j.title,
      j.budget,
      u.email as client_email,
      u.phone as client_phone,
      cp.full_name as client_name,
      wp.chapa_subaccount_id,
      wp.chapa_split_type,
      wp.chapa_split_value
    FROM jobs j
    JOIN users u ON j.client_id = u.id
    LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
    LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
    WHERE j.id = ${jobId}
    LIMIT 1
  `;

  const job = rows[0];
  if (!job) throw new Error("Job not found.");

  const txRef = `DEBUG-DIRESKILL-${Date.now()}`;
  const { firstName, lastName } = splitName(job.client_name);
  const callbackUrl = process.env.WEBHOOK_URL || `${appUrl()}/api/payment/webhook`;
  const returnUrl = `${process.env.CALLBACK_URL || `${appUrl()}/payment-success`}?tx_ref=${txRef}&job_id=${job.id}`;
  const phoneNumber = normalizeEthiopianPhone(job.client_phone);
  const splitType = job.chapa_split_type === "flat" ? SplitType.FLAT : SplitType.PERCENTAGE;

  const payload = {
    amount: String(job.budget),
    currency: "ETB",
    email: job.client_email,
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber,
    tx_ref: txRef,
    callback_url: callbackUrl,
    return_url: returnUrl,
    customization: {
      title: "DireSkill",
      description: job.title,
    },
    subaccounts: {
      id: job.chapa_subaccount_id,
      split_type: splitType,
      split_value: Number(job.chapa_split_value ?? 0.05),
    },
  };

  console.log("Payload summary:", JSON.stringify({
    ...payload,
    email: "masked",
    phone_number: payload.phone_number ? `${payload.phone_number.slice(0, 3)}****${payload.phone_number.slice(-2)}` : null,
  }, null, 2));

  const directResponse = await fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const directText = await directResponse.text();
  console.log("Direct Chapa status:", directResponse.status);
  console.log("Direct Chapa body:", directText);
  if (!directResponse.ok) process.exit(1);

  const chapa = new Chapa({ secretKey: process.env.CHAPA_SECRET_KEY, timeout: 30000 });
  try {
    const response = await chapa.initialize(payload);
    console.log("Chapa response:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.log("Chapa error:", JSON.stringify(publicError(error), null, 2));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
