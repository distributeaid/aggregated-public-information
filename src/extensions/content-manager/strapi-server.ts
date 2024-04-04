module.exports = (plugin) => {
  let originalFind = plugin.controllers["collection-types"].find;
  plugin.controllers["collection-types"].find = (ctx) => {
    strapi.log.info(`ADMIN PANEL FIND ${JSON.stringify(ctx.request)}`);
    return originalFind(ctx);
  };

  let originalFindOne = plugin.controllers["collection-types"].findOne;
  plugin.controllers["collection-types"].findOne = (ctx) => {
    strapi.log.info(`ADMIN PANEL FINEONE ${JSON.stringify(ctx.request.body)}`);

    return originalFindOne(ctx);
  };

  let originalCreate = plugin.controllers["collection-types"].create;
  plugin.controllers["collection-types"].create = (ctx) => {
    strapi.log.info(`ADMIN PANEL CREATE ${JSON.stringify(ctx.request.body)}`);

    if (ctx.request.body.weight) {
      ctx.request.body.weight = calculateWeightFields(ctx.request.body.weight);
    }

    return originalCreate(ctx);
  };

  let originalUpdate = plugin.controllers["collection-types"].update;
  plugin.controllers["collection-types"].update = (ctx) => {
    strapi.log.info(`ADMIN PANEL UPDATE ${JSON.stringify(ctx.request.body)}`);

    ctx.request.body.weight = calculateWeightFields(ctx.request.body.weight);

    return originalUpdate(ctx);
  };

  return plugin;
};

function calculateWeightFields(weightData) {
  const { packageWeight, countPerPackage } = weightData;
  const itemWeightKg = packageWeight / countPerPackage;
  const countPerKg = countPerPackage / itemWeightKg;

  return { ...weightData, itemWeightKg, countPerKg };
}
