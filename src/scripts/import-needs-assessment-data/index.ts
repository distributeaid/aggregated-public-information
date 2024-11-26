import "dotenv/config";
import { join } from "path";
import { readFileSync } from "fs";

import { addRegions } from "./add-regions";
import { addSubregions } from "./add-subregions";
import { addCategories } from "./add-categories";

async function main() {
  try {
    //  Load the json data
    const jsonData = readFileSync(join(__dirname, "./needs-data.json"), "utf8");
    const data = JSON.parse(jsonData);

    //  Process the data and upload to Strapi collections
    const _regions = await addRegions(data);
    const _subregions = await addSubregions(data);
    const _categories = await addCategories(data);
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
