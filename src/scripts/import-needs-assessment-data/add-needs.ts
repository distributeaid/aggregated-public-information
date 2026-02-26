// import qs from "qs";
// import { STRAPI_ENV } from "../strapi-env";
import { UploadWorkflowStatus } from "../_utils/statusCodes";
import { isFulfilled, _isRejected } from "../_utils/promiseUtils";
import {
  Need,
  NeedAssessment,
  NeedUploadWorkflow,
  NeedUploadWorkflowResults,
} from "./types.d";
import { addCollectionIdsToData } from "./add-collection-ids";
import {
  getProductItemIds,
  getRegionIds,
  getSubregionIds,
  getSurveyIds,
} from "./get-ids";
import {
  getCachedRegions,
  getCachedSubregions,
  getCachedSurveys,
  getCachedProducts,
  getCachedRegionsDirect,
  getCachedSubregionsDirect,
  getCachedSurveysDirect,
  getCachedProductsDirect,
} from "./cache";

// Note: Uncomment the required imports during implementation in the code.

/*  Add Needs from Needs Assessment Data
 * ------------------------------------------------------- */
export async function addNeeds(data: NeedAssessment[]): Promise<Need[]> {
  console.log("Adding Needs from the Needs Assessment data ....");

  const uniqueNeedEntries = consolidateNeedsByRegion(data);

  // Fetch collection Ids
  const getRegionIdsFn = getRegionIds;
  const getSubregionIdsFn = getSubregionIds;
  const getSurveyIdsFn = getSurveyIds;
  const getProductItemIdsFn = getProductItemIds;

  // Populate caches
  await Promise.all([
    getCachedRegions(getRegionIdsFn),
    getCachedSubregions(getSubregionIdsFn),
    getCachedSurveys(getSurveyIdsFn),
    getCachedProducts(getProductItemIdsFn),
  ]);

  const results = await Promise.allSettled<NeedUploadWorkflow>(
    uniqueNeedEntries.map((need) => {
      const initialWorkflow = {
        data: [need],
        orig: JSON.stringify(need, null, 2),
        status: UploadWorkflowStatus.PROCESSING,
        logs: [],
      };

      return Promise.resolve(initialWorkflow)
        .then(parseNeeds)
        .then(addIdsToWorkflow);
    }),
  );

  // { "SUCCESS": [], "ALREADY_EXITS": [], ...}
  const resultsMap: NeedUploadWorkflowResults = Object.fromEntries(
    Object.keys(UploadWorkflowStatus).map((key) => [key, []]),
  ) as NeedUploadWorkflowResults;

  results.forEach((result) => {
    const workflowResult = isFulfilled(result) ? result.value : result.reason;
    const statusKey = workflowResult.status || UploadWorkflowStatus.OTHER;
    resultsMap[statusKey].push(workflowResult);
  });

  console.log("Add NeedsAssessment.Need results:");
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

  console.log("Adding needs completed!");

  const validNeeds: Need[] = [
    ...resultsMap[UploadWorkflowStatus.SUCCESS],
    ...resultsMap[UploadWorkflowStatus.ALREADY_EXISTS],
  ].reduce((needs: Need[], workflow: NeedUploadWorkflow) => {
    return [...needs, workflow.data];
  }, [] as Need[]);

  return validNeeds;
}

/* Consolidate the Needs and remove duplicates
 * --------------------------------------------- */
function consolidateNeedsByRegion(data: NeedAssessment[]): Need[] {
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
          unit: need.product.unit || "",
        },
        amount: need.need,
        survey: {
          reference: need.survey.id,
          year: need.survey.year,
          quarter: need.survey.quarter,
        },
        region: need.place.region,
        subregion: need.place.subregion || "",
      });
    }
  });

  const uniqueNeeds: Need[] = [];
  const duplicateNeeds: Need[] = [];

  consolidatedNeeds.forEach((currentNeed) => {
    const existingNeedIndex = uniqueNeeds.findIndex((need) =>
      areNeedsEqual(need, currentNeed),
    );

    if (existingNeedIndex !== -1) {
      duplicateNeeds.push(currentNeed);
    } else {
      uniqueNeeds.push(currentNeed);
    }
  });

  // Gather region counts for analysis after processing the data
  const regionCounts = {};
  uniqueNeeds.forEach((need) => {
    regionCounts[need.region] = (regionCounts[need.region] || 0) + 1;
  });

  // Logs for investigating the data processed
  console.log(`Total unique needs: ${uniqueNeeds.length}`);
  console.log("Region counts:", regionCounts);

  console.log(`Number of duplicates: ${duplicateNeeds.length}`);

  // NOTE: uncomment to view duplicates for data analysis
  // if (duplicateNeeds.length > 0) {
  //     console.log("\nDuplicate needs details:");
  //     duplicateNeeds.forEach((need, index) => {
  //     console.log(`\nDuplicate #${index + 1}:`);
  //     console.log(`Region: ${need.region}`);
  //     console.log(`Subregion: ${need.subregion}`);
  //     console.log(`Product: ${JSON.stringify(need.product, null, 2)}`);
  //     console.log(`Amount: ${need.amount}`);
  //     console.log(`Survey: ${JSON.stringify(need.survey)}`);
  // });
  // }

  return uniqueNeeds;
}

function areNeedsEqual(need1: Need, need2: Need): boolean {
  if (!need1 || !need2) return false;

  const productsMatch =
    need1.product.item === need2.product.item &&
    need1.product.category === need2.product.category &&
    need1.product.ageGender === need2.product.ageGender &&
    need1.product.sizeStyle === need2.product.sizeStyle &&
    need1.product.unit === need2.product.unit;

  if (!productsMatch) return false;

  if (need1.amount !== need2.amount) return false;

  const surveysMatch =
    need1.survey.reference === need2.survey.reference &&
    need1.survey.year === need2.survey.year &&
    need1.survey.quarter === need2.survey.quarter;

  if (!surveysMatch) return false;

  if (need1.region !== need2.region) return false;

  if (need1.subregion !== need2.subregion) return false;

  return true;
}

/*  Parse Needs
 * --------------------------------------------------- */
async function parseNeeds({
  data,
  orig,
  status,
  logs,
}: NeedUploadWorkflow): Promise<NeedUploadWorkflow> {
  logs = [...logs, `Log: parsing needs...`];

  const needs = (() => {
    if (typeof data === "object" && data !== null) {
      if (Array.isArray(data)) {
        return data;
      } else if (Object.hasOwn(data, "need")) {
        return [(data as Record<string, unknown>).need as Need];
      }
    }
    console.log("Unexpected object structure:", JSON.stringify(data));
    return [];
  })();

  return new Promise<NeedUploadWorkflow>((resolve, _reject) => {
    const parsedData: Need[] = [];

    needs.forEach((need) => {
      logs.push(
        `Parsing need: ${need.region} | ${need.product} | ${need.amount}`,
      );

      if (!need.survey || !need.product) {
        throw {
          data,
          orig,
          status: UploadWorkflowStatus.ORIGINAL_DATA_INVALID,
          logs: [
            ...logs,
            `Error: Invalid need input: "${need.region}-${need.product}". Expected a non-null value in survey and product.`,
          ],
        };
      }

      const processedNeed: Need = {
        ...need,
      };
      parsedData.push(processedNeed);
    });

    resolve({
      data: parsedData,
      orig,
      status,
      logs,
    });
  });
}

/*  Add collection IDs for relation fields of the Needs
 * --------------------------------------------------- */
async function addIdsToWorkflow(
  workflow: NeedUploadWorkflow,
): Promise<NeedUploadWorkflow> {
  const { data, orig: origin, logs } = workflow;
  logs.push(`Log: adding relation ids to the needs ...`);

  const [regionIds, subregionIds, surveyIds, productIds] = [
    getCachedRegionsDirect(),
    getCachedSubregionsDirect(),
    getCachedSurveysDirect(),
    getCachedProductsDirect(),
  ];

  try {
    const enrichedData = await addCollectionIdsToData(
      data,
      regionIds,
      subregionIds,
      surveyIds,
      productIds,
    );

    return {
      data: enrichedData,
      orig: origin,
      status: UploadWorkflowStatus.PROCESSING,
      logs: [...logs, `Added IDs to ${enrichedData.length} need`],
    };
  } catch (error) {
    return {
      data,
      orig: origin,
      status: UploadWorkflowStatus.OTHER,
      logs: [
        ...logs,
        `Adding ids to the need failed: ${(error as Error).message}`,
      ],
    };
  }
}
