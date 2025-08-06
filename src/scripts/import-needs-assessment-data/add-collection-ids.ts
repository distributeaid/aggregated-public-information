import { 
    NeedAssessment,
    Need
} from './types';
// import { getRegionIds, getSubregionIds } from "./get-ids";

export async function addCollectionIdsToData(
  data: NeedAssessment[],
  regionResults,
  subregionResults,
  surveyResults
): Promise<Need[]> {
  const processedData: Need[] = [];
  
  // Create maps for the collections required
  const regionIdMap = new Map(
    regionResults.map(region => [region.name.toLowerCase(), region.id])
  );
  // console.log(regionIdMap); // log map to test
  const subregionIdMap = new Map(
    subregionResults.map(subregion => [subregion.name.toLowerCase(), subregion.id])
  );
  // console.log(subregionIdMap); // log map to test
  const surveyIdMap = new Map(
    surveyResults.map(survey => [
      `${survey.reference} | ${survey.yearQuarter}`,
      survey.id
    ])
  );
  // console.log(surveyIdMap); // log map to test
  
  for (const assessment of data) {
    try {
      const processedNeed: Need = {
        product: {
          category: assessment.product.category,
          item: assessment.product.item,
          ageGender: assessment.product.ageGender || "",
          sizeStyle: assessment.product.sizeStyle || "",
          unit: assessment.product.unit || "",
        },
        amount: assessment.need,
        survey: {
          reference: assessment.survey.id,
          year: assessment.survey.year,
          quarter: assessment.survey.quarter,
        },
        region: assessment.place.region ?? "other",
        subregion: assessment.place.subregion || "",
        regionId: Number(regionIdMap.get((assessment.place.region ?? "other").toLowerCase()) || 0),
        subregionId: assessment.place.subregion
          ? Number(subregionIdMap.get(assessment.place.subregion.toLowerCase()) || 0)
          : 0,
        surveyId: Number(surveyIdMap.get(
          `${assessment.survey.id} | ${assessment.survey.year}-${assessment.survey.quarter}`) || 0),
      };
      
      if (!processedNeed.regionId) {
        console.warn(`No region ID found for region: ${assessment.place.region}`);
      }
      if (assessment.place.subregion && !processedNeed.subregionId) {
        console.warn(`No subregion ID found for subregion: ${assessment.place.subregion}`);
      }
      if (assessment.survey.id && !processedNeed.surveyId) {
        console.warn(`No survey ID found for survey: ${assessment.survey.id} | ${assessment.survey.year}-${assessment.survey.quarter}`);
      }
      
      processedData.push(processedNeed);
    } catch (error) {
      console.error(`Error processing assessment: ${error.message}`);
    }
  }
  
  return processedData;
}