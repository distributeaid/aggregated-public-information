/**
 *  controller
 */

import { factories } from "@strapi/strapi";
import { processProductItem } from "../../../functions/content-types/product/item";

export default factories.createCoreController(
  "api::product.item",
  ({ strapi: _strapi }) => ({
    async create(ctx) {
      ctx.request.body.data = processProductItem(ctx.request.body.data);

      const result = await super.create(ctx);
      return result;
    },

    async update(ctx) {
      ctx.request.body.data = processProductItem(ctx.request.body.data);

      const result = await super.update(ctx);
      return result;
    },
  }),
);
