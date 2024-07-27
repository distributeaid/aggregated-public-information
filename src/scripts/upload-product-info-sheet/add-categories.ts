import 'dotenv/config'

import { toTitleCase } from "../helpers"

type Error = {
  field: string,
  description: string,
  action: string,
  rowJson: string
}
const errors: Array<Error> = []


/* Categories
===================================================================== */

/* Add Categories
------------------------------------------------- */
export default async function addCategories(strapi, products) {
  console.log("Adding categories from Product Info sheet...")

  const categories = await parseCategories(products)
  const existingCategories = await getExistingCategories(strapi)
  const newCategories = diffCategories(categories, existingCategories)
  const responses = await uploadCategories(strapi, newCategories)

  return errors
}

/* Parse CSV Categories
------------------------------------------------- */
function parseCategories(products) {
  console.log("    - parsing categories")

  const categories = products.reduce(
    (cats: Set<string>, product) => {
      if (product["Category"] === '') {
        errors.push({
          field: "category",
          description: "missing category",
          action: "ignored",
          rowJson: JSON.stringify(product)
        })
      } else {
        const category = toTitleCase(product["Category"])
        return cats.add(category)
      }

      return cats
    },
    new Set<string>()
  )

  return categories
}

/* Get Existing Categories
------------------------------------------------- */
export async function getExistingCategories(strapi) {
  console.log("    - getting existing categories")

  let response = await fetch(`${strapi.url}/categories`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${strapi.key}`
    },
  });

  if (!response.ok) {
    console.log(response)
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const responseJson = await response.json()
  const existingCategories = responseJson.data.reduce(
    (cats: Set<string>, category) => {
      return cats.add(category.attributes.name)
    },
    new Set<string>()
  )

  return existingCategories
}

/* Diff Categories
------------------------------------------------- */
function diffCategories(categories, existingCategories) {
  const newCategories = [...categories].filter(
    (category) => {
      if (existingCategories.has(category)) {
        console.log(`    - skipping "${category}" because it already exists`)
        return false
      } else {
        return true
      }
    }
  )

  return newCategories
}

/* Upload New Categories
------------------------------------------------- */
async function uploadCategories(strapi, categories) {
  console.log(`    - uploading new categories`)

  const responses = await Promise.all(
    categories.map(async (category) => {
      return await fetch(`${strapi.url}/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${strapi.key}`
        },
        body: JSON.stringify({data: {name: category}})
      });
    })
  )

  responses.forEach((response) => {
    if (!response.ok) {
      console.log(response)
      throw new Error(`HTTP error! Status: ${response.status}`);
    }  
  })

  return responses
}
