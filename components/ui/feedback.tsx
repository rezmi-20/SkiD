"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  RiCheckboxCircleFill,
  RiCloseLine,
  RiErrorWarningFill,
  RiInformationFill,
} from "@remixicon/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
}

export interface ConfirmDialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
}

export interface PromptDialogOptions {
  title: string;
  description?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  required?: boolean;
  requiredError?: string;
  variant?: "primary" | "danger";
}

interface FeedbackContextValue {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
  confirmDialog: (options: ConfirmDialogOptions) => Promise<boolean>;
  promptDialog: (options: PromptDialogOptions) => Promise<string | null>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmDialogOptions;
    resolve: (ok: boolean) => void;
  } | null>(null);
  const [promptState, setPromptState] = useState<{
    options: PromptDialogOptions;
    resolve: (value: string | null) => void;
  } | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [promptError, setPromptError] = useState<string | null>(null);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const pushToast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, kind, message }]);
      timersRef.current[id] = setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast]
  );

  const toast = React.useMemo(
    () => ({
      success: (message: string) => pushToast("success", message),
      error: (message: string) => pushToast("error", message),
      info: (message: string) => pushToast("info", message),
    }),
    [pushToast]
  );

  const confirmDialog = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  const promptDialog = useCallback((options: PromptDialogOptions) => {
    setPromptValue("");
    setPromptError(null);
    return new Promise<string | null>((resolve) => {
      setPromptState({ options, resolve });
    });
  }, []);

  const closeConfirm = (result: boolean) => {
    if (!confirmState) return;
    confirmState.resolve(result);
    setConfirmState(null);
  };

  const closePrompt = (submit: boolean) => {
    if (!promptState) return;
    if (!submit) {
      promptState.resolve(null);
      setPromptState(null);
      setPromptValue("");
      setPromptError(null);
      return;
    }

    const trimmed = promptValue.trim();
    if (promptState.options.required !== false && !trimmed) {
      setPromptError(
        promptState.options.requiredError || "Please enter a reason before continuing."
      );
      return;
    }

    promptState.resolve(trimmed);
    setPromptState(null);
    setPromptValue("");
    setPromptError(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirmDialog, promptDialog }}>
      {children}

      {/* ── Accessible Toast Stack ──────────────────────────────────────── */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-5 end-4 z-[10050] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
        >
          {toasts.map((item) => (
            <div
              key={item.id}
              role="status"
              className={cx(
                "pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-2xl border shadow-xl backdrop-blur-xl transition-all",
                "bg-background-primary-default text-text-primary",
                item.kind === "error"
                  ? "border-border-error-default"
                  : item.kind === "success"
                    ? "border-accent-500/40"
                    : "border-border-button-default"
              )}
            >
              {item.kind === "error" ? (
                <RiErrorWarningFill className="size-5 shrink-0 text-text-error-primary mt-0.5" />
              ) : item.kind === "success" ? (
                <RiCheckboxCircleFill className="size-5 shrink-0 text-[#45BA50] mt-0.5" />
              ) : (
                <RiInformationFill className="size-5 shrink-0 text-accent-500 mt-0.5" />
              )}
              <p className="flex-1 text-body-2-medium text-text-primary leading-snug">
                {item.message}
              </p>
              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                aria-label="Dismiss notification"
                className="p-1 rounded-lg text-text-tertiary hover:text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring cursor-pointer"
              >
                <RiCloseLine className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Confirmation Dialog ─────────────────────────────────────────── */}
      <Dialog open={Boolean(confirmState)} onOpenChange={(open) => !open && closeConfirm(false)}>
        <DialogContent className="rounded-3xl bg-background-primary-default border-border-button-default text-text-primary">
          <DialogHeader>
            <DialogTitle className="text-title-3-semibold text-text-primary">
              {confirmState?.options.title}
            </DialogTitle>
            {confirmState?.options.description && (
              <DialogDescription className="text-body-regular text-text-secondary">
                {confirmState.options.description}
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="border-separator-border">
            <Button variant="secondary" type="button" onClick={() => closeConfirm(false)}>
              {confirmState?.options.cancelLabel || "Cancel"}
            </Button>
            <Button
              variant={confirmState?.options.variant === "danger" ? "danger" : "primary"}
              type="button"
              onClick={() => closeConfirm(true)}
            >
              {confirmState?.options.confirmLabel || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reason Prompt Dialog ────────────────────────────────────────── */}
      <Dialog open={Boolean(promptState)} onOpenChange={(open) => !open && closePrompt(false)}>
        <DialogContent className="rounded-3xl bg-background-primary-default border-border-button-default text-text-primary">
          <DialogHeader>
            <DialogTitle className="text-title-3-semibold text-text-primary">
              {promptState?.options.title}
            </DialogTitle>
            {promptState?.options.description && (
              <DialogDescription className="text-body-regular text-text-secondary">
                {promptState.options.description}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-2">
            <textarea
              value={promptValue}
              onChange={(e) => {
                setPromptValue(e.target.value);
                if (promptError) setPromptError(null);
              }}
              rows={3}
              placeholder={promptState?.options.placeholder || "Enter details..."}
              className="w-full rounded-xl border border-border-button-default bg-background-secondary-default px-3.5 py-2.5 text-body-regular text-text-primary placeholder:text-text-placeholder outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
              autoFocus
            />
            {promptError && (
              <p className="text-caption-1-semibold text-text-error-primary">{promptError}</p>
            )}
          </div>
          <DialogFooter className="border-separator-border">
            <Button variant="secondary" type="button" onClick={() => closePrompt(false)}>
              {promptState?.options.cancelLabel || "Cancel"}
            </Button>
            <Button
              variant={promptState?.options.variant === "danger" ? "danger" : "primary"}
              type="button"
              onClick={() => closePrompt(true)}
            >
              {promptState?.options.confirmLabel || "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    return {
      toast: {
        success: () => {},
        error: () => {},
        info: () => {},
      },
      confirmDialog: async () => false,
      promptDialog: async () => null,
    };
  }
  return ctx;
}
