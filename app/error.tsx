"use client";

import { useEffect } from "react";
import { RiAlertLine, RiHome4Line, RiRefreshLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DIREDAWA-CRASH]", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-[100] bg-background-full text-text-primary flex flex-col items-center justify-center p-6 sm:p-10 text-center gap-8">
      <div className="space-y-5 max-w-md">
        <div className="w-16 h-16 bg-background-secondary-default border border-border-error-default rounded-3xl flex items-center justify-center text-text-error-primary mx-auto shadow-sm">
          <RiAlertLine className="size-8" aria-hidden="true" />
        </div>

        <div className="space-y-2.5">
          <h2 className="text-title-1-medium font-bold text-text-primary tracking-tight">
            Something went wrong
          </h2>
          <p className="text-body-regular text-text-secondary max-w-sm mx-auto">
            The application encountered an unexpected error. This usually happens due to temporary connection instability.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-sm justify-center">
        <Button
          variant="primary"
          leadingIcon={RiRefreshLine}
          onClick={() => reset()}
          className="flex-1 h-11 rounded-xl"
        >
          Try Again
        </Button>
        <Button
          variant="secondary"
          leadingIcon={RiHome4Line}
          onClick={() => (window.location.href = "/")}
          className="flex-1 h-11 rounded-xl"
        >
          Return Home
        </Button>
      </div>

      <div className="text-caption-1-semibold font-mono text-text-tertiary">
        Error ID: {error.digest || "N/A"}
      </div>
    </div>
  );
}
