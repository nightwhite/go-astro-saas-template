interface AuthEntryHintsProps {
  mode: "sign-in" | "sign-up";
}

export function AuthEntryHints({ mode }: AuthEntryHintsProps) {
  const isSignIn = mode === "sign-in";
  const ssoLabel = isSignIn ? "Sign in with Google" : "Sign up with Google";
  const passkeyLabel = isSignIn ? "Sign in with Passkey" : "Sign up with Passkey";

  return (
    <div className="space-y-3">
      <a
        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
        href="/api/v1/auth/sso/google/start"
      >
        {ssoLabel}
      </a>
      <button
        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
        type="button"
        data-auth-passkey={mode}
      >
        {passkeyLabel}
      </button>
      <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Captcha is enabled by server policy when configured. Development mode can keep it relaxed.
      </div>
    </div>
  );
}

