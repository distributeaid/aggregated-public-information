import qs from "qs";
import lookup from "country-code-lookup";
import { STRAPI_ENV } from "../strapi-env";
import { UploadWorkflowStatus } from "../statusCodes";
import {
  Country,
  ShipmentCsv,
  CountryUploadWorkflow,
  CountryUploadWorkflowResults,
} from "./types.d";

/* Add Countries From SDR Shipments Sheet
 * ========================================================================== */
export async function addCountries(shipments: ShipmentCsv[]) {
  console.log("Adding Geo.countries from SDR Shipments sheet...");

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
  const resultsMap: CountryUploadWorkflowResults = Object.keys(
    UploadWorkflowStatus,
  ).reduce((resultsMap, key) => {
    resultsMap[key] = [];
    return resultsMap;
  }, {} as CountryUploadWorkflowResults);

  results
    .map((result) => {
      if (isFulfilled(result)) {
        return result.value;
      } else {
        return result.reason;
      }
    })
    .reduce((resultsMap, workflowResult) => {
      if (workflowResult.status) {
        resultsMap[workflowResult.status].push(workflowResult);
      } else {
        resultsMap[UploadWorkflowStatus.OTHER].push(workflowResult);
      }
      return resultsMap;
    }, resultsMap);

  console.log("Add Geo.countries results:");
  Object.keys(resultsMap).forEach((key) => {
    console.log(`    ${key}: ${resultsMap[key].length}`);

    // NOTE: uncomment & set the status key to debug different types of results
    // if (key !== UploadWorkflowStatus.SUCCESS && key !== UploadWorkflowStatus.ALREADY_EXISTS) {
    //   resultsMap[key].forEach((result) => {
    //     console.log(result)
    //     console.log("\n")
    //   })
    // }
  });

  console.log("Adding items completed!");

  const validCountries: Country[] = [
    ...resultsMap[UploadWorkflowStatus.SUCCESS],
    ...resultsMap[UploadWorkflowStatus.ALREADY_EXISTS],
  ].reduce((countries: Country[], workflow: CountryUploadWorkflow) => {
    return [...countries, workflow.data];
  }, [] as Country[]);

  return validCountries;
}

const isFulfilled = <T>(
  value: PromiseSettledResult<T>,
): value is PromiseFulfilledResult<T> => {
  return value.status === "fulfilled";
};

const _isRejected = <T>(
  value: PromiseSettledResult<T>,
): value is PromiseRejectedResult => {
  return value.status === "rejected";
};

/* Consolidate Countries
 * ------------------------------------------------------ */
function consolidateCountries(shipments: ShipmentCsv[]) {
  const countries = shipments.reduce((countries: Set<string>, shipment) => {
    if (shipment.sendingCountry !== "") {
      countries.add(shipment.sendingCountry);
    }

    if (shipment.receivingCountry !== "") {
      countries.add(shipment.receivingCountry);
    }

    return countries;
  }, new Set<string>());

  return countries;
}

/* Parse Country
 * ------------------------------------------------------ */
function parseCountry({
  data,
  orig,
  status,
  logs,
}: CountryUploadWorkflow): CountryUploadWorkflow {
  logs = [...logs, `Log: parsing Geo.country "${orig}"`];

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
  logs = [...logs, `Log: Checking if Geo.country "${orig}" already exists.`];

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
  const body = await response.json();

  if (!response.ok) {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      logs: [
        ...logs,
        `Error: Failed to get Geo.country. HttpStatus: ${response.status} - ${response.statusText}`,
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
        `Error: Found too many matching Geo.countries (${body.data.length}). Skipping...`,
      ],
    };
  }

  if (body.data.length === 1) {
    throw {
      data: body.data[0],
      orig,
      status: UploadWorkflowStatus.ALREADY_EXISTS,
      logs: [...logs, "Log: Found existing Geo.country. Skipping..."],
    };
  }

  return {
    data,
    orig,
    status,
    logs: [...logs, "Success: Confirmed Geo.country does not exist."],
  };
}

/* Upload Country
 * ------------------------------------------------------ */
async function uploadCountry({
  data,
  orig,
  /* status, */ logs,
}: CountryUploadWorkflow): Promise<CountryUploadWorkflow> {
  logs = [...logs, `Log: Creating Geo.country "${orig}".`];

  const response = await fetch(`${STRAPI_ENV.URL}/countries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
    body: JSON.stringify({ data }),
  });
  const body = await response.json();

  if (!response.ok) {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.UPLOAD_ERROR,
      logs: [
        ...logs,
        `Error: Failed to create Geo.country. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  return {
    data: body.data,
    orig,
    status: UploadWorkflowStatus.SUCCESS,
    logs: [...logs, "Success: Created Geo.country."],
  };
}
