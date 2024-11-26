import "dotenv/config";
import { join } from "path";
import { readFileSync } from "fs";

import { addRegions } from "./add-regions";
import { addSubregions } from "./add-subregions";
import { addSurveys } from "./add-surveys";
import { consolidateCategories, getCategory, uploadCategory } from "./add-categories";
import { UploadWorkflowStatus } from "../statusCodes";

async function main() {
  try {
    //  Load the json data
    const jsonData = readFileSync(join(__dirname, "./needs-data.json"), "utf8");
    const data = JSON.parse(jsonData);

    //  Process the data and upload to Strapi collections
    const _regions = await addRegions(data);
    const _subregions = await addSubregions(data);
    const _surveys = await addSurveys(data);

    // Check individual functions are working
    const processedCategories = consolidateCategories(data);
    console.log('Processed Categories', processedCategories);

    for (const categoryName of processedCategories) {
      try {
        const categoryResult = await getCategory({
          data: {category: categoryName},
          orig: categoryName,
          status: 'PROCESSING',
          logs: ["Initial log"]
        });
        console.log(`Result for category ${categoryName}:`, categoryResult);

        if (categoryResult.status !== UploadWorkflowStatus.ALREADY_EXISTS) {
          try {
            const uploadedCategory = await uploadCategory(categoryResult);
            console.log(`Uploaded category ${categoryResult.orig}:`, uploadedCategory);
          } catch (error) {
            console.log(`Error uploading category ${categoryResult.orig}`, error);
          }
        }
      } catch (error) {
        console.log(`Error processing category ${categoryName}`, error);
      }
    }

  } catch (error) {
    console.error("Error processing categories", error);
    if (error.code === "ENOENT") {
      console.error(`File not found: ${error.path}`);
    } else if (error instanceof TypeError) {
      console.error("Type error details:", error.message);
    } else if (error instanceof SyntaxError) {
      console.error("JSON parsing error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

main();
