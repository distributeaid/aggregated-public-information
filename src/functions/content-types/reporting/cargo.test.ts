import { processReportingCargo } from "./cargo";

describe("processReportingCargo", () => {
  it("skips calculating item count if there is no package/item", () => {
    const empty = {};
    processReportingCargo(empty);
    expect(empty).toEqual(empty);
  });

  it("skips calculating item count if item has no countPerCBM", () => {
    const emptyItem = {
      packageUnit: "Euro Pallet",
      packageCount: 1,
      item: {},
    };
    processReportingCargo(emptyItem);
    expect(emptyItem).toEqual(emptyItem);
  });

  it("sets itemCount to packageCount when each package is a single item", () => {
    const oneItem = {
      packageUnit: "Single Item",
      packageCount: 1,
      item: { countPerCBM: 3 },
      itemCount: 0
    };
    processReportingCargo(oneItem);
    expect(oneItem.itemCount).toEqual(oneItem.packageCount);
  });

  it("skips calculating item count if packageUnit cannot be mapped", () => {
    const unmappedPackageUnit = {
      packageUnit: "None of the Above",
      packageCount: 1,
      item: { countPerCBM: 3 },
    };
    processReportingCargo(unmappedPackageUnit);
    expect(unmappedPackageUnit).toEqual(unmappedPackageUnit);
  });

  it("updates itemCount", () => {
    const cargo = {
      packageCount: 5,
      item: { countPerCBM: 3 },
      packageUnit: "Euro Pallet",
      itemCount: 0,
    };
    const volCBM = 1.92;
    processReportingCargo(cargo);
    console.log(cargo);
    expect(cargo.itemCount).toEqual(
      cargo.packageCount * volCBM * cargo.item.countPerCBM,
    );
  });
});
