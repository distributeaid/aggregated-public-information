module.exports = (plugin) => {
  let originalCreate = plugin.controllers["collection-types"].create;
  plugin.controllers["collection-types"].create = (ctx) => {
    processContentType(ctx);
    return originalCreate(ctx);
  };

  let originalUpdate = plugin.controllers["collection-types"].update;
  plugin.controllers["collection-types"].update = (ctx) => {
    processContentType(ctx);
    return originalUpdate(ctx);
  };

  return plugin;
};

function processContentType(ctx) {
  /*
   Content-manager paths look like this:
    http://host/admin/content-manager/collection-types/api::product.item/15

   API paths look like this (note the use of the plural version here!)
    http://host/api/items/15 )

   So need to map both options to the appropriate handler
  */
  const contentTypeHandlers = {
    "product.item": processProductItem,
    items: processProductItem,
    "product.category": processProductCatetory,
    categories: processProductCatetory,
    "geo.country": processGeoCountry,
    countries: processGeoCountry,
  };

  const contentType = detectContentType(ctx.request.path);
  strapi.log.info(`DETECTED CONTENT TYPE ${contentType}`);

  const handler = contentTypeHandlers[contentType];
  if (handler) {
    handler(ctx);
  }
}

function detectContentType(path) {
  if (path.includes("content-manager/collection-types/api::")) {
    return path.split("api::")[1].split("/")[0];
  }

  if (path.includes("/api/")) {
    return path.split("/api/")[1].split("/")[0];
  }
}

function processProductItem(ctx) {
  const componentHandlers = {
    weight: calculateWeightFields,
    volume: calculateVolumeFields,
    secondHand: calculateSecondHandFields,
  };

  for (const [component, handler] of Object.entries(componentHandlers)) {
    strapi.log.info(`PROCESSING COMPONENT: ${component}`);

    const componentData = ctx.request.body[component];
    if (componentData) {
      if (Array.isArray(componentData)) {
        ctx.request.body[component] = componentData.map(handler) || [];
      } else {
        ctx.request.body[component] = handler(componentData);
      }
    }
  }
}

function processProductCatetory(ctx) {
  // strapi.log.info(`PROCESS PRODUCT CATEGORY`);
}
function processGeoCountry(ctx) {
  // strapi.log.info(`PROCESS GEO COUNTRY`);
}

function calculateSecondHandFields(data) {
  strapi.log.info(`CALCULATE SECOND HAND FIELDS ${JSON.stringify(data)}`);

  let { canBeUsed, priceAdjustment } = data;
  if (!canBeUsed) {
    priceAdjustment = 100;
  }
  return { ...data, priceAdjustment };
}

function calculateWeightFields(data) {
  const { packageWeight, countPerPackage, packageWeightUnit } = data;

  const normalizedPagkageWeight = normalizeToKg(
    packageWeight,
    packageWeightUnit
  );

  let itemWeightKg = normalizedPagkageWeight / countPerPackage;
  let countPerKg = 1 / itemWeightKg;

  itemWeightKg = parseFloat(itemWeightKg.toFixed(2));
  countPerKg = parseFloat(countPerKg.toFixed(2));

  return { ...data, itemWeightKg, countPerKg };
}

function calculateVolumeFields(data) {
  const { packageVolume, countPerPackage, volumeUnit } = data;

  const normalizedPagkageVolume = normalizeToCM(packageVolume, volumeUnit);

  let itemVolumeCBCM = normalizedPagkageVolume / countPerPackage;
  let countPerCBM = 1000000 / itemVolumeCBCM;

  itemVolumeCBCM = parseFloat(itemVolumeCBCM.toFixed(2));
  countPerCBM = parseFloat(countPerCBM.toFixed(2));

  return { ...data, itemVolumeCBCM, countPerCBM };
}

function normalizeToKg(weight, unit) {
  switch (unit) {
    case "lb":
      return weight * 0.45359237;
    case "oz":
      return weight * 0.0283495231;
    case "g":
      return weight * 0.001;
    case "kg":
      return weight;
    default:
      throw new Error(`Unsupported weight unit: ${unit}`);
  }
}

function normalizeToCM(volume, unit) {
  switch (unit) {
    case "cubic ft":
      return volume * 28316.8;
    case "cubic in":
      return volume * 16.387064;
    case "cubic m":
      return volume * 1000000;
    case "cubic cm":
      return volume;
    default:
      throw new Error(`Unsupported volume unit: ${unit}`);
  }
}
