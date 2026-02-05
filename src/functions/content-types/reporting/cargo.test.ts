import { processReportingCargo } from "./cargo";
import type { CargoPackage, CargoPackageUnit } from "./types";

describe("processReportingCargo", () => {
  it("skips calculating item count if there is no package/item", () => {
    const empty = {} as unknown as CargoPackage;
    processReportingCargo(empty);
    expect(empty).toEqual(empty);
  });

  it("skips calculating item count if item has no countPerCBM", () => {
    const emptyItem = {
      packageUnit: "Euro Pallet",
      packageCount: 1,
      item: {},
    } as unknown as CargoPackage;
    processReportingCargo(emptyItem);
    expect(emptyItem).toEqual(emptyItem);
  });

  it("sets itemCount to packageCount when each package is a single item", () => {
    const oneItem = {
      packageUnit: "Single Item",
      packageCount: 1,
      item: { countPerCBM: 3 },
      itemCount: 0, //what to do about this? can I get around having this placeholder?
    } as CargoPackage;
    processReportingCargo(oneItem);
    expect(oneItem.itemCount).toEqual(oneItem.packageCount);
  });

  it("skips calculating item count if packageUnit cannot be mapped", () => {
    const weirdUnit = {
      packageUnit: "None of the Above" as CargoPackageUnit,
      packageCount: 1,
      item: { countPerCBM: 3 },
    } as CargoPackage;
    processReportingCargo(weirdUnit);
    expect(weirdUnit).toEqual(weirdUnit);
  });

  it("updates itemCount", () => {
    const cargo = {
      packageCount: 5,
      item: { countPerCBM: 3 },
      packageUnit: "Euro Pallet",
      itemCount: 0,
    } as CargoPackage;
    const volCBM = 1.92;
    processReportingCargo(cargo);
    console.log(cargo);
    expect(cargo.itemCount).toEqual(
      cargo.packageCount * volCBM * cargo.item.countPerCBM,
    );
  });
});
