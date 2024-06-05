/**
 * item controller
 */

import { factories } from "@strapi/strapi";
import { processContentType } from "../../../functions/content-types";

export default factories.createCoreController(
  "api::product.item",
  ({ strapi }) => ({
    async create(ctx) {
      strapi.log.info(
        `API CREATE BEFORE ${JSON.stringify(ctx.request.body.data)}`
      );
      ctx.request.body.data = processContentType(
        ctx.request.path,
        ctx.request.body.data
      );
      strapi.log.info(
        `API CREATE AFTER ${JSON.stringify(ctx.request.body.data)}`
      );
      const result = await super.create(ctx);
      return result;
    },

    async update(ctx) {
      strapi.log.info(`API UPDATE: ${JSON.stringify(ctx.request.body)}`);
      ctx.request.body.data = processContentType(
        ctx.request.path,
        ctx.request.body.data
      );
      const result = await super.update(ctx);
      return result;
    },
  })
);
