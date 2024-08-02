import qs from 'qs'

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
      categories[category.attributes.name] = category.id
      return categories
    },
    {} as NameToIdMap
  )

  return existingCategories
}

/* Does Item Exist
 * ----------------------------------------------------- */
export async function doesItemExist(item): Promise<boolean> {
  const query = qs.stringify({
      filters: {
        name: {
          $eq: item.name,
        },
        age_gender: {
          $eq: item.age_gender,
        },
        size_style: {
          $eq: item.size_style
        }
      },
      fields: ['id'],
  })

  return fetch(`${STRAPI_ENV.URL}/items?${query}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${STRAPI_ENV.KEY}`
    },
  })
    .then(async (response) => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error(`  - failed to get item (${item.name} // ${item.age_gender} // ${item.size_style}). HttpError: ${response.status} - ${response.statusText}`)
      }
    })
    .then((result) => {
      return result.data.length > 0
    })   
}

export async function getItems() {
  console.log("    - getting existing items")

  let response = await fetch(`${STRAPI_ENV.URL}/items`, {
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
  const existingItems = responseJson.data.reduce(
    (items: Set<string>, item) => {
      return items.add(item.attributes.name)
    },
    new Set<string>()
  )

  return existingItems
}
