import { 
    NeedAssessment, 
    Need,
    StrapiRegion,
    StrapiSubregion,
    StrapiSurvey,
    StrapiProduct 
} from "./types";

export async function addCollectionIdsToData(
    data: NeedAssessment[],
    getRegionIdsFn: () =>
      Promise<StrapiRegion[]>,
    getSubregionIdsFn: () =>
      Promise<StrapiSubregion[]>,
    getSurveyIdsFn: () =>
      Promise<StrapiSurvey[]>,
    getProductItemIdsFn: () =>
      Promise<StrapiProduct[]>,
): Promise<Need[]> {

    function buildProductKey(product: {
        category: string;
        item: string;
        ageGender?: string;
        sizeStyle?: string;
        unit?: string;
    }) {
        const normalize = (v?: string | null) => (v ?? "").trim().toLowerCase();
        return [
        normalize(product.category),
        normalize(product.item),
        normalize(product.ageGender),
        normalize(product.sizeStyle),
        normalize(product.unit),
        ].join(" | ");
    }
    
  const processedData: Need[] = [];

  // Fetch collection ids from Strapi
  const regionResults = await getRegionIdsFn();
  const subregionResults = await getSubregionIdsFn();
  const surveyResults = await getSurveyIdsFn();
  const productItemResults = await getProductItemIdsFn();

  // Create maps for the collections required 
  // ******************************************************************/

  // Region collection map ****/
  const regionIdMap = new Map(
    regionResults.map((region) => [region.name.toLowerCase(), region.id]),
  );
  // console.log(regionIdMap); // log map to test

  // Subregion collection map ****/
  const subregionIdMap = new Map(
    subregionResults.map((subregion) => [
      subregion.name.toLowerCase(),
      subregion.id,
    ]),
  );
  // console.log(subregionIdMap); // log map to test

  // Survey colleciton map  ****/
  const surveyIdMap = new Map(
    surveyResults.map((survey) => [
      `${survey.reference} | ${survey.yearQuarter}`,
      survey.id,
    ]),
  );
  // console.log(surveyIdMap); // log map to test

  // Product Item collection map ****/
  const productIdMap = new Map(
    productItemResults.map((product) => [
        buildProductKey({
            category: product.category.name.toLowerCase(),
            item: product.name.toLowerCase(),
            ageGender: product.ageGender,
            sizeStyle: product.sizeStyle,
            unit: "",
        }),
        product.id,
    ]),
  );

  for (const assessment of data) {
    try {

      const productKey = buildProductKey(assessment.product);
      const productId = Number (productIdMap.get(productKey) || 0);

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
        regionId: Number(
          regionIdMap.get((assessment.place.region ?? "other").toLowerCase()) ||
            0,
        ),
        subregionId: assessment.place.subregion
          ? Number(
              subregionIdMap.get(assessment.place.subregion.toLowerCase()) || 0,
            )
          : undefined,
        surveyId: Number(
          surveyIdMap.get(
            `${assessment.survey.id} | ${assessment.survey.year}-${assessment.survey.quarter}`,
          ) || 0,
        ),
        productId,
      };

      if (!processedNeed.regionId) {
        console.warn(
          `No region ID found for region: ${assessment.place.region}`,
        );
      }
      if (assessment.place.subregion && !processedNeed.subregionId) {
        console.warn(
          `No subregion ID found for subregion: ${assessment.place.subregion}`,
        );
      }
      if (assessment.survey.id && !processedNeed.surveyId) {
        console.warn(
          `No survey ID found for survey: ${assessment.survey.id} | ${assessment.survey.year}-${assessment.survey.quarter}`,
        );
      }
      if (!productId) {
        console.warn(`No product item ID found for: ${productKey}`);
      }

      processedData.push(processedNeed);
    } catch (error) {
      console.error(`Error processing assessment: ${error.message}`);
    }
  }

  return processedData;
}