// import qs from "qs";
// import { STRAPI_ENV } from "../strapi-env";
// import { UploadWorkflowStatus } from "../statusCodes";
import {
  Need,
  NeedAssessment,
//   NeedUploadWorkflow,
//   NeedUploadWorkflowResults,
} from "./types.d";

// Note: Uncomment the required imports during implementation in the code.

/* Consolidate the Needs and remove duplicates
* --------------------------------------------- */
export function consolidateNeedsByRegion(
    data: NeedAssessment[],
): Need[] {
    const consolidatedNeeds: Need[] = [];

    data.forEach((assessment) => {
        const need = assessment;

        if (need.product) {
            consolidatedNeeds.push({
                product: {
                    category: need.product.category,
                    item: need.product.item,
                    ageGender: need.product.ageGender || "",
                    sizeStyle: need.product.sizeStyle || "",
                    unit: need.product.unit || ""
                },
                amount: need.need,
                survey: {
                    reference: need.survey.id,
                    year: need.survey.year,
                    quarter: need.survey.quarter
                },
                region: need.place.region,
                subregion: need.place.subregion || "",
            });
        }
    });

    const uniqueNeeds: Need[] = [];
    const duplicateNeeds: Need[] =[];

    consolidatedNeeds.forEach((currentNeed) => {
        let isDuplicate = false;

        for (const existingNeed of uniqueNeeds) {
            if (areNeedsEqual(currentNeed, existingNeed)) {
                isDuplicate = true;
                break;
            }
        }

        if (isDuplicate) {
            duplicateNeeds.push(currentNeed)
        } else {
            uniqueNeeds.push(currentNeed);
        }
    });    

    // Print region counts for analysis after processing the data
    const regionCounts = {};
    uniqueNeeds.forEach((need) => {
        regionCounts[need.region] = 
            (regionCounts[need.region] || 0) +1;
    });

    // Logs for debugging issues with duplicates
    console.log(`Total unique needs: ${uniqueNeeds.length}`);
    console.log("Region counts:", regionCounts);

    console.log(`Total consolidated needs: ${consolidatedNeeds.length}`);
    console.log(`Number of duplicates: ${duplicateNeeds.length}`);

    console.log("\nDuplicate needs details:");
    duplicateNeeds.forEach((need, index) => {
    console.log(`\nDuplicate #${index + 1}:`);
    console.log(`Region: ${need.region}`);
    console.log(`Subregion: ${need.subregion}`);
    console.log(`Product: ${JSON.stringify(need.product, null, 2)}`);
    console.log(`Amount: ${need.amount}`);
    console.log(`Survey: ${JSON.stringify(need.survey)}`);
  });

    return uniqueNeeds;
}

function areNeedsEqual(need1: Need, need2: Need): boolean {
    if (!need1 || !need2) return false;

    const productsMatch = (
        need1.product.item === need2.product.item &&
        need1.product.category === need2.product.category &&
        need1.product.ageGender === need2.product.ageGender &&
        need1.product.sizeStyle === need2.product.sizeStyle &&
        need1.product.unit === need2.product.unit
    );

    if (!productsMatch) return false;

    if (need1.amount !== need2.amount) return false;
   
    const surveysMatch = (
        need1.survey.reference === need2.survey.reference &&
        need1.survey.year === need2.survey.year &&
        need1.survey.quarter === need2.survey.quarter
    );
    
    if (!surveysMatch) return false;
    
    if (need1.region !== need2.region) return false;

    if (need1.subregion !== need2.subregion) return false;
}