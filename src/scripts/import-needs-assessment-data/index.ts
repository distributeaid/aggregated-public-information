import "dotenv/config";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";

import { addRegions } from "./add-regions";
import { addSubregions } from "./add-subregions";
import { addSurveys } from "./add-surveys";
import { addCategories } from "./add-categories";
import { addProducts } from "./add-items";
import { addNeeds } from "./add-needs";
import { 
  getCategoryIds, 
  // getProductItemIds, 
  // getRegionIds, 
  // getSubregionIds, 
  // getSurveyIds,
 } from "./get-ids";
import { clearAllCaches } from "./cache";
// import { addCollectionIdsToData } from "./add-collection-ids";

async function main() {
  try {
    //  Load the json data
    const scriptDir = dirname(__filename);
    const filePath = resolve(scriptDir, "./needs-data(subset).json");
    const jsonData = readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);

    //  Process the data and upload to Strapi collections
    const _regions = await addRegions(data);
    const _subregions = await addSubregions(data);
    const _surveys = await addSurveys(data);
    const _categories = await addCategories(data);
    const _products = await addProducts(data, getCategoryIds);

    // Check the number of objects in the needs array to manually compare totals
    function countObjectsInArray(data): number {
      if (Array.isArray(data.needs)) {
        return data.needs.length;
      } else if (typeof data === "object" && data !== null) {
        return Object.keys(data).length;
      } else {
        throw new Error("Invalid input: expected an array or object");
      }
    }
    const totalCountInNeeds = countObjectsInArray(data);
    console.log(`Total objects in needs array: ${totalCountInNeeds}`);

    // const _regionResults = await getRegionIds();
    // console.log("Regions data", regionResults.length);// Log region results for test
    // const _subregionResults = await getSubregionIds();
    // const _surveyResults = await getSurveyIds();
    // const _categoryResults = await getCategoryIds();
    // const _productItemResults = await getProductItemIds();

    // const processedData = await addCollectionIdsToData(
    //   data,
    //   getRegionIds,
    //   getSubregionIds,
    //   getSurveyIds,
    //   getProductItemIds
    // );
    // console.log("Processed needs:", processedData.length)

    clearAllCaches();
    const _needs = await addNeeds(data);
  } catch (error) {
    console.error("Error processing needs assessment data", error);
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
