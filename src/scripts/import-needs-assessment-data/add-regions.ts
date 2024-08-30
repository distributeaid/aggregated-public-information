import qs from "qs";
import { STRAPI_ENV } from "../strapi-env";
import {
    // PlaceData,
    Region,
    // Subregion,
    NeedAssessment,
    RegionUploadWorkflow,
    UploadWorkflowStatus,
    RegionUploadWorkflowResults,
} from "./types.d";

export function consolidateRegions(data: NeedAssessment[]): Set<string> {
    const regions = data.reduce((acc: Set<string>, item) => {
      const region = item.place?.region;
      if (region) {
        acc.add(region);
      }
      return acc;
    }, new Set<string>());
  
    // Log the consolidated regions to the terminal
    console.log(regions);
  
    return regions;
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

  if (orig == null || typeof orig !== 'string') {
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
export async function getRegion({
  data,
  orig,
  status,
  logs,
}: RegionUploadWorkflow): Promise<RegionUploadWorkflow> {
  logs = [...logs, `Log: Checking if Geo.Region "${orig}" already exists.`];
  console.log('Initial logs:', logs);

  // const query = qs.stringify({
  //   filters: {
  //     region: { $eq: data.region },
  //   }, 
  // }, { encodeValuesOnly: true });  // Encode values only, not keys

  //Fetch the data from Strapi
  // const response = await fetch(`${STRAPI_ENV.URL}/regions?${query}`, {
  const response = await fetch(`${STRAPI_ENV.URL}/regions?`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });
  // console.log('Response status', response.status);
  // console.log('Response ok', response.ok);

  const body = await response.json();
  const matchingRegion = body.data.find((region) =>
    region.Name.toLowerCase() === data.region.toLowerCase()
  );

  if (!response.ok) {
    console.log('Non-ok response');
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      logs: [
        ...logs,
        `Error: Failed to get Geo.Region. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  console.log('Number of matching regions:', body.data.length);

  // if (body.data.length > 1) {
  //   console.warn('too many matching regions found');
  //   throw {
  //     data,
  //     orig,
  //     status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
  //     logs: [
  //       ...logs,
  //       `Error: Found too many matching Geo.Regions (${body.data.length}). Skipping...`,
  //     ],
  //   };
  // }

  if (matchingRegion) {
    console.log('Existing region found');
    throw {
      data: body.data,
      orig,
      status: UploadWorkflowStatus.ALREADY_EXISTS,
      logs: [...logs, "Log: Found existing Geo.Region. Skipping..."],
    };
  }

  console.log('Region does not exist');
  return {
    data,
    orig,
    status,
    logs: [...logs, "Success: Confirmed Geo.Region does not exist."],
  };
}