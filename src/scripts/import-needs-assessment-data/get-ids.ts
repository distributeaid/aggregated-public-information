import { STRAPI_ENV } from "../strapi-env";

/*  Get the ids for each region from Strapi
 * ------------------------------------------------------- */
async function getRegionIds() {
  // const regionResponse = await fetch(`${STRAPI_ENV.URL}/regions`, {
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

async function getProductItemIds() {
  const productItemResponse = await fetch(`${STRAPI_ENV.URL}/items`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const productItemResults = await productItemResponse.json();
  return productItemResults.data;
}

export { getProductItemIds };
