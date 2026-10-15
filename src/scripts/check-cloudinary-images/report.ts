import { CheckResult } from "./types.d";

export function adminUrl(result: CheckResult): string | undefined {
  const strapiUrl = process.env.STRAPI_URL;
  if (!strapiUrl) return undefined;

  return new URL(
    `/admin/content-manager/collection-types/api::response.${result.collection}/${result.documentId}`,
    strapiUrl,
  ).toString();
}

const printResult = (result: CheckResult, heading: string) => {
  console.log(`${heading}  ${result.displayName} → "${result.label}"`);
  console.log(`         ${result.field}`);
  console.log(`         ${result.url}`);
  console.log(`         result: ${result.detail}`);

  const edit = adminUrl(result);
  if (edit) console.log(`         edit: ${edit}`);

  if (result.publicPath) {
    console.log(`         appears on: ${result.publicPath}`);
  }

  console.log("");
};

export function reportResults(results: CheckResult[]): {
  missing: CheckResult[];
  invalid: CheckResult[];
  unknown: CheckResult[];
} {
  const missing = results.filter((result) => result.status === "missing");
  const invalid = results.filter((result) => result.status === "invalid");
  const unknown = results.filter((result) => result.status === "unknown");

  console.log(`Checked ${results.length} published image URL(s).\n`);

  for (const result of missing) printResult(result, "MISSING");
  for (const result of invalid) printResult(result, "INVALID_URL");
  for (const result of unknown) printResult(result, "UNKNOWN");

  console.log(
    `${missing.length} missing, ${invalid.length} invalid URL/transformation, ${unknown.length} could not be checked.`,
  );

  return { missing, invalid, unknown };
}
