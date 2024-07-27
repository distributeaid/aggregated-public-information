import 'dotenv/config'
import csvToJson from "csvtojson";

import { toTitleCase } from "../helpers"

type Error = {
  field: string,
  description: string,
  action: string,
  rowJson: string
}
const errors: Array<Error> = []

const strapi = {
  url: `${process.env.STRAPI_URL}/api`,
  key: process.env.STRAPI_API_KEY
}


/* Categories
===================================================================== */

/* Add Categories From Product Info Sheet
------------------------------------------------- */
async function addCategoriesFromProductInfoSheet() {
  const products = await csvToJson().fromFile("upload-p/products.csv")
  const categories = await parseCategories(products)
  const existingCategories = await getExistingCategories()
  const newCategories = diffCategories(categories, existingCategories)
  const responses = await uploadCategories(newCategories)  
}


/* Parse CSV Categories
------------------------------------------------- */
function parseCategories(products) {
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
async function getExistingCategories() {
  console.log(strapi)
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
  console.log(existingCategories)

  const newCategories = [...categories].filter(
    (category) => {
      return !existingCategories.has(category)
    }
  )

  return newCategories
}

/* Upload New Categories
------------------------------------------------- */
async function uploadCategories(categories) {
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
