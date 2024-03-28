import database from "../../../../../config/database";

export default {
  async afterCreate(event) {
    strapi.log.info(`AFTER CREATE`);
    strapi.log.info(`result: ${JSON.stringify(event.result)}`);

    calculateFieldValues(event);
  },

  async afterUpdate(event) {
    strapi.log.info(`AFTER UPDATE`);
    strapi.log.info(`result: ${JSON.stringify(event.result)}`);

    if (event.result.weight) {
      calculateFieldValues(event);
    }
  },
};

function calculateFieldValues(event) {
  const { result } = event;

  const recordId = result.id;
  const { id, packageWeight, countPerPackage } = result.weight;

  // Note: if packageWeightUnit is not set to kg, then we will need to do some conversion for these to be accurate.
  const itemWeightKg = packageWeight / countPerPackage;
  const countPerKg = countPerPackage / itemWeightKg;

  strapi.log.info(`packageWeight: ${packageWeight}`);
  strapi.log.info(`countPerPackage: ${countPerPackage}`);
  strapi.log.info(`itemWeightKg: ${itemWeightKg}`);
  strapi.entityService.update("api::product.item", recordId, {
    data: {
      weight: {
        ...result.weight,
        id,
        itemWeightKg,
        countPerKg,
      },
    },
  });
}
