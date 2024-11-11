import { Core } from "@strapi/strapi";
import { errors } from "@strapi/utils";

export default function registerDbLifecycleHooks(strapi: Core.Strapi) {
  strapi.db.lifecycles.subscribe({
    models: ["need"],
    async beforeCreate(event) {
      const { data } = event.params;
      const preexistingNeed = await strapi.db.connection
        .from("needs")
        .join("needs_item_lnk", "needs.id", "=", "needs_item_lnk.need_id")
        .join("needs_region_lnk", "needs.id", "=", "needs_region_lnk.need_id")
        .join(
          "needs_subregion_lnk",
          "needs.id",
          "=",
          "needs_subregion_lnk.need_id",
        )
        .join("needs_survey_lnk", "needs.id", "=", "needs_survey_lnk.need_id")
        .where((builder) => {
          builder
            .where("needs_item_lnk.item_id", data.item_id)
            .andWhere("needs_region_lnk.region_id", data.region_id)
            .andWhere("needs_subregion_lnk.subregion_id", data.subregion_id)
            .andWhere("needs_survey_lnk.survey_id", data.survey_id)
            .andWhere("needs.need", data.need);
        })
        .first("needs.id");
      if (preexistingNeed || preexistingNeed !== undefined) {
        throw new errors.ApplicationError("Duplicate Need");
      }
    },
  });
}
