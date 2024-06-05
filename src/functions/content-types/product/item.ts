export function processProductItem(data) {
  const componentHandlers = {
    weight: calculateWeightFields,
    volume: calculateVolumeFields,
    secondHand: calculateSecondHandFields,
  };

  for (const [component, handler] of Object.entries(componentHandlers)) {
    strapi.log.info(`PROCESSING COMPONENT: ${component}`);
    strapi.log.info(`*CTX BEFORE ${JSON.stringify(data[component])}`);

    const componentData = data[component];
    if (componentData) {
      if (Array.isArray(componentData)) {
        data[component] = componentData.map(handler) || [];
      } else {
        data[component] = handler(componentData);
      }
      strapi.log.info(`*CTX AFTER ${JSON.stringify(data[component])}`);
    }
  }
  return data;
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
