import pLimit from "p-limit";
import { STRAPI_ENV } from "../strapi-env";
import { collectImageRefs } from "./collect";
import { checkImageRef } from "./check";
import { reportResults } from "./report";

/* Check Cloudinary Images — reports published images whose URL no longer resolves.
 *   yarn script:check-cloudinary-images
 */

const CONCURRENT_REQUESTS = 5;

async function main(): Promise<void> {
  const args = process.argv
    .slice(2)
    .filter((argument) => !argument.startsWith("dotenv_config_"));

  if (args.length > 0) {
    throw new Error("Usage: yarn script:check-cloudinary-images");
  }

  if (!process.env.STRAPI_URL || !STRAPI_ENV.KEY) {
    throw new Error(
      "STRAPI_URL and STRAPI_API_KEY must both be set in src/scripts/.env.",
    );
  }

  const refs = await collectImageRefs();
  const limit = pLimit(CONCURRENT_REQUESTS);
  const results = await Promise.all(
    refs.map((ref) => limit(() => checkImageRef(ref))),
  );

  const { missing } = reportResults(results);

  // Only a confirmed 404 fails the run; an unreachable host is not a finding.
  if (missing.length > 0) process.exitCode = 1;
}

void main().catch((error: unknown) => {
  process.exitCode = 1;
  console.error(
    error instanceof Error ? error.message : "Cloudinary image check failed.",
  );
});
