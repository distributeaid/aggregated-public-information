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
    packageWeightUnit,
  );

  const itemWeightKg = normalizedPagkageWeight / countPerPackage;
  const countPerKg = 1 / itemWeightKg;

  return { ...data, itemWeightKg, countPerKg };
}

function calculateVolumeFields(data) {
  const { packageVolume, countPerPackage, packageVolumeUnit } = data;

  const normalizedPagkageVolume = normalizeToCM(
    packageVolume,
    packageVolumeUnit,
  );

  const itemVolumeCBCM = normalizedPagkageVolume / countPerPackage;
  const countPerCBM = 1000000 / itemVolumeCBCM;

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
  const monthlyNeedsMetPerItem = (people * months) / items;
  return { ...data, monthlyNeedsMetPerItem };
}

function calculateValueFields(data) {
  // Note there is no normalizing of currency units as
  // currently USD is the only unit available.
  const { packagePrice, countPerPackage } = data;
  let pricePerItemUSD = packagePrice / countPerPackage;
  pricePerItemUSD = Math.round(pricePerItemUSD * 100) / 100;
  return { ...data, pricePerItemUSD };
}
