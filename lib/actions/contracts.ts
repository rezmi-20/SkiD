"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getUserContracts() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const role = session.user.role;

  try {
    if (role === "client") {
      // Fetch contracts where user is the client
      // Join jobs to get worker details
      return await sql`
        SELECT 
          c.id as contract_id,
          c.signed_at,
          c.pdf_url,
          c.created_at as contract_created_at,
          j.id as job_id,
          j.title as job_title,
          j.status as job_status,
          j.budget,
          wp.full_name as partner_name,
          wp.avatar_url as partner_avatar,
          wp.is_verified as partner_verified
        FROM contracts c
        JOIN jobs j ON c.job_id = j.id
        LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
        WHERE j.client_id = ${userId}
        ORDER BY c.created_at DESC
      `;
    } else if (role === "worker") {
      // Fetch contracts where user is the worker
      return await sql`
        SELECT 
          c.id as contract_id,
          c.signed_at,
          c.pdf_url,
          c.created_at as contract_created_at,
          j.id as job_id,
          j.title as job_title,
          j.status as job_status,
          j.budget,
          cp.full_name as partner_name,
          cp.avatar_url as partner_avatar
        FROM contracts c
        JOIN jobs j ON c.job_id = j.id
        LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
        WHERE j.worker_id = ${userId}
        ORDER BY c.created_at DESC
      `;
    }
    return [];
  } catch (error) {
    console.error("[GET_USER_CONTRACTS_ERROR]", error);
    return [];
  }
}

export async function getContractDetails(contractId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const contracts = await sql`
      SELECT 
        c.*,
        j.title as job_title,
        j.description as job_description,
        j.status as job_status,
        j.budget,
        j.client_id,
        j.worker_id,
        wp.full_name as worker_name,
        wp.avatar_url as worker_avatar,
        wp.phone as worker_phone,
        wp.is_verified as worker_verified,
        cp.full_name as client_name,
        cp.avatar_url as client_avatar,
        u_client.phone as client_phone
      FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      LEFT JOIN users u_client ON j.client_id = u_client.id
      WHERE c.id = ${contractId}
    `;

    if (contracts.length === 0) return null;
    const contract = contracts[0];

    // Check if user is part of the contract
    if (session.user.id !== contract.client_id && session.user.id !== contract.worker_id) {
       throw new Error("Forbidden");
    }

    return contract;
  } catch (error) {
    console.error("[GET_CONTRACT_DETAILS_ERROR]", error);
    return null;
  }
}
