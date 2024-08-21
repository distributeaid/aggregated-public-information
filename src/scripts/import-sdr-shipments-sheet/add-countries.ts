import qs from "qs";
import lookup from "country-code-lookup";
import { STRAPI_ENV } from "../strapi-env";
import {
  Country,
  ShipmentCsv,
  CountryUploadWorkflow,
  UploadWorkflowStatus,
  CountryUploadWorkflowResults,
} from "./types.d";
import _ from "lodash";
import { isFulfilled } from "./typeUtils";

/* Add Countries From SDR Shipments Sheet
 * ========================================================================== */
export async function addCountries(shipments: ShipmentCsv[]) {
  console.log("Adding Geo.Countries from SDR Shipments sheet...");

  const uniqueCountries = [...consolidateCountries(shipments)];

  const results = await Promise.allSettled<CountryUploadWorkflow>(
    uniqueCountries.map((country) => {
      return new Promise<CountryUploadWorkflow>((resolve, _reject) => {
        resolve({
          data: {},
          orig: country,
          status: UploadWorkflowStatus.PROCESSING,
          logs: [],
        });
      })
        .then(parseCountry)
        .then(getCountry)
        .then(uploadCountry);
    }),
  );

  // { "SUCCESS": [], "ALREADY_EXISTS": [], ...}
  const resultsMap: CountryUploadWorkflowResults = {
    ...(_.chain(UploadWorkflowStatus)
      .keys()
      .map((key) => [key, [] as Country[]])
      .fromPairs()
      .value() as CountryUploadWorkflowResults),
    ..._.chain(results)
      .map((res) => (isFulfilled(res) ? res.value : res.reason))
      .groupBy((res) => res.status ?? UploadWorkflowStatus.OTHER)
      .value(),
  };

  console.log("Add Geo.Countries results:");

  Object.keys(resultsMap).forEach((key) => {
    console.log(`    ${key}: ${resultsMap[key].length}`);

    // NOTE: uncomment & set the status key to debug different types of results
    // if (
    //   key !== UploadWorkflowStatus.SUCCESS &&
    //   key !== UploadWorkflowStatus.ALREADY_EXISTS
    // ) {
    //   resultsMap[key].forEach((result) => {
    //     console.log(result);
    //     console.log("\n");
    //   });
    // }
  });

  console.log("Adding items completed!");

  const validCountries: Country[] = [
    ...resultsMap[UploadWorkflowStatus.SUCCESS],
    ...resultsMap[UploadWorkflowStatus.ALREADY_EXISTS],
  ].map((workflow) => workflow.data);

  return validCountries;
}

/* Consolidate Countries
 * ------------------------------------------------------ */
function consolidateCountries(shipments: ShipmentCsv[]): Set<string> {
  return new Set(
    shipments.flatMap((s) =>
      [s.sendingCountry, s.receivingCountry].filter((v) => v !== ""),
    ),
  );
}

/* Parse Country
 * ------------------------------------------------------ */
function parseCountry({
  data,
  orig,
  status,
  logs,
}: CountryUploadWorkflow): CountryUploadWorkflow {
  logs = [...logs, `Log: parsing Geo.Country "${orig}"`];

  const code = orig.toUpperCase();
  const name = lookup.byIso(code)?.country;
  data = {
    ...data,
    code,
    name,
  };

  if (name === undefined) {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.ORIGINAL_DATA_INVALID,
      logs: [
        ...logs,
        `Error: "${code}" is an invalid ISO 3166 3-digit country code.`,
      ],
    };
  }

  return {
    data,
    orig,
    status,
    logs,
  };
}

/* Get Country
 * ------------------------------------------------------ */
async function getCountry({
  data,
  orig,
  status,
  logs,
}: CountryUploadWorkflow): Promise<CountryUploadWorkflow> {
  logs = [...logs, `Log: Checking if Geo.Country "${orig}" already exists.`];

  const query = qs.stringify({
    filters: {
      code: {
        $eq: data.code,
      },
    },
  });

  const response = await fetch(`${STRAPI_ENV.URL}/countries?${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  let body;

  try {
    body = await response.json();
  } catch (error) {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      error,
      logs: [
        ...logs,
        `Error: Failed to get Geo.Country. HttpStatus: ${response.status} - ${response.statusText}`,
      ],
    };
  }

  if (!response.ok) {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      logs: [
        ...logs,
        `Error: Failed to get Geo.Country. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  if (body.data.length > 1) {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      logs: [
        ...logs,
        `Error: Found too many matching Geo.Countries (${body.data.length}). Skipping...`,
      ],
    };
  }

  if (body.data.length === 1) {
    throw {
      data: body.data[0],
      orig,
      status: UploadWorkflowStatus.ALREADY_EXISTS,
      logs: [...logs, "Log: Found existing Geo.Country. Skipping..."],
    };
  }

  return {
    data,
    orig,
    status,
    logs: [...logs, "Success: Confirmed Geo.Country does not exist."],
  };
}

/* Upload Country
 * ------------------------------------------------------ */
async function uploadCountry({
  data,
  orig,
  /* status, */ logs,
}: CountryUploadWorkflow): Promise<CountryUploadWorkflow> {
  logs = [...logs, `Log: Creating Geo.Country "${orig}".`];

  const response = await fetch(`${STRAPI_ENV.URL}/countries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
    body: JSON.stringify({ data }),
  });

  let body;

  try {
    body = await response.json();
  } catch (error) {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      error,
      logs: [
        ...logs,
        `Error: Failed to create Geo.Country. HttpStatus: ${response.status} - ${response.statusText}`,
      ],
    };
  }

  if (!response.ok) {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.UPLOAD_ERROR,
      logs: [
        ...logs,
        `Error: Failed to create Geo.Country. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  return {
    data: body.data,
    orig,
    status: UploadWorkflowStatus.SUCCESS,
    logs: [...logs, "Success: Created Geo.Country."],
  };
}
