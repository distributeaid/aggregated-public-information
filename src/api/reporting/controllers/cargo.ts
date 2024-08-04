/**
 *  controller
 */

import { factories } from "@strapi/strapi";
import { processReportingCargo } from "../../../functions/content-types/reporting/cargo";

export default factories.createCoreController(
  "api::reporting.cargo",
  ({ strapi: _strapi }) => ({
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
  }),
);
