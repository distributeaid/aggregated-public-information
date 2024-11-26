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
export async function addCategories(
  data: NeedAssessment[],
): Promise<Category[]> {
  console.log("Adding Product.Categories from the Needs Assessment data ...");

  const uniqueCategories = consolidateCategories(data);

  const results = await Promise.allSettled<CategoryUploadWorkflow>(
    uniqueCategories.map((category) => {
      return new Promise<CategoryUploadWorkflow>((resolve, _reject) => {
        resolve({
          data: {
            category,
          },
          orig: category,
          status: UploadWorkflowStatus.PROCESSING,
          logs: [],
        });
      })
        .then(parseCategory)
        .then(getCategory)
        .then(uploadCategory);
    }),
  );

  // { "SUCCESS": [], "ALREADY_EXITS": [], ...}
  const resultsMap: CategoryUploadWorkflowResults = Object.keys(
    UploadWorkflowStatus,
  ).reduce((resultsMap, key) => {
    resultsMap[key] = [];
    return resultsMap;
  }, {} as CategoryUploadWorkflowResults);

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

  console.log("Add Product.Categories results:");
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

  const validCategories: Category[] = [
    ...resultsMap[UploadWorkflowStatus.SUCCESS],
    ...resultsMap[UploadWorkflowStatus.ALREADY_EXISTS],
  ].reduce((categories: Category[], workflow: CategoryUploadWorkflow) => {
    return [...categories, workflow.data];
  }, [] as Category[]);

  return validCategories;
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

/*  Consolidate Categories
 * ------------------------------------------------------- */
function consolidateCategories(data: NeedAssessment[]): string[] {
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
async function getCategory({
  data,
  orig,
  status,
  logs,
}: CategoryUploadWorkflow): Promise<CategoryUploadWorkflow> {
  logs = [
    ...logs,
    `Log: Checking if Product.Category "${orig}" already exists.`,
  ];

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
async function uploadCategory({
  data,
  orig,
  /* status, */ logs,
}: CategoryUploadWorkflow): Promise<CategoryUploadWorkflow> {
  logs = [...logs, `Log: Creating Product.Category "${orig}".`];

  const response = await fetch(`${STRAPI_ENV.URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
    body: JSON.stringify({
      data: {
        name: data.category,
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
        `Error: Failed to create Product.Category. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  return {
    data: body.data,
    orig,
    status: UploadWorkflowStatus.SUCCESS,
    logs: [...logs, "Success: Created Product.Category."],
  };
}
