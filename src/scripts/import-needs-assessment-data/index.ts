import "dotenv/config";
import { join } from "path";
import { readFileSync } from "fs";

// import { addRegions } from "./add-regions";
// import { addSubregions } from "./add-subregions";
// import { addCategories } from "./add-categories";
import { consolidateProductsByCategory, parseProducts } from "./add-items";

async function main() {
  try {
    //  Load the json data
    const jsonData = readFileSync(
      join(__dirname, "./needs-data(1).json"),
      "utf8",
    );
    const data = JSON.parse(jsonData);

    //  Process the data and upload to Strapi collections
    // const _regions = await addRegions(data);
    // const _subregions = await addSubregions(data);
    // const _categories = await addCategories(data);

    // Check the number of objects in the needs array to manually compare totals
    function countObjectsInArray(data: any): number {
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

    // Check individual functions are working
    const processedProducts = consolidateProductsByCategory(data);
    // console.log("Processed Products", processedProducts);

    try {
      const result = parseProducts(processedProducts);
      console.log("Result", result);
    } catch (error) {
      console.log("Error:", error.message);
    }
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
