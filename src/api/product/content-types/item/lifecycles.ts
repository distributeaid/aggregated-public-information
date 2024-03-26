export default {
  async afterCreate(event) {
    const { data } = event.params;
    // strapi.log.info(`data: ${JSON.stringify(event)}`)
    strapi.log.info(`data: ${JSON.stringify(data)}`);

    const weightID = data.weight.id;

    // strapi.log.info(`weightID: ${weightID}`);

    // const entry = await strapi.db.query('api::product.product-weight').findOne({
    //   select: ['packageWeight', 'countPerPackage'],
    //   where: { id: weightID }
    // });

    // strapi.log.info(`entry: ${JSON.stringify(entry)}`);

    const entry = await strapi.entityService.findOne('api::product.item', data.id, {
      populate: `*`
    });

    strapi.log.info(`entry: ${JSON.stringify(entry)}`);

    // const weight = data.weight.packageWeight;
    // const numItems = data.weight.countPerPackage;
    // const itemWtKg = weight / numItems;

    // event.params.data.weight.itemWeightKg = itemWtKg;
    // strapi.log.info(`data: ${JSON.stringify(data)}`);
    // strapi.log.info(`weight: ${weight}`);
    // strapi.log.info(`numItems: ${numItems}`);
    // strapi.log.info(`itemWtKg: ${itemWtKg}`);
  },
};
