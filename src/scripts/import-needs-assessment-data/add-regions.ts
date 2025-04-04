import { STRAPI_ENV } from "../strapi-env";
import { UploadWorkflowStatus } from "../utils/statusCodes";
import { isFulfilled, _isRejected } from "../utils/promiseUtils";
import {
  Region,
  NeedAssessment,
  RegionUploadWorkflow,
  RegionUploadWorkflowResults,
} from "./types.d";

/*  Add Regions from Needs Assessment Data
 * ------------------------------------------------------- */
export async function addRegions(data: NeedAssessment[]): Promise<Region[]> {
  console.log("Adding Geo.regions from the Needs Assessment data ...");

  const uniqueRegions = consolidateRegions(data);

  const results = await Promise.allSettled<RegionUploadWorkflow>(
    uniqueRegions.map((region) => {
      return new Promise<RegionUploadWorkflow>((resolve, _reject) => {
        resolve({
          data: { region },
          orig: region,
          status: UploadWorkflowStatus.PROCESSING,
          logs: [],
        });
      })
        .then(parseRegion)
        .then(getRegion)
        .then(uploadRegion);
    }),
  );

  // { "SUCCESS": [], "ALREADY_EXITS": [], ...}
  const resultsMap: RegionUploadWorkflowResults = Object.keys(
    UploadWorkflowStatus,
  ).reduce((resultsMap, key) => {
    resultsMap[key] = [];
    return resultsMap;
  }, {} as RegionUploadWorkflowResults);

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

  console.log("Add Geo.regions results:");
  Object.keys(resultsMap).forEach((key) => {
    console.log(`     ${key}: ${resultsMap[key].length}`);

    // NOTE: uncomment & set the status key to debug different types of results
    // if (key !== UploadWorkflowStatus.SUCCESS && key !== UploadWorkflowStatus.ALREADY_EXISTS) {
    //   resultsMap[key].forEach((result) => {
    //     console.log(result)
    //     console.log("\n")
    //   })
    // }
  });

  console.log("Adding items completed!");

  const validRegions: Region[] = [
    ...resultsMap[UploadWorkflowStatus.SUCCESS],
    ...resultsMap[UploadWorkflowStatus.ALREADY_EXISTS],
  ].reduce((regions: Region[], workflow: RegionUploadWorkflow) => {
    return [...regions, workflow.data];
  }, [] as Region[]);

  return validRegions;
}

/*  Consolidate Regions
 * ------------------------------------------------------- */
function consolidateRegions(data: NeedAssessment[]): string[] {
  const regions = new Set<string>();

  data.forEach((item) => {
    const region = item.place?.region;
    if (region && region !== null) {
      regions.add(region);
    }
  });

  return Array.from(regions);
}

/*  Parse Region
 * ------------------------------------------------------- */
function parseRegion({
  data,
  orig,
  status,
  logs,
}: RegionUploadWorkflow): RegionUploadWorkflow {
  logs = [...logs, `Log: parsing region "${orig}"`];

  if (orig == null || typeof orig !== "string") {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.ORIGINAL_DATA_INVALID,
      logs: [
        ...logs,
        `Error: Invalid region input: "${orig}". Expected a non-null value.`,
      ],
    };
  }

  const newData = {
    ...data,
    region: orig,
  };

  return {
    data: newData,
    orig,
    status,
    logs,
  };
}

/*  Get Region
 * ------------------------------------------------------- */
async function getRegion({
  data,
  orig,
  status,
  logs,
}: RegionUploadWorkflow): Promise<RegionUploadWorkflow> {
  logs = [...logs, `Log: Checking if Geo.region "${orig}" already exists.`];

  //Fetch the data from Strapi
  const response = await fetch(`${STRAPI_ENV.URL}/regions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const body = await response.json();
  const matchingRegion = body.data.find(
    (region) => region.name.toLowerCase() === data.region.toLowerCase(),
  );

  if (!response.ok) {
    console.log("Non-ok response");
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      logs: [
        ...logs,
        `Error: Failed to get Geo.region. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  if (matchingRegion) {
    throw {
      data: body.data,
      orig,
      status: UploadWorkflowStatus.ALREADY_EXISTS,
      logs: [...logs, "Log: Found existing Geo.region. Skipping..."],
    };
  }

  return {
    data,
    orig,
    status,
    logs: [...logs, "Success: Confirmed Geo.region does not exist."],
  };
}

/*  Upload Region
 * ------------------------------------------------------- */
async function uploadRegion({
  data,
  orig,
  /* status, */ logs,
}: RegionUploadWorkflow): Promise<RegionUploadWorkflow> {
  logs = [...logs, `Log: Creating Geo.region "${orig}".`];

  const response = await fetch(`${STRAPI_ENV.URL}/regions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
    body: JSON.stringify({
      data: {
        Name: data.region,
      },
    }),
  });
  const body = await response.json();

  if (!response.ok) {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.UPLOAD_ERROR,
      logs: [
        ...logs,
        `Error: Failed to create Geo.region. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  return {
    data: body.data,
    orig,
    status: UploadWorkflowStatus.SUCCESS,
    logs: [...logs, "Success: Created Geo.region."],
  };
}
