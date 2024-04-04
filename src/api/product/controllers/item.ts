/**
 * item controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.item",
  ({ strapi }) => ({
    async find(ctx) {
      strapi.log.info(`API FIND: ${JSON.stringify(ctx.request)}`);
      const result = await super.find(ctx);
      return result;
    },

    async findOne(ctx) {
      strapi.log.info(`API FINDONE: ${JSON.stringify(ctx.request)}`);
      const result = await super.findOne(ctx);
      return result;
    },

    async create(ctx) {
      strapi.log.info(`API CREATE: ${JSON.stringify(ctx.request.body)}`);
      const result = await super.create(ctx);
      return result;
    },

    async update(ctx) {
      strapi.log.info(`API UPDATE: ${JSON.stringify(ctx.request.body)}`);
      const result = await super.update(ctx);
      return result;
    },
  })
);
