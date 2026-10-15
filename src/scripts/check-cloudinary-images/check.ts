import { CheckResult, ImageRef } from "./types.d";

const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 10_000;
const BACKOFF_MS = 500;

// 423 is Cloudinary's "derived asset still processing".
const isRetryable = (status: number) =>
  status === 408 || status === 423 || status === 429 || status >= 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// "fetch failed" hides the real reason (e.g. ECONNRESET) in error.cause.
function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const { code, cause } = error as { code?: string; cause?: unknown };
  const text = `${error.name}: ${error.message}${code ? ` (${code})` : ""}`;
  return cause ? `${text}; cause: ${describeError(cause)}` : text;
}

export async function checkImageRef(
  ref: ImageRef,
  fetchApi = fetch,
): Promise<CheckResult> {
  let detail = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) await sleep(BACKOFF_MS * 2 ** (attempt - 2));
    const tries = `(attempt ${attempt}/${MAX_ATTEMPTS})`;

    try {
      const response = await fetchApi(ref.url, {
        method: "HEAD",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      // Cloudinary explains failed deliveries in X-Cld-Error.
      // https://cloudinary.com/documentation/ts_what_are_the_common_error_codes_returned_in_the_x_cld_error_header_when_delivering_assets
      const reason = response.headers.get("x-cld-error");
      detail = `HTTP ${response.status} ${tries}${reason ? `; X-Cld-Error: ${reason}` : ""}`;

      if (response.ok) return { ...ref, status: "ok", detail };
      if (response.status === 404) return { ...ref, status: "missing", detail };
      if (response.status === 400) return { ...ref, status: "invalid", detail };
      if (!isRetryable(response.status)) {
        return { ...ref, status: "unknown", detail };
      }
    } catch (error) {
      detail = `${describeError(error)} ${tries}`;
    }
  }

  return { ...ref, status: "unknown", detail };
}
