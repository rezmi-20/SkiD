export const WORKER_DASHBOARD_ROUTE = "/worker/dashboard";
export const WORKER_PENDING_VERIFICATION_ROUTE = "/worker/pending-verification";

export type WorkerLifecycleState = {
  role?: string | null;
  isVerified?: boolean | null;
  isSuspended?: boolean | null;
  verificationStatus?: string | null;
  identityComplete?: boolean | null;
};

export function getWorkerAccessRoute(state: WorkerLifecycleState) {
  if (state.role !== "worker") {
    return "/login";
  }

  if (state.isSuspended) {
    return "/login?error=suspended";
  }

  if (state.verificationStatus !== "approved" || state.isVerified !== true || state.identityComplete === false) {
    return WORKER_PENDING_VERIFICATION_ROUTE;
  }

  return WORKER_DASHBOARD_ROUTE;
}
