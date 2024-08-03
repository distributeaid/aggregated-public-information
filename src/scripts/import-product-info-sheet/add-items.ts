import qs from 'qs'
import { STRAPI_ENV } from "../strapi-env"
import { toTitleCase } from "../helpers"
import { getCategories } from "./get-existing-data"
import type { NameToIdMap } from "./get-existing-data"

/* Categories
 * ========================================================================= */

/* Add Items
 * ----------------------------------------------------- */
export default async function addItems(products) {
  console.log("Adding items from Product Info sheet...")

  const categories = await getCategories()
  const results = await Promise.allSettled(
    products.map((product) => {
      return parseItem(product, categories)
        .then((value) => {
          return value
        })
        .then(getItem)
        .then(uploadItem)
    })
  )

  results.forEach((result) => {
    console.log(result)
  })

  console.log("Adding items completed!")
}

/* Parse Item
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

function parseItem(
  origItem,
  categories: NameToIdMap
): Promise<{item: any, origItem: any, logs: string[]}> {
  const logs = [
    `Log: Parsing item "${origItem.name} // ${origItem.age_gender} // ${origItem.size_style}".`
  ]

  return new Promise<{item: any, origItem: any, logs: string[]}>((resolve, reject) => {
    if (origItem.name === "") {
      reject({
        item: {},
        origItem,
        logs: [
          ...logs,
          "Error: Item is missing a name. Skipping..."
        ]
      })
    }

    resolve({
      item: {
        name: toTitleCase(origItem.name),
        age_gender: toTitleCase(origItem.age_gender),
        size_style: origItem.size_style,
        packSize: stripAndParseInt(origItem.packSize) || 1, // default to 1
        uuid: undefined, // TODO: add uuid support in the model
      },
      origItem,
      logs
    })
  })
    .then((results) => {
      return parseCategory(results, categories)
    })
    .then(parseNeedsMet)
    .then(parseSecondHand)
    .then(parseValue)
    .then(parseWeight)
    .then(parseVolume)
    .then(({item, logs}) => {
      return {
        item,
        origItem,
        logs: [
          ...logs,
          "Log: Successfully parsed item."
        ]
      }
    })
}

function parseCategory(
  {item, origItem, logs}: {item: any, origItem: any, logs: string[]},
  categories: NameToIdMap
) {
  if (origItem.category.name === "") {
    throw {
      item,
      origItem,
      logs: [
        ...logs,
        "Error: Category is missing a name.  Skipping..."
      ]
    }
  }

  const categoryId = categories[origItem.category.name]
  if (categoryId === undefined) {
    throw {
      item,
      origItem,
      logs: [
        ...logs,
        "Error: Category doesn't exist.  Skipping..."
      ]
    }
  }

  return {
    item: {
      ...item,
      category: categoryId
    },
    origItem,
    logs
  }
}

function parseNeedsMet(
  {item, origItem, logs}: {item: any, origItem: any, logs: string[]}
): {item: any, origItem: any, logs: string[]}  {
  const needsMet = origItem.needsMet

  // no needs met info
  if ( needsMet.items === ""
    && needsMet.people === ""
    && needsMet.months === ""
    && needsMet.type === ""
  ) {
    return {
      item,
      origItem,
      logs
    }
  }
  
  if ( needsMet.items === ""
    || needsMet.people === ""
    || needsMet.months === ""
    || needsMet.type === ""
  ) {
    return {
      item,
      origItem,
      logs: [
        ...logs,
        "Error: Incomplete needsMet data. Ignoring..."
      ]
    }
  }

  return {
    item: {
      ...item,
      needsMet: {
        items: stripAndParseInt(needsMet.items),
        people: stripAndParseInt(needsMet.people),
        months: stripAndParseInt(needsMet.months),
        monthlyNeedsMetPerItem: undefined, // calculated
        type: needsMet.type,
        notes: needsMet.notes
      }
    },
    origItem,
    logs
  }
}

function parseSecondHand(
  {item, origItem, logs}: {item: any, origItem: any, logs: string[]}
): {item: any, origItem: any, logs: string[]}  {
  const secondHand = origItem.secondHand

  if ( secondHand.priceAdjustment === "N/A"
    || secondHand.priceAdjustment === ""
  ) {
    return {
      item: {
        ...item,
        secondHand: {
          canBeUsed: false,
          priceAdjustment: undefined    
        }
      },
      origItem,
      logs
    }
  } else {
    return {
      item: {
        ...item,
        secondHand: {
          canBeUsed: true,
          priceAdjustment: stripAndParseInt(secondHand.priceAdjustment)    
        }
      },
      origItem,
      logs
    }
  }
}

function parseValue(
  {item, origItem, logs}: {item: any, origItem: any, logs: string[]}
): {item: any, origItem: any, logs: string[]}  {
  const value = origItem.value[0]

  // no value info
  if ( value.packagePrice === ""
    // a lot of items have this set to "USA" by deafult, so don't consider it
    // && value.packagePriceUnit === ""
    && value.countPerPackage === ""
    && value.source === ""
    && value.logDate === ""
  ) {
    return {
      item,
      origItem,
      logs
    }
  }
  
  if ( value.packagePrice === ""
    // a lot of items have this set to "USA" by deafult, so don't consider it
    // || value.packagePriceUnit === ""
    || value.countPerPackage === ""
    || value.source === ""
    || value.logDate === ""
  ) {
    return {
      item,
      origItem,
      logs: [
        ...logs,
        "Error: Incomplete value data. Ignoring..."
      ]
    }
  }
  
  return {
    item: {
      ...item,
      value: [{
        packagePrice: stripAndParseFloat(value.packagePrice),
        packagePriceUnit: value.packagePriceUnit,
        countPerPackage: stripAndParseInt(value.countPerPackage),
        pricePerItemUSD: undefined, // calculated
        source: value.source,
        logDate: value.logDate,
        notes: value.notes
      }]
    },
    origItem,
    logs
  }
}

function parseWeight(
  {item, origItem, logs}: {item: any, origItem: any, logs: string[]}
): {item: any, origItem: any, logs: string[]}  {
  const weight = origItem.weight[0]

  // no weight data
  if ( weight.packageWeight === ""
    && weight.packageWeightUnit === ""
    && weight.countPerPackage === ""
    && weight.source === ""
    && weight.logDate === ""
  ) {
    return {
      item,
      origItem,
      logs
    }
  }
  
  if ( weight.packageWeight === ""
    || weight.packageWeightUnit === ""
    || weight.countPerPackage === ""
    || weight.source === ""
    || weight.logDate === ""
  ) {
    return {
      item,
      origItem,
      logs: [
        ...logs,
        "Error: Incomplete weight data. Ignoring..."
      ]
    }
  }

  return {
    item: {
      ...item,
      weight: [{
        packageWeight: stripAndParseFloat(weight.packageWeight),
        packageWeightUnit: weight.packageWeightUnit,
        countPerPackage: stripAndParseInt(weight.countPerPackage),
        itemWeightKg: undefined, // calculated
        countPerKg: undefined, // calculated
        source: weight.source,
        logDate: weight.logDate,
        notes: weight.notes
      }]
    },
    origItem,
    logs
  }
}

function parseVolume(
  {item, origItem, logs}: {item: any, origItem: any, logs: string[]}
): {item: any, origItem: any, logs: string[]}  {
  const volume = origItem.volume[0]

  // no volume data
  if ( volume.packageVolume === ""
    && volume.packageVolumeUnit === ""
    && volume.countPerPackage === ""
    && volume.source === ""
    && volume.logDate === ""
  ) {
    return {
      item,
      origItem,
      logs
    }
  }
  
  if ( volume.packageVolume === ""
    || volume.packageVolumeUnit === ""
    || volume.countPerPackage === ""
    || volume.source === ""
    || volume.logDate === ""
  ) {
    return {
      item,
      origItem,
      logs: [
        ...logs,
        "Error: Incomplete volume data. Ignoring..."
      ]
    }
  }

  return {
    item: {
      ...item,
      volume: [{
        packageVolume: stripAndParseFloat(volume.packageVolume),
        packageVolumeUnit: volume.packageVolumeUnit,
        countPerPackage: stripAndParseInt(volume.countPerPackage),
        itemVolumeCBCM: undefined, // calculated
        countPerCBM: undefined, // calculated
        source: volume.source,
        logDate: volume.logDate,
        notes: volume.notes
      }]
    },
    origItem,
    logs
  }
}

/* Get Item
 * ----------------------------------------------------- */
async function getItem(
  {item, origItem, logs}: {item: any, origItem: any, logs: string[]}
): Promise<{item: any, origItem: any, logs: string[]}> {
  logs = [
    ...logs,
    `Log: Checking if item "${item.name} // ${item.age_gender} // ${item.size_style}" already exists.`
  ]

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

  const response = await fetch(`${STRAPI_ENV.URL}/items?${query}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${STRAPI_ENV.KEY}`
    },
  })
  const body = await response.json()

  if (!response.ok) {
    throw {
      item,
      origItem,
      logs: [
        ...logs,
        `Error: Failed to get item. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body)
      ]
    }
  }

  if (body.data.length > 1) {
    throw {
      item,
      origItem,
      logs: [
        ...logs,
        `Error: Found too many matching items (${body.data.length}). Skipping...`
      ]
    }
  }

  if (body.data.length === 1) {
    throw {
      item: {
        ...item,
        id: body.data[0].id
      },
      origItem,
      logs: [
        ...logs,
        "Log: Found existing item. Skipping..."
      ]
    }
  }

  return {
    item: body.data[0],
    origItem,
    logs: [
      ...logs,
      "Success: Confirmed item does not exist."
    ]
  }
}

/* Upload Item
 * ------------------------------------------------------ */
async function uploadItem(
  {item, origItem, logs}: {item: any, origItem: any, logs: string[]}
): Promise<{item: any, origItem: any, logs: string[]}> {
  logs = [
    ...logs,
    `Log: Creating item "${item.name} // ${item.age_gender} // ${item.size_style}".`
  ]

  const response = await fetch(`${STRAPI_ENV.URL}/items`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${STRAPI_ENV.KEY}`
    },
    body: JSON.stringify({data: item})
  })
  const body = await response.json()

  if (!response.ok) {
    throw {
      item,
      origItem,
      logs: [
        ...logs,
        `Error: Failed to create item. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body)
      ]
    }
  }

  return {
    item: body.data,
    origItem,
    logs: [
      ...logs,
      "Success: Created item."
    ]
  }
}
