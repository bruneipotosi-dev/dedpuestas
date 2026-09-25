"use client";

import Script from "next/script";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Widget invisible de Cloudflare Turnstile. Si no hay site key configurada
 * (desarrollo local) no renderiza nada — el server tampoco exige el token
 * en ese caso (ver src/lib/turnstile.ts).
 */
export function TurnstileWidget() {
  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} data-size="invisible" />
    </>
  );
}
