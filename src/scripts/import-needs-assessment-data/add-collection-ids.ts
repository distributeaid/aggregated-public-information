import { 
    Need,
    StrapiRegion,
    StrapiSubregion,
    StrapiSurvey,
    StrapiProduct 
} from "./types";

export async function addCollectionIdsToData(
    data: Need[],
    regions: StrapiRegion[],
    subregions: StrapiSubregion[],
    surveys: StrapiSurvey[],
    products: StrapiProduct[],
): Promise<Need[]> {

    function buildProductKey(product: {
        category: string;
        item: string;
        ageGender?: string;
        sizeStyle?: string;
    }) {
        const normalize = (v?: string | null) => (v ?? "").trim().toLowerCase();
        return [
        normalize(product.category),
        normalize(product.item),
        normalize(product.ageGender),
        normalize(product.sizeStyle),
        ].join(" | ");
    }
    
  const processedData: Need[] = [];

  // Create maps for the collections required 
  // ******************************************************************/

  // Region collection map ****/
  const regionIdMap = new Map(
    regions.map((region) => [region.name.toLowerCase(), region.id]),
  );
  // console.log(regionIdMap); // log map to test

  // Subregion collection map ****/
  const subregionIdMap = new Map(
    subregions.map((subregion) => [
      subregion.name.toLowerCase(),
      subregion.id,
    ]),
  );
  // console.log(subregionIdMap); // log map to test

  // Survey colleciton map  ****/
  const surveyIdMap = new Map(
    surveys.map((survey) => [
      `${survey.reference} | ${survey.yearQuarter}`,
      survey.id,
    ]),
  );
  // console.log(surveyIdMap); // log map to test

  // Product Item collection map ****/
  const productIdMap = new Map(
    products.map((product) => [
        buildProductKey({
            category: product.category.name.toLowerCase(),
            item: product.name.toLowerCase(),
            ageGender: product.age_gender,
            sizeStyle: product.size_style,
            // unit: "",
        }),
        product.id,
    ]),
  );
  // console.log(productIdMap); // log map to test

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
        },
        amount: assessment.amount,
        survey: {
          reference: assessment.survey.reference,
          year: assessment.survey.year,
          quarter: assessment.survey.quarter,
        },
        region: assessment.region ?? "other",
        subregion: assessment.subregion || "",
        regionId: Number(
          regionIdMap.get((assessment.region ?? "other").toLowerCase()) ||
            0,
        ),
        subregionId: assessment.subregion
          ? Number(
              subregionIdMap.get(assessment.subregion.toLowerCase()) || 0,
            )
          : undefined,
        surveyId: Number(
          surveyIdMap.get(
            `${assessment.survey.reference} | ${assessment.survey.year}-${assessment.survey.quarter}`,
          ) || 0,
        ),
        productId,
      };

      if (!processedNeed.regionId) {
        console.warn(
          `No region ID found for region: ${assessment.region}`,
        );
      }
      if (assessment.subregion && !processedNeed.subregionId) {
        console.warn(
          `No subregion ID found for subregion: ${assessment.subregion}`,
        );
      }
      if (assessment.survey.reference && !processedNeed.surveyId) {
        console.warn(
          `No survey ID found for survey: ${assessment.survey.reference} | ${assessment.survey.year}-${assessment.survey.quarter}`,
        );
      }
      if (assessment.product && !processedNeed.productId) {
        console.warn(`No product item ID found for: ${productKey}`);
      }

      processedData.push(processedNeed);
    } catch (error) {
      console.error(`Error processing assessment: ${error.message}`);
    }
  }

  return processedData;
}