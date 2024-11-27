import { STRAPI_ENV } from "../strapi-env";
import {
  Product,
  NeedAssessment,
//   ProductUploadWorkflow,
//   UploadWorkflowStatus,
//   ProductUploadWorkflowResults,
} from "./types.d";

/*  Consolidate Products in each Category
 * ------------------------------------------------------- */
export function consolidateProductsByCategory(data: NeedAssessment[]): Record<string, Product[]> {
    const consolidatedProducts: Record<string, Product[]> = {};
    const categoryCounts: Record<string, number> = {};

    data.forEach(assessment => {
        const category = assessment.product.category;

        if (!consolidatedProducts[category]) {
            consolidatedProducts[category] = [];
            categoryCounts[category] = 0;
        }

        const productItem = assessment.product.item;

        // Only add the item if it's not empty or undefined
        if (productItem) {
            consolidatedProducts[category].push({
                category: category,
                item: productItem,
                ageGender: assessment.product.ageGender || '',
                sizeStyle: assessment.product.sizeStyle || '',
                unit: assessment.product.unit || ''
            });
            categoryCounts[category]++;
        }
    });

    // Print category counts after processing the data
    Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`${category} has ${count} products`);
    });

    return consolidatedProducts;
}