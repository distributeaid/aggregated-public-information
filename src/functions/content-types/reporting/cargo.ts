import { CargoPackage } from "./types";

const volCBMMap = {
  "Banana Box": 0.05,
  Box: 0.056,
  "Large Box": 0.087,
  "Euro Pallet": 1.92,
  Pallet: 2.04,
  Bag: 0.036,
  "Medium Bag": 0.079,
  "Large Bag": 0.2,
  "Bulk Bag": 0.729,
};

export function processReportingCargo(data: CargoPackage) {
  const { packageCount, packageUnit, item } = data;

  if (!packageCount || !packageUnit || !item) {
    return data;
  }

  if (packageUnit === "Item" || packageUnit === "Single Item") {
    data.itemCount = packageCount;
    return data;
  }

  const volCBM = volCBMMap[packageUnit];
  if (!volCBM) {
    return data;
  }

  const relatedItem = item;
  if (!relatedItem || !relatedItem.countPerCBM) {
    return data;
  }

  const countPerCBM = relatedItem.countPerCBM;

  data.itemCount = packageCount * volCBM * countPerCBM;

  return data;
}
