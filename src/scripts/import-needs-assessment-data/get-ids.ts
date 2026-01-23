import { STRAPI_ENV } from "../strapi-env";
import {
    StrapiRegion,
    StrapiSubregion,
    // StrapiSurvey,
    // StrapiCategory,
    // StrapiProduct
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