/**
 * cargo controller
 */

import { factories } from '@strapi/strapi'
import { processContentType } from "../../../functions/content-types";

export default factories.createCoreController(
    'api::reporting.cargo',

    ({ strapi }) => ({
        async create(ctx) {
          ctx.request.body.data = processContentType(
            ctx.request.path,
            ctx.request.body.data
          );
    
          const result = await super.create(ctx);
          return result;
        },
    
        async update(ctx) {
          ctx.request.body.data = processContentType(
            ctx.request.path,
            ctx.request.body.data
          );
    
          const result = await super.update(ctx);
          return result;
        },
      })
);