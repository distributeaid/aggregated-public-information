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
export async function getCategory({
  data,
  orig,
  status,
  logs,
}: CategoryUploadWorkflow): Promise<CategoryUploadWorkflow> {
  logs = [...logs, `Log: Checking if Product.Category "${orig}" already exists.`];

  //Fetch the data from Strapi
  const response = await fetch(`${STRAPI_ENV.URL}/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const body = await response.json();
  const matchingCategory = body.data.find(
    (category) => category.name.toLowerCase() === data.category.toLowerCase(),
  );

  if (!response.ok) {
    console.log("Non-ok response");
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      logs: [
        ...logs,
        `Error: Failed to get Product.Category. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  if (matchingCategory) {
    throw {
      data: body.data,
      orig,
      status: UploadWorkflowStatus.ALREADY_EXISTS,
      logs: [...logs, "Log: Found existing Product.Category. Skipping..."],
    };
  }

  return {
    data,
    orig,
    status,
    logs: [...logs, "Success: Confirmed Product.Category does not exist."],
  };
}

/*  Upload Category
 * ------------------------------------------------------- */