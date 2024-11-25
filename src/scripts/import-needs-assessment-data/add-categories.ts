import { STRAPI_ENV } from "../strapi-env";
import {
  Category,
  NeedAssessment,
  CategoryUploadWorkflow,
  UploadWorkflowStatus,
  CategoryUploadWorkflowResults,
} from "./types.d";

/*  Add Categories from Needs Assessment Data
 * ------------------------------------------------------- */

/*  Consolidate Categories
 * ------------------------------------------------------- */
export function consolidateCategories(data: NeedAssessment[]): string[] {
  const categories = data.reduce((acc: string[], item) => {
    const category = item.product.category;
    if (category && !acc.includes(category)) {
      acc.push(category);
    }
    return acc;
  }, []);

  return categories;
}

/*  Parse Category
 * ------------------------------------------------------- */
function parseCategory({
  data,
  orig,
  status,
  logs,
}: CategoryUploadWorkflow): CategoryUploadWorkflow {
  logs = [...logs, `Log: parsing category "${orig}"`];

  if (orig == null || typeof orig !== "string") {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.ORIGINAL_DATA_INVALID,
      logs: [
        ...logs,
        `Error: Invalid category input: "${orig}". Expected a non-null value.`,
      ],
    };
  }

  const newData = {
    ...data,
    category: orig,
  };

  return {
    data: newData,
    orig,
    status,
    logs,
  };
}

/*  Get Category
 * ------------------------------------------------------- */

/*  Upload Category
 * ------------------------------------------------------- */