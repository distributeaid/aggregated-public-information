import { checkImageRef } from "./check";
import { ImageRef } from "./types.d";

// Status classification is exercised by live runs; only the retry policy,
// which needs failures on demand, is tested here.

const ref: ImageRef = {
  collection: "overview",
  displayName: "Response.Overview",
  documentId: "entry",
  label: "Test",
  field: "imageGallery entry 1",
  url: "https://example.test/image",
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const mockFetch = () =>
  jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

async function run(fetchApi: typeof fetch) {
  const pending = checkImageRef(ref, fetchApi);
  await jest.runAllTimersAsync();
  return pending;
}

describe("checkImageRef", () => {
  it("retries a transient failure", async () => {
    const fetchApi = mockFetch()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValue(new Response(null, { status: 200 }));
    expect((await run(fetchApi)).status).toBe("ok");
    expect(fetchApi).toHaveBeenCalledTimes(2);
  });

  it("gives up as unknown after 3 failed attempts", async () => {
    const fetchApi = mockFetch().mockRejectedValue(
      new TypeError("fetch failed"),
    );
    expect((await run(fetchApi)).status).toBe("unknown");
    expect(fetchApi).toHaveBeenCalledTimes(3);
  });
});
