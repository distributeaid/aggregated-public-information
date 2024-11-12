import { Core } from "@strapi/strapi";
import { errors } from "@strapi/utils";

export default async function registerDbLifecycleHooks(strapi: Core.Strapi) {
  strapi.db.lifecycles.subscribe({
    async beforeCreate(event) {
      if (event.model.tableName === "needs") {
        console.log("beforeCreate index");
        // console.log(JSON.stringify(event.model, undefined, 2));
        // console.log(JSON.stringify(event.params, undefined, 2));
        const { data } = event.params;
        const trx = await strapi.db.connection.transaction();
        const preexistingNeed = await trx
          .select("id")
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
              .whereIn(
                "needs_item_lnk.item_id",
                data.item.connect.map(({ id }) => id),
              )
              .whereIn(
                "needs_region_lnk.region_id",
                data.region.connect.map(({ id }) => id),
              )
              .whereIn(
                "needs_subregion_lnk.subregion_id",
                data.subregion.connect.map(({ id }) => id),
              )
              .whereIn(
                "needs_survey_lnk.survey_id",
                data.survey.connect.map(({ id }) => id),
              )
              .andWhere("needs.need", data.need);
          })
          .first();
        console.log(`preexistingNeed: ${JSON.stringify(preexistingNeed)}`);
        if (preexistingNeed || preexistingNeed !== undefined) {
          throw new errors.ApplicationError("Duplicate Need");
        }
      }
    },
  });
  console.log("registered lifecycle hooks");
}
