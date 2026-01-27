import {
  getRegionIds,
  getSubregionIds,
  getSurveyIds,
  getProductItemIds,
} from "./get-ids";
import {
  StrapiRegion,
  StrapiSubregion,
  StrapiSurvey,
  StrapiProduct,
} from "./types";

let regionCache: StrapiRegion[] | null = null;
let subregionCache: StrapiSubregion[] | null = null;
let surveyCache: StrapiSurvey[] | null = null;
let productCache: StrapiProduct[] | null = null;

export async function getCachedRegions(
  getRegionIdsFn: typeof getRegionIds,
): Promise<StrapiRegion[]> {
  if (!regionCache) {
    console.log("Fetching regions from Strapi (cache missing)...");
    regionCache = await getRegionIdsFn();
    console.log(`Cached ${regionCache.length} regions`);
  }
  return regionCache;
}

export async function getCachedSubregions(
  getSubregionIdsFn: typeof getSubregionIds,
): Promise<StrapiSubregion[]> {
  if (!subregionCache) {
    console.log("Fetching subregions from Strapi (cache missing)...");
    subregionCache = await getSubregionIdsFn();
    console.log(`Cached ${subregionCache.length} subregions`);
  }
  return subregionCache;
}

export async function getCachedSurveys(
  getSurveyIdsFn: typeof getSurveyIds,
): Promise<StrapiSurvey[]> {
  if (!surveyCache) {
    console.log("Fetching surveys from Strapi (cache missing)...");
    surveyCache = await getSurveyIdsFn();
    console.log(`Cached ${surveyCache.length} surveys`);
  }
  return surveyCache;
}

export async function getCachedProducts(
  getProductItemIdsFn: typeof getProductItemIds,
): Promise<StrapiProduct[]> {
  if (!productCache) {
    console.log("Fetching product items from Strapi (cache missing)...");
    productCache = await getProductItemIdsFn();
    console.log(`Cached ${productCache.length} product items`);
  }
  return productCache;
}

// Clear all caches (call at the start to force refesh)
export function clearAllCaches() {
  regionCache = null;
  subregionCache = null;
  surveyCache = null;
  productCache = null;
  console.log("All caches cleared");
}

// Read data directly from caches
export function getCachedRegionsDirect(): StrapiRegion[] {
  return regionCache;
}

export function getCachedSubregionsDirect(): StrapiSubregion[] {
  return subregionCache;
}

export function getCachedSurveysDirect(): StrapiSurvey[] {
  return surveyCache;
}

export function getCachedProductsDirect(): StrapiProduct[] {
  return productCache;
}
