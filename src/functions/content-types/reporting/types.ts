export type CargoItem = {
  countPerCBM: number;
};

export type CargoPackage = {
  packageUnit: string;
  packageCount: number;
  item: CargoItem;
  itemCount?: number;
};
