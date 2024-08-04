export function processProductItem(data) {
  const componentHandlers = {
    weight: calculateWeightFields,
    volume: calculateVolumeFields,
    needsMet: calculateNeedsMetFields,
    value: calculateValueFields,
  };

  for (const [component, handler] of Object.entries(componentHandlers)) {
    const componentData = data[component];
    if (componentData) {
      if (Array.isArray(componentData)) {
        data[component] = componentData.map(handler) || [];
      } else {
        data[component] = handler(componentData);
      }
    }
  }
  return data;
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
  const { packageVolume, countPerPackage, packageVolumeUnit } = data;

  const normalizedPagkageVolume = normalizeToCM(
    packageVolume,
    packageVolumeUnit
  );

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

function calculateNeedsMetFields(data) {
  const { items, months, people } = data;
  let monthlyNeedsMetPerItem = (people * months) / items;
  return { ...data, monthlyNeedsMetPerItem };
}

function calculateValueFields(data) {
  // Note there is no normalizing of currency units as
  // currently USD is the only unit available.
  const { packagePrice, countPerPackage } = data;
  let pricePerItemUSD = packagePrice / countPerPackage;
  pricePerItemUSD = parseFloat(pricePerItemUSD.toFixed(2));
  return { ...data, pricePerItemUSD };
}
