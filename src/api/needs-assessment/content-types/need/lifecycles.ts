import { errors } from "@strapi/utils";
export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    // confirm each field is a valid entry of the correct content type
    const regionId = data.region?.connect?.[0]?.id;
    console.log(`regionId: ${regionId}`);
    // look up the region associated with this id.
    const region = await strapi
      .documents("api::geo.region")
      .findMany({ id: regionId });

    console.log(`region: ${JSON.stringify(region)}`);

    const subregionId = data.subregion?.connect?.[0]?.id ?? null;
    const itemId = data.item?.connect[0]?.id ?? null;
    const surveyId = data.survey?.connect[0]?.id ?? null;
    const need = data.need;

    const existingNeeds = await strapi
      .documents("api::needs-assessment.need")
      .findMany({
        filters: {
          region: regionId,
          subregion: subregionId,
          survey: surveyId,
          item: itemId,
        },
      });
    if (existingNeeds.length > 0) {
      throw new errors.ApplicationError("Duplicate `need` entry found!");
    }
  },
};
