// import { STRAPI_ENV } from "../strapi-env";
import {
  Product,
  NeedAssessment,
  UploadWorkflowStatus,
  ProductUploadWorkflow,
  // ProductUploadWorkflowResults,
} from "./types.d";

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
export function parseProducts(data: Product[], orig, _status): ProductUploadWorkflow {
  const logs = [];
  logs.push(`Parsing products ...`);

  const parsedData: Product[] = [];
  const problematicItems: Product[] = [];

  if (Array.isArray(data)) {
    data.forEach((item: Product) => {
      logs.push(`Parsing product: ${item.item}`);

    if (!item.category || !item.item || !item.unit) {
      problematicItems.push(item);
    } else {
      const processedProduct: Product = {
        ...item,
      };
      parsedData.push(processedProduct);
    }

  });
  } else {
    console.log("Data property is not an array");
  }

  const hasProblematicItems = problematicItems.length > 0;
  const updatedStatus = hasProblematicItems
  ? UploadWorkflowStatus.PROCESSING
  : UploadWorkflowStatus.SUCCESS

  logs.push(
    `Workflow completed. Status: ${problematicItems.length} product items were problematic: ${JSON.stringify(problematicItems, null, 2).replace(/\\n|"/g, "")}`,
  );
  // console.log(problematicItems)

  return {
    data: parsedData,
    orig,
    status: updatedStatus,
    logs,
  };
}
