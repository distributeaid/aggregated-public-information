/* global fetch */
import fs from "node:fs";
import process from "node:process";

const env = process.env;

if (!env.SLACK_WEBHOOK_URL) {
  throw new Error("Missing repository SLACK_WEBHOOK_URL secret");
}

const log = fs.existsSync("cloudinary-check.log")
  ? fs.readFileSync("cloudinary-check.log", "utf8")
  : "";

const checked = log.match(/Checked (\d+) published image URL/)?.[1];
const counts = log.match(
  /(\d+) missing, (\d+) invalid URL\/transformation, (\d+) could not be checked\./,
);
const logLink = `<${env.JOB_URL}|Open the check log>`;

let text;
if (checked && counts) {
  const [missing, invalid, unknown] = counts.slice(1).map(Number);
  text = [
    ":x: *Cloudinary image check failed. Production was not deployed.*",
    `${missing + invalid + unknown} of ${checked} images need attention: ${missing} missing, ${invalid} broken link, ${unknown} couldn't be checked.`,
    `${logLink} for details.`,
  ].join("\n");
} else {
  text = [
    ":x: *Cloudinary image check couldn't run. Production was not deployed.*",
    logLink,
  ].join("\n");
}

const response = await fetch(env.SLACK_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text, unfurl_links: false, unfurl_media: false }),
});
if (!response.ok) {
  throw new Error(
    `Slack returned ${response.status}: ${await response.text()}`,
  );
}
