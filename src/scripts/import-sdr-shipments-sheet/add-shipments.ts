import qs from "qs";
import { STRAPI_ENV } from "../strapi-env";
import { toTitleCase, stripAndParseFloat, toBoolean } from "../helpers";
import { UploadWorkflowStatus } from "../statusCodes";
import {
  Country,
  Shipment,
  ShipmentCsv,
  ShipmentUploadWorkflow,
  CountryCodeToId,
  ShipmentUploadWorkflowResults,
} from "./types.d";

/* Add Shipments From SDR Shipments Sheet
 * ========================================================================== */
export async function addShipments(
  shipments: ShipmentCsv[],
  countries: Country[],
) {
  console.log("Adding Reporting.Shipments from SDR Shipments sheet...");

  const countryCodeToId = countries.reduce((codesToId, country) => {
    codesToId[country.code] = country.documentId;
    return codesToId;
  }, {} as CountryCodeToId);

  const parseShipmentClosure = parseShipment(countryCodeToId);

  const results = await Promise.allSettled<ShipmentUploadWorkflow>(
    shipments.map((shipment) => {
      return new Promise<ShipmentUploadWorkflow>((resolve, _reject) => {
        resolve({
          data: {},
          orig: shipment,
          status: UploadWorkflowStatus.PROCESSING,
          logs: [],
        });
      })
        .then(parseShipmentClosure)
        .then(parseShipmentRoles)
        .then(getShipment)
        .then(uploadShipment);
    }),
  );

  // { "SUCCESS": [], "ALREADY_EXISTS": [], ...}
  const resultsMap: ShipmentUploadWorkflowResults = Object.keys(
    UploadWorkflowStatus,
  ).reduce((resultsMap, key) => {
    resultsMap[key] = [];
    return resultsMap;
  }, {} as ShipmentUploadWorkflowResults);

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

  console.log("Add Reporting.Shipments results:");
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

  console.log("Adding shipments completed!");

  const validShipments: Shipment[] = [
    ...resultsMap[UploadWorkflowStatus.SUCCESS],
    ...resultsMap[UploadWorkflowStatus.ALREADY_EXISTS],
  ];

  return validShipments;
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

/* Parse Shipment
 * ------------------------------------------------------
 * Uses a closure so that we can keep the same call signature to use in
 * our workflow.
 */
function parseShipment(countries: CountryCodeToId) {
  return (workflow: ShipmentUploadWorkflow): ShipmentUploadWorkflow => {
    return parseShipmentInner(workflow, countries);
  };
}

function parseShipmentInner(
  { data, orig, status, logs }: ShipmentUploadWorkflow,
  countries: CountryCodeToId,
): ShipmentUploadWorkflow {
  logs = [...logs, `Log: parsing Reporting.Shipment "${orig.number}"`];

  const sendingCountry = countries[orig.sendingCountry.toUpperCase()];
  const receivingCountry = countries[orig.receivingCountry.toUpperCase()];
  if (
    orig.number === "" ||
    sendingCountry === undefined ||
    receivingCountry === undefined
  ) {
    if (orig.number == "") {
      logs = [...logs, `Error: No shipment number. Skipping...`];
    }
    if (sendingCountry === undefined) {
      logs = [
        ...logs,
        `Error: Sending country "${orig.sendingCountry}" doesn't exist. Skipping...`,
      ];
    }
    if (receivingCountry === undefined) {
      logs = [
        ...logs,
        `Error: Receiving country "${orig.receivingCountry}" doesn't exist. Skipping...`,
      ];
    }
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.ORIGINAL_DATA_INVALID,
      logs,
    };
  }

  const shipment = {
    number: orig.number.toUpperCase(),
    sendingCountry,
    receivingCountry,

    // skip exporter / importer for now

    type: toTitleCase(orig.type),
    project: toTitleCase(orig.project),
    carbonOffsetPaid: orig.carbonOffsetPaid.toLowerCase() === "true",
    co2TonsGenerated: stripAndParseFloat(orig.co2TonsGenerated),
    carbonOffsetCost: stripAndParseFloat(orig.carbonOffsetCost),
  };

  return {
    data: shipment,
    orig,
    status,
    logs,
  };
}

/* Parse Shipment Roles
 * ------------------------------------------------------ */
function parseShipmentRoles({
  data,
  orig,
  status,
  logs,
}: ShipmentUploadWorkflow): ShipmentUploadWorkflow {
  logs = [
    ...logs,
    `Log: parsing roles for Reporting.Shipment "${orig.number}"`,
  ];

  const roles = {
    needsAssessment: toBoolean(orig.daRoles.needsAssessment),
    sourcingInKindDonations: toBoolean(orig.daRoles.sourcingInKindDonations),
    sourcingProcurement: toBoolean(orig.daRoles.sourcingProcurement),
    sourcingCommunityCollection: toBoolean(
      orig.daRoles.sourcingCommunityCollection,
    ),
    aidMatching: toBoolean(orig.daRoles.aidMatching),
    firstMileTransportation: toBoolean(orig.daRoles.firstMileTransportation),
    firstMileStorageCommunity: toBoolean(
      orig.daRoles.firstMileStorageCommunity,
    ),
    firstMileStorageCommercial: toBoolean(
      orig.daRoles.firstMileStorageCommercial,
    ),
    mainLegTransportation: toBoolean(orig.daRoles.mainLegTransportation),
    customsTransit: toBoolean(orig.daRoles.customsTransit),
    customsExport: toBoolean(orig.daRoles.customsExport),
    customsImport: toBoolean(orig.daRoles.customsImport),
    lastMileTransportation: toBoolean(orig.daRoles.lastMileTransportation),
    lastMileStorageCommunity: toBoolean(orig.daRoles.lastMileStorageCommunity),
    lastMileStorageCommercial: toBoolean(
      orig.daRoles.lastMileStorageCommercial,
    ),
  };

  return {
    data: {
      ...data,
      daRoles: roles,
    },
    orig,
    status,
    logs,
  };
}

/* Parse Shipment Roles
 * ------------------------------------------------------ */
async function getShipment({
  data,
  orig,
  status,
  logs,
}: ShipmentUploadWorkflow): Promise<ShipmentUploadWorkflow> {
  logs = [
    ...logs,
    `Log: Checking if Reporting.Shipment "${orig.number}" already exists.`,
  ];

  const query = qs.stringify({
    filters: {
      number: {
        $eq: data.number,
      },
    },
  });

  const response = await fetch(`${STRAPI_ENV.URL}/shipments?${query}`, {
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
        `Error: Failed to get Reporting.Shipment. HttpStatus: ${response.status} - ${response.statusText}`,
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
        `Error: Found too many matching Reporting.Shipments (${body.data.length}). Skipping...`,
      ],
    };
  }

  if (body.data.length === 1) {
    throw {
      data: body.data[0],
      orig,
      status: UploadWorkflowStatus.ALREADY_EXISTS,
      logs: [...logs, "Log: Found existing Reporting.Shipment. Skipping..."],
    };
  }

  return {
    data,
    orig,
    status,
    logs: [...logs, "Success: Confirmed Reporting.Shipment does not exist."],
  };
}

/* Parse Shipment Roles
 * ------------------------------------------------------ */
async function uploadShipment({
  data,
  orig,
  /* status, */ logs,
}: ShipmentUploadWorkflow): Promise<ShipmentUploadWorkflow> {
  logs = [...logs, `Log: Creating Reporting.Shipment "${orig.number}".`];

  const response = await fetch(`${STRAPI_ENV.URL}/shipments`, {
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
        `Error: Failed to create Reporting.Shipment. HttpStatus: ${response.status} - ${response.statusText}`,
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
