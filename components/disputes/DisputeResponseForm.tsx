"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  responseId: string;
  action: (formData: FormData) => void | Promise<void>;
};

function SubmitButton({ locked }: { locked: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || locked;

  return (
    <button
      disabled={disabled}
      className="h-10 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {disabled ? "Submitting..." : "Submit Response"}
    </button>
  );
}

export default function DisputeResponseForm({ responseId, action }: Props) {
  const [locked, setLocked] = useState(false);
  const submittedRef = useRef(false);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (submittedRef.current) {
          event.preventDefault();
          return;
        }
        submittedRef.current = true;
        setLocked(true);
      }}
      className="mt-3 space-y-2"
    >
      <input type="hidden" name="responseId" value={responseId} />
      <textarea
        name="responseText"
        required
        minLength={10}
        rows={4}
        disabled={locked}
        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <SubmitButton locked={locked} />
    </form>
  );
}
