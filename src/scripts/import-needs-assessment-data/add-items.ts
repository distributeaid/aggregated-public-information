import qs from "qs";
import { STRAPI_ENV } from "../strapi-env";
import { UploadWorkflowStatus } from "../statusCodes";
import {
  Product,
  NeedAssessment,
  ProductUploadWorkflow,
  ProductUploadWorkflowResults,
} from "./types.d";

/*  Add Products from Needs Assessment Data
 * ------------------------------------------------------- */
export async function addProducts(data: NeedAssessment[]): Promise<Product[]> {
  console.log("Adding Product.Items from the Needs Assessment data ...");

  const uniqueProductItems = consolidateProductsByCategory(data);

  const results = await Promise.allSettled<ProductUploadWorkflow>(
    uniqueProductItems.map((product) => {
      const initialWorkflow = {
        data: [product],
        orig: JSON.stringify(product, null, 2),
        status: UploadWorkflowStatus.PROCESSING,
        logs: [],
      };

      return Promise.resolve(initialWorkflow)
        .then(parseProducts)
        .then(getCategoryIds)
        .then(getProduct)
        .then(uploadProduct);
    }),
  );

  // { "SUCCESS": [], "ALREADY_EXITS": [], ...}
  const resultsMap: ProductUploadWorkflowResults = Object.fromEntries(
    Object.keys(UploadWorkflowStatus).map((key) => [key, []]),
  ) as ProductUploadWorkflowResults;

  results.forEach((result) => {
    const workflowResult = isFulfilled(result) ? result.value : result.reason;
    const statusKey = workflowResult.status || UploadWorkflowStatus.OTHER;
    resultsMap[statusKey].push(workflowResult);
  });

  console.log("Add Product.Items results:");
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

  const validProducts: Product[] = [
    ...resultsMap[UploadWorkflowStatus.SUCCESS],
    ...resultsMap[UploadWorkflowStatus.ALREADY_EXISTS],
  ].reduce((products: Product[], workflow: ProductUploadWorkflow) => {
    return [...products, workflow.data];
  }, [] as Product[]);

  return validProducts;
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

/*  Consolidate Products in each Category and remove duplicates
 * ------------------------------------------------------- */
export function consolidateProductsByCategory(
  data: NeedAssessment[],
): Product[] {
  const consolidatedProducts: Product[] = [];

  data.forEach((assessment) => {
    const product = assessment.product;

    if (product.item) {
      consolidatedProducts.push({
        category: product.category,
        item: product.item,
        ageGender: product.ageGender || "",
        sizeStyle: product.sizeStyle || "",
        unit: product.unit || "",
      });
    }
  });

  // Remove duplicates before further processing
  const uniqueProducts = consolidatedProducts.filter(
    (product, index, self) =>
      index ===
      self.findIndex(
        (p) =>
          p.item === product.item &&
          p.category === product.category &&
          p.ageGender === product.ageGender &&
          p.sizeStyle === product.sizeStyle,
      ),
  );

  // Print category counts after processing the data
  const categoryCounts = {};
  uniqueProducts.forEach((product) => {
    categoryCounts[product.category] =
      (categoryCounts[product.category] || 0) + 1;
  });

  console.log(`Total unique products: ${uniqueProducts.length}`);
  // console.log("Category counts:", categoryCounts);

  return uniqueProducts;
}

/*  Parse Products
 * ------------------------------------------------------- */
async function parseProducts({
  data,
  orig,
  status,
  logs,
}: ProductUploadWorkflow): Promise<ProductUploadWorkflow> {
  logs = [...logs, `Log: parsing products...`];

  const products = (() => {
    if (typeof data === "object" && data !== null) {
      if (Array.isArray(data)) {
        return data;
      } else if (Object.hasOwn(data, "product")) {
        return [(data as Record<string, unknown>).product as Product];
      }
    }
    console.log("Unexpected object structure:", JSON.stringify(data));
    return [];
  })();

  return new Promise<ProductUploadWorkflow>((resolve, _reject) => {
    const parsedData: Product[] = [];

    products.forEach((product) => {
      logs.push(`Parsing product: ${product.item}`);

      if (!product.category || !product.item || !product.unit) {
        throw {
          data,
          orig,
          status: UploadWorkflowStatus.ORIGINAL_DATA_INVALID,
          logs: [
            ...logs,
            `Error: Invalid product input: "${product.item}-${product.ageGender}". Expected a non-null value in category, item, and unit.`,
          ],
        };
      }

      const processedProduct: Product = {
        ...product,
      };
      parsedData.push(processedProduct);
    });

    resolve({
      data: parsedData,
      orig,
      status,
      logs,
    });
  });
}

/* Get Category Ids */
async function getCategoryIds({
  data,
  orig,
  status,
  logs,
}: ProductUploadWorkflow): Promise<ProductUploadWorkflow> {
  logs = [
    ...logs,
    `Log: Getting the category Id for "${data[0].item} // ${data[0].category} // ${data[0].ageGender} // ${data[0].sizeStyle}".`,
  ];

  const response = await fetch(`${STRAPI_ENV.URL}/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const categoryResults = await response.json();
  const matchingCategory = categoryResults.data.find((category) => {
    const parsedItem = data[0];
    return category.name.toLowerCase() === parsedItem.category.toLowerCase();
  });

  if (!response.ok) {
    console.log("Non-ok response");
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.PROCESSING,
      logs: [
        ...logs,
        `Error: Failed to get Product.Item category Id. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(categoryResults),
      ],
    };
  }

  if (matchingCategory) {
    const updateProduct = {
      ...data[0],
      categoryId: matchingCategory.id,
    };
    data[0] = updateProduct;
  }

  return {
    data,
    orig,
    status,
    logs: [
      ...logs,
      "Success: Confirmed Product.Item has a matching category Id.",
    ],
  };
}

/*  Get Product
 * ------------------------------------------------------- */
async function getProduct({
  data,
  orig,
  status,
  logs,
}: ProductUploadWorkflow): Promise<ProductUploadWorkflow> {
  logs = [
    ...logs,
    `Log: Checking if "${data[0].item} // ${data[0].category} // ${data[0].ageGender} // ${data[0].sizeStyle}" already exists.`,
  ];

  // Queries to fetch the data from Strapi
  const query = qs.stringify({
    filters: {
      $or: data.map((item) => ({
        name: { $eq: item.item },
        category: { name: { $eq: item.category } },
        age_gender: { $eq: item.ageGender },
        size_style: { $eq: item.sizeStyle },
      })),
    },
  });

  const response = await fetch(
    `${STRAPI_ENV.URL}/items?populate=category&${query}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_ENV.KEY}`,
      },
    },
  );

  const body = await response.json();

  logs = [
    ...logs,
    `Log: Found ${body.data.length} matching items from ${data.length} queries.`,
  ];

  // log strapi response status
  // console.log("Strapi response status:", response.status);
  // console.log(body);

  if (!response.ok) {
    console.log("Non-ok response");
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      logs: [
        ...logs,
        `Error: Failed to get Product.Item. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  if (body.data.length > 0) {
    throw {
      data: body.data[0],
      orig,
      status: UploadWorkflowStatus.ALREADY_EXISTS,
      logs: [...logs, "Log: Found existing item. Skipping ...."],
    };
  }

  return {
    data,
    orig,
    status,
    logs: [...logs, "Success: Confirmed Product.Item does not already exist. Proceed to upload product."],
  };
}

/*  Upload Product
 * ------------------------------------------------------- */
async function uploadProduct({
  data,
  orig,
  /*status, */
  logs,
}: ProductUploadWorkflow): Promise<ProductUploadWorkflow> {
  logs = [
    ...logs,
    `Log: Creating item "${data[0].item} // ${data[0].category} // ${data[0].ageGender} // ${data[0].sizeStyle}".`,
  ];

  const response = await fetch(`${STRAPI_ENV.URL}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
    body: JSON.stringify({
      data: {
        name: data[0].item,
        category: {
          id: data[0].categoryId,
        },
        age_gender: data[0].ageGender,
        size_style: data[0].sizeStyle,
        unit: data[0].unit,
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
        `Error: Failed to create Product.Item. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  return {
    data: body.data,
    orig,
    status: UploadWorkflowStatus.SUCCESS,
    logs: [...logs, "Success: Created Product.Item."],
  };
}
