/**
 *  controller
 */

import { factories } from "@strapi/strapi";
import { processSurvey } from "../../../functions/content-types/needs-assessment/survey";

export default factories.createCoreController(
  "api::needs-assessment.survey",
  ({ strapi: _strapi }) => ({
    async create(ctx) {
      ctx.request.body.data = processSurvey(ctx.request.body.data);
      return super.create(ctx);
    },
    async update(ctx) {
      ctx.request.body.data = processSurvey(ctx.request.body.data);
      return super.create(ctx);
    },
  }),
);
