import { STRAPI_ENV } from "../strapi-env";
import { UploadWorkflowStatus } from "../statusCodes";
import {
  Subregion,
  NeedAssessment,
  SubregionUploadWorkflow,
  SubregionUploadWorkflowResults,
  ResponseHandleParams,
} from "./types.d";

/*  Add Subregions from Needs Assessment Data
 * ------------------------------------------------------- */
export async function addSubregions(
  data: NeedAssessment[],
): Promise<Subregion[]> {
  console.log("Adding Geo.Subregions from the Needs Assessment data ...");

  const uniqueSubregions = consolidateSubregions(data);

  const results = await Promise.allSettled<SubregionUploadWorkflow>(
    uniqueSubregions.map((subregion) => {
      return new Promise<SubregionUploadWorkflow>((resolve, _reject) => {
        resolve({
          data: {},
          orig: subregion,
          status: UploadWorkflowStatus.PROCESSING,
          logs: [],
        });
      })
        .then(parseSubregion)
        .then(getSubregion)
        .then(uploadSubregion);
    }),
  );

  // { "SUCCESS": [], "ALREADY_EXITS": [], ...}
  const resultsMap: SubregionUploadWorkflowResults = Object.keys(
    UploadWorkflowStatus,
  ).reduce((resultsMap, key) => {
    resultsMap[key] = [];
    return resultsMap;
  }, {} as SubregionUploadWorkflowResults);

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

  console.log("Add Geo.Subregions results:");

  Object.keys(resultsMap).forEach((key) => {
    console.log(`     ${key}: ${resultsMap[key].length}`);

    //   NOTE: uncomment & set the status key to debug different types of results
    //   if (key !== UploadWorkflowStatus.SUCCESS && key !== UploadWorkflowStatus.ALREADY_EXISTS) {
    //      resultsMap[key].forEach((result) => {
    //          console.log(result)
    //          console.log("\n")
    //      })
    //   }
  });

  console.log("Adding items completed!");

  const validSubregions: Subregion[] = [
    ...resultsMap[UploadWorkflowStatus.SUCCESS],
    ...resultsMap[UploadWorkflowStatus.ALREADY_EXISTS],
  ].reduce((subregions: Subregion[], workflow: SubregionUploadWorkflow) => {
    return [...subregions, workflow.data];
  }, [] as Subregion[]);

  return validSubregions;
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

/*  Consolidate Subregions
 * ------------------------------------------------------- */
function consolidateSubregions(data: NeedAssessment[]): string[] {
  const subregions = data.reduce((acc: string[], item) => {
    const subregion = item.place?.subregion;
    if (subregion && !acc.includes(subregion)) {
      acc.push(subregion);
    }
    return acc;
  }, []);

  return subregions;
}

/*  Parse Subregion
 * ------------------------------------------------------- */
function parseSubregion({
  data,
  orig,
  status,
  logs,
}: SubregionUploadWorkflow): SubregionUploadWorkflow {
  logs = [...logs, `Log: parsing subregion "${orig}"`];

  if (orig == null || typeof orig !== "string") {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.ORIGINAL_DATA_INVALID,
      logs: [
        ...logs,
        `Error: Invalid subregion input: "${orig}". Expected a non-null value.`,
      ],
    };
  }

  const newData = {
    ...data,
    subregion: orig,
  };

  return {
    data: newData,
    orig,
    status,
    logs,
  };
}

/*  Get Subregion
 * ------------------------------------------------------- */
async function getSubregion({
  data,
  orig,
  status,
  logs,
}: SubregionUploadWorkflow): Promise<SubregionUploadWorkflow> {
  logs = [...logs, `Log: Checking if Geo.Subregion "${orig}" already exists.`];

  //Fetch the data from Strapi
  const response = await fetch(`${STRAPI_ENV.URL}/subregions?`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const body = await response.json();
  const matchingSubregion = body.data.find(
    (subregion) =>
      subregion.Name.toLowerCase() === data.subregion.toLowerCase(),
  );

  if (!response.ok) {
    console.log("Non-ok response");
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      logs: [
        ...logs,
        `Error: Failed to get Geo.Subregion. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  if (matchingSubregion) {
    throw {
      data: body.data,
      orig,
      status: UploadWorkflowStatus.ALREADY_EXISTS,
      logs: [...logs, "Log: Found existing Geo.Subregion. Skipping..."],
    };
  }

  return {
    data,
    orig,
    status,
    logs: [...logs, "Success: Confirmed Geo.Subregion does not exist."],
  };
}

/*  Upload Subregion
 * ------------------------------------------------------- */
async function uploadSubregion({
  data,
  orig,
  /* status, */ logs,
}: SubregionUploadWorkflow): Promise<SubregionUploadWorkflow> {
  logs = [...logs, `Log: Creating Geo.Subregion "${orig}".`];

  const response = await fetch(`${STRAPI_ENV.URL}/subregions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
    body: JSON.stringify({
      data: {
        Name: data.subregion,
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
        `Error: Failed to create Geo.Subregion. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  return {
    data: body.data,
    orig,
    status: UploadWorkflowStatus.SUCCESS,
    logs: [...logs, "Success: Created Geo.Subregion."],
  };
}


