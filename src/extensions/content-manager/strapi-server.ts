module.exports = (plugin) => {
  let originalCreate = plugin.controllers["collection-types"].create;
  plugin.controllers["collection-types"].create = (ctx) => {
    if (isProductItem(ctx)) {
      for (let i = 0; i < ctx.request.body.weight.length; i++) {
        ctx.request.body.weight[i] = calculateWeightFields(
          ctx.request.body.weight[i]
        );
      }

      for (let i = 0; i < ctx.request.body.volume.length; i++) {
        ctx.request.body.volume[i] = calculateVolumeFields(
          ctx.request.body.volume[i]
        );
      }
    }

    return originalCreate(ctx);
  };

  let originalUpdate = plugin.controllers["collection-types"].update;
  plugin.controllers["collection-types"].update = (ctx) => {
    if (isProductItem(ctx)) {
      for (let i = 0; i < ctx.request.body.weight.length; i++) {
        ctx.request.body.weight[i] = calculateWeightFields(
          ctx.request.body.weight[i]
        );
      }

      for (let i = 0; i < ctx.request.body.volume.length; i++) {
        ctx.request.body.volume[i] = calculateVolumeFields(
          ctx.request.body.volume[i]
        );
      }
    }

    return originalUpdate(ctx);
  };

  return plugin;
};

function isProductItem(ctx) {
  return ctx.request.path.includes("api::product.item");
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
