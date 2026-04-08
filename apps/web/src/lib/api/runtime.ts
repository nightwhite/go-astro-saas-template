export function getAPIBaseURL(): string {
  // Always use same-origin `/api` and let Astro proxy forward to APP_BASE_URL.
  // This avoids CORS + cookie issues in browsers.
  return "";
}
