export default {
  async beforeCreate(event) {
    const { data } = event.params;
    const weight = data.weight.packageWeight;
    const numItems = data.weight.countPerPackage;
    const itemWtKg = weight / numItems;

    event.params.data.weight.itemWeightKg = itemWtKg;
    strapi.log.info(`data: ${JSON.stringify(data)}`);
    strapi.log.info(`weight: ${weight}`);
    strapi.log.info(`numItems: ${numItems}`);
    strapi.log.info(`itemWtKg: ${itemWtKg}`);
  },
};
