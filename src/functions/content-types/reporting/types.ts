export type CargoItem = {
  countPerCBM: number;
};

export type CargoPackageUnit =
    "Banana Box"
    | "Box"
    | "Large Box"
    | "Euro Pallet"
    | "Pallet"
    | "Bag"
    | "Medium Bag"
    | "Large Bag"
    | "Bulk Bag"
    | "Item"
    | "Single Item";

export type CargoPackage = {
  packageUnit: CargoPackageUnit;
  packageCount: number;
  item: CargoItem;
  itemCount?: number;
};
