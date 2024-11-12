import { processProductItem } from "./item";

describe("processProductItem", () => {
  it("updates weight component with itemWeightKg and countPerKg calculations", () => {
    const item = createTestItem();

    const { weight } = processProductItem(item);
    expect(weight).toEqual([
      {
        packageWeight: 4.6,
        countPerPackage: 3,
        packageWeightUnit: "oz",
        itemWeightKg: expect.closeTo(0.04),
        countPerKg: expect.closeTo(23.0),
      },
      {
        packageWeight: 1.3,
        countPerPackage: 1,
        packageWeightUnit: "lb",
        itemWeightKg: expect.closeTo(0.59),
        countPerKg: expect.closeTo(1.7),
      },
    ]);
  });

  it("updates volume component with itemVolumeCBCM and countPerCBM calculations", () => {
    const item = createTestItem();
    const { volume } = processProductItem(item);

    expect(volume).toEqual([
      {
        packageVolume: 53.08,
        countPerPackage: 3,
        packageVolumeUnit: "cubic in",
        itemVolumeCBCM: expect.closeTo(289.94),
        countPerCBM: expect.closeTo(3448.9682),
      },
      {
        packageVolume: 447.37,
        countPerPackage: 1,
        packageVolumeUnit: "cubic in",
        itemVolumeCBCM: expect.closeTo(7331.0808),
        countPerCBM: expect.closeTo(136.4055),
      },
    ]);
  });

  it("updates value component with pricePerItemUSD calculation", () => {
    const item = createTestItem();
    const { value } = processProductItem(item);

    expect(value).toEqual([
      {
        packagePrice: 3.28,
        countPerPackage: 3,
        pricePerItemUSD: expect.closeTo(1.09),
      },
      {
        packagePrice: 10.99,
        countPerPackage: 1,
        pricePerItemUSD: expect.closeTo(10.99),
      },
    ]);
  });

  it("updates needsMet component with monthlyNeedsMetPerItem calculation", () => {
    const item = createTestItem();
    const { needsMet } = processProductItem(item);

    expect(needsMet).toEqual({
      items: 12,
      months: 1,
      people: 1,
      monthlyNeedsMetPerItem: expect.closeTo(0.08),
    });
  });

  it("applies calculations to multiple components correctly", () => {
    const item = createTestItem();
    const result = processProductItem(item);

    expect(result).toEqual({
      packSize: 1,
      name: "dummy_item",
      weight: [
        {
          packageWeight: 4.6,
          countPerPackage: 3,
          packageWeightUnit: "oz",
          itemWeightKg: expect.closeTo(0.04),
          countPerKg: expect.closeTo(23.0),
        },
        {
          packageWeight: 1.3,
          countPerPackage: 1,
          packageWeightUnit: "lb",
          itemWeightKg: expect.closeTo(0.59),
          countPerKg: expect.closeTo(1.7),
        },
      ],
      volume: [
        {
          packageVolume: 53.08,
          countPerPackage: 3,
          packageVolumeUnit: "cubic in",
          itemVolumeCBCM: expect.closeTo(289.94),
          countPerCBM: expect.closeTo(3448.968),
        },
        {
          packageVolume: 447.37,
          countPerPackage: 1,
          packageVolumeUnit: "cubic in",
          itemVolumeCBCM: expect.closeTo(7331.0808),
          countPerCBM: expect.closeTo(136.4055),
        },
      ],
      value: [
        {
          packagePrice: 3.28,
          countPerPackage: 3,
          pricePerItemUSD: expect.closeTo(1.09),
        },
        {
          packagePrice: 10.99,
          countPerPackage: 1,
          pricePerItemUSD: expect.closeTo(10.99),
        },
      ],
      needsMet: {
        items: 12,
        months: 1,
        people: 1,
        monthlyNeedsMetPerItem: expect.closeTo(0.08),
      },
    });
  });

  it("handles components with 0 repeating entries correctly", () => {
    const item = { packSize: 1, name: "item6" };
    const result = processProductItem(item);

    expect(result).toEqual({ packSize: 1, name: "item6" });
  });

  it("handles components with 1 repeating entry correctly", () => {
    const item = createTestItem({
      weight: [
        {
          packageWeight: 4.6,
          countPerPackage: 3,
          packageWeightUnit: "oz",
        },
      ],
      volume: [
        {
          packageVolume: 53.08,
          countPerPackage: 3,
          packageVolumeUnit: "cubic in",
        },
      ],
      value: [
        {
          packagePrice: 3.28,
          countPerPackage: 3,
        },
      ],
      needsMet: {
        items: 12,
        months: 1,
        people: 1,
      },
    });

    const result = processProductItem(item);

    expect(result).toEqual({
      packSize: 1,
      name: "dummy_item",
      weight: [
        {
          packageWeight: 4.6,
          countPerPackage: 3,
          packageWeightUnit: "oz",
          itemWeightKg: expect.closeTo(0.04),
          countPerKg: expect.closeTo(23.0),
        },
      ],
      volume: [
        {
          packageVolume: 53.08,
          countPerPackage: 3,
          packageVolumeUnit: "cubic in",
          itemVolumeCBCM: expect.closeTo(289.94),
          countPerCBM: expect.closeTo(3448.968),
        },
      ],
      value: [
        {
          packagePrice: 3.28,
          countPerPackage: 3,
          pricePerItemUSD: expect.closeTo(1.09),
        },
      ],
      needsMet: {
        items: 12,
        months: 1,
        people: 1,
        monthlyNeedsMetPerItem: expect.closeTo(0.08),
      },
    });
  });
});

const createTestItem = (overrides = {}) => ({
  packSize: 1,
  name: "dummy_item",
  weight: [
    {
      packageWeight: 4.6,
      countPerPackage: 3,
      packageWeightUnit: "oz",
    },
    {
      packageWeight: 1.3,
      countPerPackage: 1,
      packageWeightUnit: "lb",
    },
  ],
  volume: [
    {
      packageVolume: 53.08,
      countPerPackage: 3,
      packageVolumeUnit: "cubic in",
    },
    {
      packageVolume: 447.37,
      countPerPackage: 1,
      packageVolumeUnit: "cubic in",
    },
  ],
  value: [
    { packagePrice: 3.28, countPerPackage: 3 },
    { packagePrice: 10.99, countPerPackage: 1 },
  ],
  needsMet: { items: 12, months: 1, people: 1 },
  ...overrides,
});
