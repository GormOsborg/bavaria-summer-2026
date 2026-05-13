"use client";

import { deleteBookingAction } from "./actions";

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteBookingAction}
      onSubmit={(e) => {
        if (!confirm(`Slette bookingen til ${name}?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-foreground/60 hover:text-red-700 underline underline-offset-2"
      >
        Slett
      </button>
    </form>
  );
}
