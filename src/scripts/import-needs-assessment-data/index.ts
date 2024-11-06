import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";

import { addRegions } from "./add-regions";
import { addSubregions } from "./add-subregions";

import { consolidateSurveys, getSurvey, uploadSurvey } from "./add-surveys";
import { UploadWorkflowStatus } from "./types.d";

async function main() {
  try {
    //  Load the json data
    const jsonData = readFileSync(join(__dirname, "./needs-data.json"), "utf8");
    const data = JSON.parse(jsonData);

    //  Process the data and upload to Strapi collections
    const _regions = await addRegions(data);
    const _subregions = await addSubregions(data);

    const processedSurveys = consolidateSurveys(data); // check this function is working
    console.log('Processed Surveys', processedSurveys);

    // check this function is working to get surveys from Strapi
    if (Array.isArray(data) && data.length > 0) {
      const surveyResult = await getSurvey({
        data: data[0].survey,
        // orig: data[0].survey.id || 'UnknownID',
        status: "pending",
        logs: ["Initial log"]
      });

      // Call uploadSurvey function
      const uploadResult = await uploadSurvey({
        data: data[0].survey,
        orig: `${data[0].survey.year}-${data[0].survey.quarter}`,
        status: 'PROCESSING',
        logs: [...surveyResult.logs, "log: Uploading NeedsAssessment.Survey."]
      });

      console.log("Upload Result:", uploadResult);
    } else {
      console.log('Invalid data structure');
    }
    
  } catch (error) {
    console.error("Error processing surveys", error);
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
