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
