import { STRAPI_ENV } from "../strapi-env";
import {
    StrapiRegion,
    StrapiSubregion,
    StrapiSurvey,
    StrapiCategory,
    StrapiProduct
} from "./types";

/* Get ids for each region from Strapi 
****************************************/
async function getRegionIds(): Promise<StrapiRegion[]> {
    const existingRegions = await fetch(`${STRAPI_ENV.URL}/regions`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRAPI_ENV.KEY}`,
        },
    });

    const regionsResponse = await existingRegions.json();
    console.log("Initial regions count:", regionsResponse.data?.length);

    // Check if "Other" region exists
    if (!regionsResponse.data?.some((region) => region.name === "Other")) {
        console.log('"Other" region missing, creating it now');

        // Add "Other" region if it's missing
        await fetch(`${STRAPI_ENV.URL}/regions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${STRAPI_ENV.KEY}`,
            },
            body:JSON.stringify({
                data:{
                    name: "Other",
                },
            }),
        });

        // Re-fetch to ensure the new "Other" region is included
        return await fetch(`${STRAPI_ENV.URL}/regions`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${STRAPI_ENV.KEY}`,
            },
        })
        .then((r) => r.json())
        .then((r) => {
        console.log("Regions count after adding 'Other':", r.data?.length);
        return r.data;
      });
    }
    
    console.log("Regions data", regionsResponse.data.length);// Log region results for test

    return regionsResponse.data;
}

export { getRegionIds };

/*  Get the ids for each subregion from Strapi
 * ------------------------------------------------------- */
async function getSubregionIds(): Promise<StrapiSubregion[]> {
  const existingSubregions = await fetch(`${STRAPI_ENV.URL}/subregions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const subregionResponse = await existingSubregions.json();

  console.log("Subregions data", subregionResponse.data.length);// Log subregion results for test
  return subregionResponse.data;
}

export { getSubregionIds };

/*  Get the ids for each survey from Strapi
 * ------------------------------------------------------- */
async function getSurveyIds(): Promise<StrapiSurvey[]> {
  const existingSurveys = await fetch(`${STRAPI_ENV.URL}/surveys`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const surveyResponse = await existingSurveys.json();

  console.log("Surveys data", surveyResponse.data.length);// Log survey results for test
  return surveyResponse.data;
}

export { getSurveyIds };

/*  Get the ids for each category from Strapi
 * ------------------------------------------------------- */
async function getCategoryIds(): Promise<StrapiCategory[]> {
  const existingCategories = await fetch(`${STRAPI_ENV.URL}/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const categoryResponse = await existingCategories.json();

  // console.log("Categories data", categoryResponse.data.length);// Log category results for test
  return categoryResponse.data;
}

export { getCategoryIds };

/*  Get the ids for each product item from Strapi
 * ------------------------------------------------------- */
async function getProductItemIds(): Promise<StrapiProduct[]> {
  const allItems = [];
  let currentPage = 1;
  let totalPages = 0;

  // console.log('➡️ Inital array length:', allItems.length)

  do {
    try {
      const existingItemResponse = await fetch(
        `${STRAPI_ENV.URL}/items?populate=*&pagination[page]=${currentPage}&pagination[pageSize]=25`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRAPI_ENV.KEY}`,
          },
        },
      );

      if (!existingItemResponse.ok) {
        throw new Error(`HTTP error! status: ${existingItemResponse.status}`);
      }

      const existingItems = await existingItemResponse.json();

      // Debugging the items coming in via the page
      // console.log(`➡️ Page ${currentPage}`);
      // console.log('➡️ Pagination metadata:', existingItems.meta.pagination);
      // console.log('➡️ Items received on this page:', existingItems.data.length);

      if (!existingItems || !existingItems.data) {
        throw new Error(
          "Invalid response structure: product item data is missing",
        );
      }

      if (!Array.isArray(existingItems.data)) {
        throw new Error(
          "Invalid response structure: product item data is not an array",
        );
      }

      // checking for duplicates before adding to the allItems array
      const newItems = existingItems.data.filter(
        (item) => !allItems.some((existing) => existing.id === item.id),
      );

      // Debugging for items issue
      // const previousLength = allItems.length;
      allItems.push(...newItems);
      // const newLength = allItems.length;
      // console.log('Array length after pushing new items:', newLength);
      // console.log('Items added in this iteration:', newLength - previousLength);

      //verify no duplicates in current page
      const currentPageIds = new Set(existingItems.data.map((item) => item.id));
      if (currentPageIds.size !== existingItems.data.length) {
        console.warn("Warning: Duplicate items detected in current page!");
      }

      totalPages = existingItems.meta.pagination.pageCount;
      currentPage++;
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error);
      throw error;
    }
  } while (currentPage <= totalPages);

  // final verification that the allItems array does not contain duplicates
  const finalIds = new Set(allItems.map((item) => item.id));

  console.log("Final array length:", allItems.length);
  console.log("Number of unique items:", finalIds.size);

  return allItems;
}

export { getProductItemIds };