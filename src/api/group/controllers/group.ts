/**
 * A set of functions called "actions" for `group`
 */

import { factories } from "@strapi/strapi";
import { processGroup } from "../../../functions/content-types/group/group";

export default factories.createCoreController(
  "api::group.group",

  ({ strapi: _strapi }) => ({
    async create(ctx) {
      ctx.request.body.data = processGroup(ctx.request.body.data);

      const result = await super.create(ctx);
      return result;
    },

    async update(ctx) {
      ctx.request.body.data = processGroup(ctx.request.body.data);

      const result = await super.update(ctx);
      return result;
    },
  }),
);
