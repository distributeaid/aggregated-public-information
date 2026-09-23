import { CheckResult, ImageRef } from "./types.d";

export async function checkImageRef(
  ref: ImageRef,
  fetchApi = fetch,
): Promise<CheckResult> {
  try {
    const response = await fetchApi(ref.url, { method: "HEAD" });

    if (response.ok) {
      return { ...ref, status: "ok", detail: String(response.status) };
    }

    // Only a 404 means the image is gone; anything else means the check failed.
    if (response.status === 404) {
      return { ...ref, status: "missing", detail: "404 Not Found" };
    }

    return {
      ...ref,
      status: "unknown",
      detail: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ...ref,
      status: "unknown",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
