"use client";

import { useActionState } from "react";
import { initialAdminLoginState, requestAdminSignIn } from "@/app/admin/login/actions";

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(requestAdminSignIn, initialAdminLoginState);

  return (
    <form action={formAction} className="admin-login-form">
      <label htmlFor="admin-email">Provisioned admin or staff email</label>
      <input id="admin-email" name="email" type="email" autoComplete="email" required maxLength={254} />
      <button className="button button-primary" type="submit" disabled={isPending}>
        {isPending ? "Sending link…" : "Send sign-in link"}
      </button>
      {state.message ? <p role="status" aria-live="polite">{state.message}</p> : null}
    </form>
  );
}
