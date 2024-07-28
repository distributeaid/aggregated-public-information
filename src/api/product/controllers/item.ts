/**
 * item controller
 */

import { factories } from "@strapi/strapi";
import { processProductItem } from "../../../functions/content-types/product/item";

export default factories.createCoreController(
  "api::product.item",

  () => ({
    async create(ctx) {
      // @ts-expect-error 2339
      ctx.request.body.data = processProductItem(ctx.request.body.data);

      const result = await super.create(ctx);
      return result;
    },

    async update(ctx) {
      // @ts-expect-error 2339
      ctx.request.body.data = processProductItem(ctx.request.body.data);

      const result = await super.update(ctx);
      return result;
    },
  }),
);
