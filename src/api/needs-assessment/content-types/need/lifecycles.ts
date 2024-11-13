import { errors } from "@strapi/utils";
export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    const region = data.region?.connect?.[0]?.id ?? null;
    const subregion = data.subregion?.connect?.[0]?.id ?? null;
    const item = data.item?.connect[0]?.id ?? null;
    const survey = data.survey?.connect[0]?.id ?? null;
    const need = data.need;

    const existingNeeds = await strapi
      .documents("api::needs-assessment.need")
      .findMany({
        filters: {
          region,
          subregion,
          survey,
          need,
          item,
        },
      });

    if (existingNeeds.length > 0) {
      throw new errors.ApplicationError("Duplicate `need` entry found!");
    }
  },
};
