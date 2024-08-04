/**
 *  controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::reporting.cargo",
  () => ({
    async create(ctx) {
      // @ts-expect-error It thinks ctx.request.body doesn't exist
      ctx.request.body.data = processReportingCargo(ctx.request.body.data);

      const result = await super.create(ctx);
      return result;
    },

    async update(ctx) {
      // @ts-expect-error It thinks ctx.request.body doesn't exist
      ctx.request.body.data = processReportingCargo(ctx.request.body.data);

      const result = await super.update(ctx);
      return result;
    },
  })
);
