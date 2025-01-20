// import { STRAPI_ENV } from "../strapi-env";
import {
  Product,
  NeedAssessment,
  UploadWorkflowStatus,
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

      return Promise.resolve(initialWorkflow).then(parseProducts);
      // .then(getCategory)
      // .then(uploadCategory);
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
export function parseProducts({
  data,
  orig,
  status,
  logs,
}: ProductUploadWorkflow): ProductUploadWorkflow {
  logs = [...logs, `Log: parsing products...`];
  // console.log("👉🏻 This is the data coming into the parse function:", data);

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
            `Error: Invalid product input: "${product.item}-${product.ageGender}". Expected a non-null value for unit`,
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

  return {
    data: parsedData,
    orig,
    status,
    logs,
  };
}
