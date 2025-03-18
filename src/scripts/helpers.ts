import fs from "fs";
import { ResponseHandleParams } from "./import-needs-assessment-data/types";
import { UploadWorkflowStatus } from "./statusCodes";

export function toTitleCase(input: string) {
  return input.replace(
    /\w[^\s|.|\-|/]*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );
}

export function toBoolean(input: string, empty: boolean | undefined = false) {
  input = input.toLowerCase();

  if (input === "") {
    return empty;
  }

  if (input === "true") {
    return true;
  }

  if (input === "false") {
    return false;
  }

  throw new Error(`toBoolean: input string "${input}" is not a boolean`);
}

export function stripAndParseInt(numberString: string): number {
  return parseInt(numberString.replace(/\$|,/g, ""));
}

export function stripAndParseFloat(numberString: string): number {
  return parseFloat(numberString.replace(/\$|,|%/g, ""));
}

/* Generic function to handle http responses from Strapi for Region and Subregion uploads */
export function handleResponse<T>({
  response,
  data,
  orig,
  logs,
  status,
  successMessage,
}: ResponseHandleParams): unknown {
  if (!response.ok) {
    throw {
      data,
      orig,
      status,
      logs,
      message: `HttpStatus: ${response.status} - ${response.statusText}`,
    };
  }

  const result = {
    data: data as T,
    orig: orig as T | string,
    status: UploadWorkflowStatus.SUCCESS,
    logs: [...logs, `Success: ${successMessage}`],
  };

  return result;
}

export function logErrorToFile(
  error: unknown,
  upload: string,
  logFilePath: string,
) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] Error processing upload ${upload}: ${error instanceof Error ? error.stack : String(error)}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Failed to write to log file:", err);
    }
  });
}
