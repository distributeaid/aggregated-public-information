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

  const uniqueProducts = consolidateProductsByCategory(data);

  const results = await Promise.allSettled<ProductUploadWorkflow>(
    uniqueProducts.map((product) => {
      const initialWorkflow = {
        data: {
          product,
        },
        orig: product,
        status: UploadWorkflowStatus.PROCESSING,
        logs: [],
      };

      return Promise.resolve(initialWorkflow)
        .then(parseProducts)
        .then(getProduct);
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
    if (key !== UploadWorkflowStatus.SUCCESS && key !== UploadWorkflowStatus.ALREADY_EXISTS) {
      resultsMap[key].forEach((result) => {
        console.log(result)
        console.log("\n")
      })
    }
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

/*  Consolidate Products in each Category
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

  // Print category counts after processing the data
  const categoryCounts = {};
  consolidatedProducts.forEach((product) => {
    categoryCounts[product.category] =
      (categoryCounts[product.category] || 0) + 1;
  });

  console.log("Category counts:", categoryCounts);

  return consolidatedProducts;
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
  // console.log("👉🏻 This is the data coming into the parse function:", data);
  return new Promise<ProductUploadWorkflow>((resolve, _reject) => {
  
    const parsedData: Product[] = [];

    if (typeof data === "object" && data !== null) {
      // Check if data contains a 'product' property
      if ("product" in data) {
        const product = data.product as Product;

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
        } else {
          const processedProduct: Product = {
            ...product,
          };
          parsedData.push(processedProduct);
        }
      } else {
        console.log("unexpected object structure:", JSON.stringify(data));
      }
    }

    resolve({
      data: parsedData,
      orig,
      status,
      logs,
    });
  })

}
/*  Get Product
 * ------------------------------------------------------- */
async function getProduct({
  data,
  orig,
  status,
  logs,
}: ProductUploadWorkflow): Promise<ProductUploadWorkflow> {
  logs = [...logs, `Log: Checking if Product.Item already exists.`];

  //Fetch the data from Strapi
  const response = await fetch(`${STRAPI_ENV.URL}/items?populate=category`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const body = await response.json();

  // log strapi response status
  // console.log("Strapi response status:", response.status);
  // console.log(body);

  const matchingProduct = body.data.find((item) => {
    const parsedItem = data[0];
    return (
      item.name.toLowerCase() === parsedItem.item.toLowerCase() &&
      item.category.name.toLowerCase() === parsedItem.category.toLowerCase() &&
      ((item.age_gender === null) ||
        item.age_gender.toLowerCase() === parsedItem.ageGender.toLowerCase()) &&
      ((item.size_style === null) ||
        item.size_style.toLowerCase() === parsedItem.sizeStyle.toLowerCase())
    );
  });

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

  if (matchingProduct) {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.ALREADY_EXISTS,
      logs: [...logs, "Log: Found existing Product.Item. Skipping..."],
    };
  }

  return {
    data,
    orig,
    status,
    logs: [...logs, "Success: Confirmed Product.Item does not exist."],
  };
}
