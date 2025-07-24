import { STRAPI_ENV } from "../strapi-env";

/*  Get the ids for each region from Strapi
 * ------------------------------------------------------- */
async function getRegionIds() {
  const existingRegions = await fetch(`${STRAPI_ENV.URL}/regions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const regionsResponse = await existingRegions.json();

  // Check if "Other" region exists
  if (!regionsResponse.data?.some(region => region.attributes?.name === "Other")) {
    // Add "Other" region if it's missing
    await fetch(`${STRAPI_ENV.URL}/regions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_ENV.KEY}`,
      },
      body: JSON.stringify({
        data: {
          name: "Other",
        }
      }),
    });
    
    // Re-fetch to ensure the new "Other" region is included
    return await fetch(`${STRAPI_ENV.URL}/regions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_ENV.KEY}`,
      },
    }).then(r => r.json()).then(r => r.data);
  }

  return regionsResponse.data;
}

export { getRegionIds };

/*  Get the ids for each subregion from Strapi
 * ------------------------------------------------------- */
async function getSubregionIds() {
  const subregionResponse = await fetch(`${STRAPI_ENV.URL}/subregions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const subregionResults = await subregionResponse.json();
  return subregionResults.data;
}

export { getSubregionIds };

/*  Get the ids for each survey from Strapi
 * ------------------------------------------------------- */
async function getSurveyIds() {
  const surveyResponse = await fetch(`${STRAPI_ENV.URL}/surveys`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const surveyResults = await surveyResponse.json();
  return surveyResults.data;
}

export { getSurveyIds };

/*  Get the ids for each product item from Strapi
 * ------------------------------------------------------- */
async function getProductItemIds() {
  const allItems = [];
  let currentPage = 1;
  let totalPages = 0;

  // console.log('➡️ Inital array length:', allItems.length)

  do {
    try {
      const productItemResponse = await fetch(`${STRAPI_ENV.URL}/items?pagination[page]=${currentPage}&pagination[pageSize]=25`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_ENV.KEY}`,
      },
    });

    if (!productItemResponse.ok) {
      throw new Error(`HTTP error! status: ${productItemResponse.status}`);
    }

    const data = await productItemResponse.json();
    
    // Debugging the items coming in via the page
    // console.log(`➡️ Page ${currentPage}`);
    // console.log('➡️ Pagination metadata:', data.meta.pagination);
    // console.log('➡️ Items received on this page:', data.data.length);

    if (!data || !data.data) {
      throw new Error('Invalid response structure: product item data is missing');
    }

    if (!Array.isArray(data.data)) {
      throw new Error('Invalid response structure: product item data is not an array');
    }

    // checking for duplicates before adding to the allItems array
    const newItems = data.data.filter(item =>
      !allItems.some(existing => existing.id === item.id)
    );

    // Debugging for items issue
    // const previousLength = allItems.length;
    allItems.push(...newItems);
    // const newLength = allItems.length;
    // console.log('Array length after pushing new items:', newLength);
    // console.log('Items added in this iteration:', newLength - previousLength);

    //verify no duplicates in current page
    const currentPageIds = new Set(data.data.map(item => item.id));
    if (currentPageIds.size !== data.data.length) {
      console.warn('Warning: Duplicate items detected in current page!');
    }

    totalPages = data.meta.pagination.pageCount;
    currentPage++;

    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error);
      throw error;
    }
    
  } while (currentPage <= totalPages);

  // final verification that the allItems array does not contain duplicates
  const finalIds = new Set(allItems.map(item => item.id));

  console.log('Final array length:', allItems.length);
  console.log('Number of unique items:', finalIds.size);

// console.log('\nFull array contents:');
// allItems.forEach((item, index) => {
//     console.log(`${index}:`, item);
// });

  return allItems;
}

export { getProductItemIds };
