import { STRAPI_ENV } from "../strapi-env"

export type NameToIdMap = {
  [key: string]: number;
};

/* Get Categories
 * ----------------------------------------------------- */
export async function getCategories() {
  console.log("    - getting existing categories")

  let response = await fetch(`${STRAPI_ENV.URL}/categories`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${STRAPI_ENV.KEY}`
    },
  });

  if (!response.ok) {
    console.log(response)
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const responseJson = await response.json()
  const existingCategories: NameToIdMap = responseJson.data.reduce(
    (categories: NameToIdMap, category) => {
      categories[category.name] = category.documentId
      return categories
    },
    {} as NameToIdMap
  )

  return existingCategories
}