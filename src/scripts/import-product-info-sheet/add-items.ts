import qs from "qs";
import { STRAPI_ENV } from "../strapi-env";
import { toTitleCase } from "../helpers";
import { getCategories } from "./get-existing-data";
import type { NameToIdMap } from "./get-existing-data";

enum ItemUploadWorkflowStatus {
  PROCESSING = "PROCESSING",
  ORIGINAL_DATA_INVALID = "ORIGINAL_DATA_INVALID",
  DUPLICATE_CHECK_ERROR = "DUPLICATE_CHECK_ERROR",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  UPLOAD_ERROR = "UPLOAD_ERROR",
  SUCCESS = "SUCCESS",
  OTHER = "OTHER",
}

type ItemCsv = {
  category: {
    name: string;
  };
  name: string;
  age_gender: string;
  size_style: string;
  packSize: string;
  uuid: string;

  secondHand: {
    priceAdjustment: string;
  };

  needsMet: {
    items: string;
    people: string;
    months: string;
    monthlyNeedsMetPerItem: string;
    type: string;
    notes: string;
  };

  value: [
    {
      packagePriceUnit: string;
      packagePrice: string;
      countPerPackage: string;
      pricePerItemUSD: string;
      source: string;
      logDate: string;
      notes: string;
    },
  ];

  weight: [
    {
      packageWeight: string;
      packageWeightUnit: string;
      countPerPackage: string;
      itemWeightKg: string;
      countPerKg: string;
      source: string;
      logDate: string;
      notes: string;
    },
  ];

  volume: [
    {
      packageVolume: string;
      packageVolumeUnit: string;
      countPerPackage: string;
      itemVolumeCBCM: string;
      countPerCBM: string;
      source: string;
      logDate: string;
      notes: string;
    },
  ];
};

type Item = {
  category?: string;
  name?: string;
  age_gender?: string;
  size_style?: string;
  packSize?: number;
  uuid?: string;

  secondHand?: {
    canBeUsed: boolean;
    priceAdjustment: number;
  };

  needsMet?: {
    items: number;
    people: number;
    months: number;
    monthlyNeedsMetPerItem: number;
    type: string;
    notes: string;
  };

  value?: [
    {
      packagePriceUnit: string;
      packagePrice: number;
      countPerPackage: number;
      pricePerItemUSD: number;
      source: string;
      logDate: string;
      notes: string;
    },
  ];

  weight?: [
    {
      packageWeight: number;
      packageWeightUnit: string;
      countPerPackage: number;
      itemWeightKg: number;
      countPerKg: number;
      source: string;
      logDate: string;
      notes: string;
    },
  ];

  volume?: [
    {
      packageVolume: number;
      packageVolumeUnit: string;
      countPerPackage: number;
      itemVolumeCBCM: number;
      countPerCBM: number;
      source: string;
      logDate: string;
      notes: string;
    },
  ];
};

type ItemUploadWorkflow = {
  item: Item;
  origItem: ItemCsv;
  status: ItemUploadWorkflowStatus;
  logs: string[];
};

/* Categories
 * =========================================================================
 * NOTE: If there are duplicate items in the Product Info Sheet, there's a
 *       race-conition where those items may be uploaded at the same time.
 *       Usually the script prevents duplicates by checking if the item
 *       already exists on the server (so that running it multiple times)
 *       doesn't save all the items again.  But when you're running the
 *       script for the first time (or after purging the server data)
 *       then those items won't exist there, pass the check, and the
 *       duplicates in the data will be created on the server.
 *
 * TODO: To prevent this, we should check for duplicate items in the data
 *       during the parsing stage, and then skip them.
 */

/* Add Items
 * ----------------------------------------------------- */
export default async function addItems(products) {
  console.log("Adding items from Product Info sheet...");

  const categories = await getCategories();
  const results = await Promise.allSettled<ItemUploadWorkflow>(
    products.map((origItem) => {
      const workflow: ItemUploadWorkflow = {
        item: {},
        origItem,
        status: ItemUploadWorkflowStatus.PROCESSING,
        logs: [],
      };

      return parseItem(workflow, categories).then(getItem).then(uploadItem);
    }),
  );

  // { "SUCCESS": [], "ALREADY_EXISTS": [], ...}
  const resultsMap = Object.keys(ItemUploadWorkflowStatus).reduce(
    (resultsMap, key) => {
      resultsMap[key] = [];
      return resultsMap;
    },
    {},
  );

  results
    .map((result) => {
      if (isFulfilled(result)) {
        return result.value;
      } else {
        return result.reason as ItemUploadWorkflow;
      }
    })
    .reduce((resultsMap, workflowResult) => {
      if (workflowResult.status) {
        resultsMap[workflowResult.status].push(workflowResult);
      } else {
        resultsMap[ItemUploadWorkflowStatus.OTHER].push(workflowResult);
      }
      return resultsMap;
    }, resultsMap);

  console.log("Add items results:");
  Object.keys(resultsMap).forEach((key) => {
    console.log(`    ${key}: ${resultsMap[key].length}`);

    // Print out the logs for the items that failed to upload
    if (process.env.VERBOSE && key in ItemUploadWorkflowStatus && key != ItemUploadWorkflowStatus.ALREADY_EXISTS) {
      resultsMap[key].forEach((result) => {
        console.log(result.logs)
        console.log(JSON.stringify(result.item, null, 2))
        console.log("/n")
      })
    }
  });
  console.log("Adding items completed!");
}

const isFulfilled = <T>(
  value: PromiseSettledResult<T>,
): value is PromiseFulfilledResult<T> => {
  return value.status === "fulfilled";
};

const _isRejected = <T>(
  value: PromiseSettledResult<T>,
): value is PromiseRejectedResult => {
  return value.status === "rejected";
};

/* Parse Item
 * ------------------------------------------------------ */
function stripAndParseInt(numberString: string): number {
  return parseInt(numberString.replace(/$|,/g, ""));
}

function stripAndParseFloat(numberString: string): number {
  return parseFloat(numberString.replace(/$|,|%/g, ""));
}

function parseItem(
  { item, origItem, status, logs }: ItemUploadWorkflow,
  categories: NameToIdMap,
): Promise<ItemUploadWorkflow> {
  logs = [
    ...logs,
    `Log: Parsing item "${origItem.name} // ${origItem.age_gender} // ${origItem.size_style}".`,
  ];

  // create and immediately resolve a promise to let us chain
  return new Promise<ItemUploadWorkflow>((resolve, _reject) => {
    resolve({ item, origItem, status, logs });
  })
    .then(({ item, origItem, status, logs }): ItemUploadWorkflow => {
      if (origItem.name === "") {
        throw {
          item,
          origItem,
          status: ItemUploadWorkflowStatus.ORIGINAL_DATA_INVALID,
          logs: [...logs, "Error: Item is missing a name. Skipping..."],
        };
      }

      return {
        item: {
          name: toTitleCase(origItem.name),
          age_gender: toTitleCase(origItem.age_gender),
          size_style: origItem.size_style,
          packSize: stripAndParseInt(origItem.packSize) || 1, // default to 1
          uuid: undefined, // TODO: add uuid support in the model
        },
        origItem,
        status,
        logs,
      };
    })
    .then((results): ItemUploadWorkflow => {
      return parseCategory(results, categories);
    })
    .then(parseNeedsMet)
    .then(parseSecondHand)
    .then(parseValue)
    .then(parseWeight)
    .then(parseVolume)
    .then(({ item, origItem, status, logs }): ItemUploadWorkflow => {
      return {
        item,
        origItem,
        status,
        logs: [...logs, "Log: Successfully parsed item."],
      };
    });
}

function parseCategory(
  { item, origItem, status, logs }: ItemUploadWorkflow,
  categories: NameToIdMap,
): ItemUploadWorkflow {
  if (origItem.category.name === "") {
    throw {
      item,
      origItem,
      status: ItemUploadWorkflowStatus.ORIGINAL_DATA_INVALID,
      logs: [...logs, "Error: Category is missing a name.  Skipping..."],
    };
  }

  const categoryId = categories[toTitleCase(origItem.category.name)];
  if (categoryId === undefined) {
    throw {
      item,
      origItem,
      status: ItemUploadWorkflowStatus.ORIGINAL_DATA_INVALID,
      logs: [...logs, "Error: Category doesn't exist.  Skipping..."],
    };
  }

  return {
    item: {
      ...item,
      category: categoryId,
    },
    origItem,
    status,
    logs,
  };
}

function parseNeedsMet({
  item,
  origItem,
  status,
  logs,
}: ItemUploadWorkflow): ItemUploadWorkflow {
  const needsMet = origItem.needsMet;

  // no needs met info
  if (
    needsMet.items === "" &&
    needsMet.people === "" &&
    needsMet.months === "" &&
    needsMet.type === ""
  ) {
    return {
      item,
      origItem,
      status,
      logs,
    };
  }

  if (
    needsMet.items === "" ||
    needsMet.people === "" ||
    needsMet.months === "" ||
    needsMet.type === ""
  ) {
    return {
      item,
      origItem,
      status,
      logs: [...logs, "Error: Incomplete needsMet data. Ignoring..."],
    };
  }

  return {
    item: {
      ...item,
      needsMet: {
        items: stripAndParseInt(needsMet.items),
        people: stripAndParseInt(needsMet.people),
        months: stripAndParseInt(needsMet.months),
        monthlyNeedsMetPerItem: undefined, // calculated
        type: needsMet.type.toUpperCase(),
        notes: needsMet.notes,
      },
    },
    origItem,
    status,
    logs,
  };
}

function parseSecondHand({
  item,
  origItem,
  status,
  logs,
}: ItemUploadWorkflow): ItemUploadWorkflow {
  const secondHand = origItem.secondHand;

  if (
    secondHand.priceAdjustment === "N/A" ||
    secondHand.priceAdjustment === ""
  ) {
    return {
      item: {
        ...item,
        secondHand: {
          canBeUsed: false,
          priceAdjustment: undefined,
        },
      },
      origItem,
      status,
      logs,
    };
  } else {
    return {
      item: {
        ...item,
        secondHand: {
          canBeUsed: true,
          priceAdjustment: stripAndParseInt(secondHand.priceAdjustment),
        },
      },
      origItem,
      status,
      logs,
    };
  }
}

function parseValue({
  item,
  origItem,
  status,
  logs,
}: ItemUploadWorkflow): ItemUploadWorkflow {
  const value = origItem.value[0];

  // no value info
  if (
    value.packagePrice === "" &&
    // a lot of items have this set to "USA" by deafult, so don't consider it
    // && value.packagePriceUnit === ""
    value.countPerPackage === "" &&
    value.source === "" &&
    value.logDate === ""
  ) {
    return {
      item,
      origItem,
      status,
      logs,
    };
  }

  if (
    value.packagePrice === "" ||
    // a lot of items have this set to "USA" by deafult, so don't consider it
    // || value.packagePriceUnit === ""
    value.countPerPackage === "" ||
    value.source === "" ||
    value.logDate === ""
  ) {
    return {
      item,
      origItem,
      status,
      logs: [...logs, "Error: Incomplete value data. Ignoring..."],
    };
  }

  return {
    item: {
      ...item,
      value: [
        {
          packagePrice: stripAndParseFloat(value.packagePrice),
          packagePriceUnit:
            // TODO: spreadsheet data lists this column as country
            //       backend lists it as currency
            //       it should probably be both for the economic context
            //       (i.e. USD in USA)
            value.packagePriceUnit === "USA" ? "USD" : value.packagePriceUnit,
          countPerPackage: stripAndParseInt(value.countPerPackage),
          pricePerItemUSD: undefined, // calculated
          source: value.source,
          logDate: value.logDate,
          notes: value.notes,
        },
      ],
    },
    origItem,
    status,
    logs,
  };
}

function parseWeight({
  item,
  origItem,
  status,
  logs,
}: ItemUploadWorkflow): ItemUploadWorkflow {
  const weight = origItem.weight[0];

  // no weight data
  if (
    weight.packageWeight === "" &&
    weight.packageWeightUnit === "" &&
    weight.countPerPackage === "" &&
    weight.source === "" &&
    weight.logDate === ""
  ) {
    return {
      item,
      origItem,
      status,
      logs,
    };
  }

  if (
    weight.packageWeight === "" ||
    weight.packageWeightUnit === "" ||
    weight.countPerPackage === "" ||
    weight.source === "" ||
    weight.logDate === ""
  ) {
    return {
      item,
      origItem,
      status,
      logs: [...logs, "Error: Incomplete weight data. Ignoring..."],
    };
  }

  return {
    item: {
      ...item,
      weight: [
        {
          packageWeight: stripAndParseFloat(weight.packageWeight),
          packageWeightUnit: weight.packageWeightUnit,
          countPerPackage: stripAndParseInt(weight.countPerPackage),
          itemWeightKg: undefined, // calculated
          countPerKg: undefined, // calculated
          source: weight.source,
          logDate: weight.logDate,
          notes: weight.notes,
        },
      ],
    },
    origItem,
    status,
    logs,
  };
}

function parseVolume({
  item,
  origItem,
  status,
  logs,
}: ItemUploadWorkflow): ItemUploadWorkflow {
  const volume = origItem.volume[0];

  // no volume data
  if (
    volume.packageVolume === "" &&
    volume.packageVolumeUnit === "" &&
    volume.countPerPackage === "" &&
    volume.source === "" &&
    volume.logDate === ""
  ) {
    return {
      item,
      origItem,
      status,
      logs,
    };
  }

  if (
    volume.packageVolume === "" ||
    volume.packageVolumeUnit === "" ||
    volume.countPerPackage === "" ||
    volume.source === "" ||
    volume.logDate === ""
  ) {
    return {
      item,
      origItem,
      status,
      logs: [...logs, "Error: Incomplete volume data. Ignoring..."],
    };
  }

  return {
    item: {
      ...item,
      volume: [
        {
          packageVolume: stripAndParseFloat(volume.packageVolume),
          packageVolumeUnit: volume.packageVolumeUnit,
          countPerPackage: stripAndParseInt(volume.countPerPackage),
          itemVolumeCBCM: undefined, // calculated
          countPerCBM: undefined, // calculated
          source: volume.source,
          logDate: volume.logDate,
          notes: volume.notes,
        },
      ],
    },
    origItem,
    status,
    logs,
  };
}

/* Get Item
 * ----------------------------------------------------- */
async function getItem({
  item,
  origItem,
  status,
  logs,
}: ItemUploadWorkflow): Promise<ItemUploadWorkflow> {
  logs = [
    ...logs,
    `Log: Checking if item "${origItem.name} // ${origItem.age_gender} // ${origItem.size_style}" already exists.`,
  ];

  const query = qs.stringify({
    filters: {
      name: {
        $eq: item.name,
      },
      age_gender: {
        $eq: item.age_gender,
      },
      size_style: {
        $eq: item.size_style,
      },
    },
    fields: ["id"],
  });

  const response = await fetch(`${STRAPI_ENV.URL}/items?${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });
  const body = await response.json();

  if (!response.ok) {
    throw {
      item,
      origItem,
      status: ItemUploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      logs: [
        ...logs,
        `Error: Failed to get item. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  if (body.data.length > 1) {
    throw {
      item,
      origItem,
      status: ItemUploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      logs: [
        ...logs,
        `Error: Found too many matching items (${body.data.length}). Skipping...`,
      ],
    };
  }

  if (body.data.length === 1) {
    throw {
      item: body.data[0],
      origItem,
      status: ItemUploadWorkflowStatus.ALREADY_EXISTS,
      logs: [...logs, "Log: Found existing item. Skipping..."],
    };
  }

  return {
    item,
    origItem,
    status,
    logs: [...logs, "Success: Confirmed item does not exist."],
  };
}

/* Upload Item
 * ------------------------------------------------------ */
async function uploadItem({
  item,
  origItem,
  /* status, */ logs,
}: ItemUploadWorkflow): Promise<ItemUploadWorkflow> {
  logs = [
    ...logs,
    `Log: Creating item "${origItem.name} // ${origItem.age_gender} // ${origItem.size_style}".`,
  ];

  const response = await fetch(`${STRAPI_ENV.URL}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
    body: JSON.stringify({ data: item }),
  });
  const body = await response.json();

  if (!response.ok) {
    throw {
      item,
      origItem,
      status: ItemUploadWorkflowStatus.UPLOAD_ERROR,
      logs: [
        ...logs,
        `Error: Failed to create item. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  return {
    item: body.data,
    origItem,
    status: ItemUploadWorkflowStatus.SUCCESS,
    logs: [...logs, "Success: Created item."],
  };
}
