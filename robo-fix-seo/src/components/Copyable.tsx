"use client";
import { useState } from "react";

export default function Copyable({
  text,
  label,
}: {
  text: string;
  label?: string;
}) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1200);
      }}
      className="text-sm px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 border border-neutral-300"
      title="Copy"
    >
      {ok ? "Copied" : label ?? text}
    </button>
  );
}
