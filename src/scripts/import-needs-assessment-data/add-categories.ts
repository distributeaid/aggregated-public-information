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

/*  Consolidate Categories
 * ------------------------------------------------------- */

/*  Parse Category
 * ------------------------------------------------------- */

/*  Get Category
 * ------------------------------------------------------- */

/*  Upload Category
 * ------------------------------------------------------- */