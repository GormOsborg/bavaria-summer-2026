"use client";

import { useActionState } from "react";
import { signInAction, type ActionState } from "./actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(
    signInAction,
    undefined,
  );

  return (
    <div className="max-w-md mx-auto rounded-2xl border border-foreground/10 bg-background p-6">
      <h1 className="text-2xl font-semibold">Logg inn</h1>
      <p className="mt-2 text-sm text-foreground/70">
        Skriv inn passordet du fikk i gruppechatten for å bestille lugar.
      </p>
      <form action={formAction} className="mt-4 flex flex-col gap-3">
        <label className="text-sm font-medium" htmlFor="password">
          Passord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-foreground/15 bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {state && !state.ok && (
          <p className="text-sm text-red-700">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-accent text-background px-4 py-2 font-medium disabled:opacity-60"
        >
          {pending ? "Sjekker…" : "Logg inn"}
        </button>
      </form>
    </div>
  );
}
