import { 
    NeedAssessment,
    Need
} from './types';
// import { getRegionIds, getSubregionIds } from "./get-ids";

export async function addCollectionIdsToData(
  data: NeedAssessment[],
  regionResults,
  subregionResults
): Promise<Need[]> {
  const processedData: Need[] = [];
  
  // Create maps for the collections required
  const regionIdMap = new Map(
    regionResults.map(region => [region.name.toLowerCase(), region.id])
  );
  const subregionIdMap = new Map(
    subregionResults.map(subregion => [subregion.name.toLowerCase(), subregion.id])
  );
  
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
        region: assessment.place.region,
        subregion: assessment.place.subregion || "",
        regionId: Number(regionIdMap.get(assessment.place.region.toLowerCase()) || 0),
        subregionId: assessment.place.subregion
          ? Number(subregionIdMap.get(assessment.place.subregion.toLowerCase()) || 0)
          : 0,
      };
      
      if (!processedNeed.regionId) {
        console.warn(`No region ID found for region: ${assessment.place.region}`);
      }
      if (assessment.place.subregion && !processedNeed.subregionId) {
        console.warn(`No subregion ID found for subregion: ${assessment.place.subregion}`);
      }
      
      processedData.push(processedNeed);
    } catch (error) {
      console.error(`Error processing assessment: ${error.message}`);
    }
  }
  
  return processedData;
}