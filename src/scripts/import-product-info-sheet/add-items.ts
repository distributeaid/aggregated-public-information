import { toTitleCase } from "../helpers"
import { STRAPI_ENV } from "../strapi-env"
import { doesItemExist, getCategories, getItems } from "./get-existing-data"
import type { NameToIdMap } from "./get-existing-data"

/* Categories
 * ========================================================================= */

/* Add Items
 * ----------------------------------------------------- */
export default async function addItems(products) {
  console.log("Adding items from Product Info sheet...")

  const existingCategories = await getCategories()
  const items = await parseItems(products, existingCategories)
  const validItems = validateItems(products)
  const results = await uploadNewItems(items)

  console.log(results)

  console.log("Adding items completed!")
}

/* Parse Items
 * ------------------------------------------------------ */
function stripAndParseInt(numberString: string): number {
  return parseInt(
    numberString.replace(/$|,/g, '')
  )
}

function stripAndParseFloat(numberString: string): number {
  return parseFloat(
    numberString.replace(/$|,|%/g, '')
  )
}

function parseItems(products, existingCategories: NameToIdMap) {
  console.log("    - parsing items")

  const items = products.map((product) => {
    // make some adjustments to our CSV input data to prep it for upload
    const item = {
      category: existingCategories[toTitleCase(product.category.name)],
      name: toTitleCase(product.name),
      age_gender: toTitleCase(product.age_gender),
      size_style: product.size_style,
      packSize: stripAndParseInt(product.packSize),
      uuid: undefined, // TODO: add uuid support in the model

      needsMet: parseNeedsMet(product),
      secondHand: parseSecondHand(product),
      value: parseValue(product),
      weight: parseWeight(product),
      volume: parseVolume(product)
    }

    return item
  })

  return items
}

function parseNeedsMet(product) {
  const needsMet = product.needsMet

  if ( needsMet.items === ""
    && needsMet.people === ""
    && needsMet.months === ""
    && needsMet.type === ""
  ) {
    return undefined
  } else if ( needsMet.items === ""
    && needsMet.people === ""
    && needsMet.months === ""
    && needsMet.type === ""
  ) {
    console.log(`  - incomplete needs data for (${product.name} // ${product.age_gender} // ${product.size_style}), ignoring...`)
    return undefined
  }
}

function parseSecondHand(product) {
  const secondHand = product.secondHand

  if ( secondHand.priceAdjustment === "N/A"
    || secondHand.priceAdjustment === ""
  ) {
    return {
      canBeUsed: false,
      priceAdjustment: undefined
    }
  } else {
    return {
      canBeUsed: true,
      priceAdjustment: stripAndParseInt(secondHand.priceAdjustment)
    }
  }
}

function parseValue(product) {
  const value = product.value[0]

  if ( value.packagePrice === ""
    && value.packagePriceUnit === ""
    && value.countPerPackage === ""
    && value.source === ""
    && value.logDate === ""
  ) {
    return []
  } else if ( value.packagePrice === ""
    || value.packagePriceUnit === ""
    || value.countPerPackage === ""
    || value.source === ""
    || value.logDate === ""
  ) {
    console.log(`  - incomplete price data for (${product.name} // ${product.age_gender} // ${product.size_style}), ignoring...`)
    return []
  } else {
    return [{
      packagePrice: stripAndParseFloat(value.packagePrice),
      packagePriceUnit: value.packagePriceUnit,
      countPerPackage: stripAndParseInt(value.countPerPackage),
      pricePerItemUSD: undefined, // calculated
      source: value.source,
      logDate: value.logDate,
      notes: value.notes
    }]
  }
}

function parseWeight(product) {
  const weight = product.weight[0]

  if ( weight.packageWeight === ""
    && weight.packageWeightUnit === ""
    && weight.countPerPackage === ""
    && weight.source === ""
    && weight.logDate === ""
  ) {
    return []
  } else if ( weight.packageWeight === ""
    || weight.packageWeightUnit === ""
    || weight.countPerPackage === ""
    || weight.source === ""
    || weight.logDate === ""
  ) {
    console.log(`  - incomplete weight data for (${product.name} // ${product.age_gender} // ${product.size_style}), ignoring...`)
    return []
  } else {
    return [{
      packageWeight: stripAndParseFloat(weight.packageWeight),
      packageWeightUnit: weight.packageWeightUnit,
      countPerPackage: stripAndParseInt(weight.countPerPackage),
      itemWeightKg: undefined, // calculated
      countPerKg: undefined, // calculated
      source: weight.source,
      logDate: weight.logDate,
      notes: weight.notes
    }]
  }
}

function parseVolume(product) {
  const volume = product.volume[0]

  if ( volume.packageVolume === ""
    && volume.packageVolumeUnit === ""
    && volume.countPerPackage === ""
    && volume.source === ""
    && volume.logDate === ""
  ) {
    return []
  } else if ( volume.packageVolume === ""
    || volume.packageVolumeUnit === ""
    || volume.countPerPackage === ""
    || volume.source === ""
    || volume.logDate === ""
  ) {
    console.log(`  - incomplete volume data for (${product.name} // ${product.age_gender} // ${product.size_style}), ignoring...`)
    return []
  } else {
    return [{
      packageVolume: stripAndParseFloat(volume.packageVolume),
      packageVolumeUnit: volume.packageVolumeUnit,
      countPerPackage: stripAndParseInt(volume.countPerPackage),
      itemVolumeCBCM: undefined, // calculated
      countPerCBM: undefined, // calculated
      source: volume.source,
      logDate: volume.logDate,
      notes: volume.notes
    }]
  }
}

/* Validate Items
 * ------------------------------------------------------ */
function validateItems(items) {
  return items
}

/* Upload New Items
 * ------------------------------------------------------ */
function uploadNewItems(items) {
  console.log(`    - uploading items`)

  return Promise.allSettled(
    items.map((item) => {
      return doesItemExist(item)
        .then((exists: boolean) => {
          if (exists) {
            return `  - item (${item.name} // ${item.age_gender} // ${item.size_style}) already exists. skipping it...`
          } else {
            return uploadItem(item)
          }
        })
    })
  )
}

/* Upload Item
 * ------------------------------------------------------ */
function uploadItem(item) {
  return fetch(`${STRAPI_ENV.URL}/items`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${STRAPI_ENV.KEY}`
    },
    body: JSON.stringify({data: item})
  })
    .then(async (response) => {
      if (response.ok) {
        const result = await response.json()
        return `  - created item (${item.name} // ${item.age_gender} // ${item.size_style}). id=${result.data.id}`
      } else {
//        throw new Error(`  - failed to create item (${item.name} // ${item.age_gender} // ${item.size_style}). HttpError: ${response.status} - ${response.statusText}`)
      }
    })
}
