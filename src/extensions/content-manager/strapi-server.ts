module.exports = (plugin) => {
  let originalFind = plugin.controllers["collection-types"].find;
  plugin.controllers["collection-types"].find = (ctx) => {
    // strapi.log.info(`FIND ${JSON.stringify(ctx)}`);

    return originalFind(ctx);
  };

  let originalFindOne = plugin.controllers["collection-types"].findOne;
  plugin.controllers["collection-types"].findOne = (ctx) => {
    // strapi.log.info(`FINDONE ${JSON.stringify(ctx)}`);

    return originalFindOne(ctx);
  };

  let originalCreate = plugin.controllers["collection-types"].create;
  plugin.controllers["collection-types"].create = (ctx) => {
    strapi.log.info(`CREATE CTX BODY ${JSON.stringify(ctx.request.body)}`);
    const { packageWeight, countPerPackage } = ctx.request.body.weight;
    const itemWeightKg = packageWeight / countPerPackage;
    ctx.request.body.weight.itemWeightKg = itemWeightKg;

    return originalCreate(ctx);
  };

  let originalUpdate = plugin.controllers["collection-types"].update;
  plugin.controllers["collection-types"].update = (ctx) => {
    strapi.log.info(`UPDATE CTX BODY ${JSON.stringify(ctx.request.body)}`);
    const { packageWeight, countPerPackage } = ctx.request.body.weight;
    const itemWeightKg = packageWeight / countPerPackage;
    ctx.request.body.weight.itemWeightKg = itemWeightKg;
    strapi.log.info(`NEW CTX BODY ${JSON.stringify(ctx.request.body)}`);

    return originalUpdate(ctx);
  };

  return plugin;
};

// function calculateWeightValues(weightData) {
//   const { packageWeight, countPerPackage } = ctx.request.body.weight;
//   const itemWeightKg = packageWeight / countPerPackage;
//   ctx.request.body.weight.itemWeightKg = itemWeightKg;
//   strapi.log.info(`NEW CTX BODY ${JSON.stringify(ctx.request.body)}`);
// }
