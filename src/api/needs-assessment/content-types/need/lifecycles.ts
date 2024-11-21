import { errors } from "@strapi/utils";

const messagePrefix = "Cannot create needs-assessment.needs entry";

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    //NOTE: event.params.data appears to be using the original numeric id's for the related data, not the new documentId strings that Strapi recommends using in v5. So need to use findFirst() with filters instead of findOne() for the lookup. If Strapi fixes this, do we want to update to use the documentId's?
    const regionId = data.region?.connect?.[0]?.id;
    const itemId = data.item?.connect[0]?.id;
    const surveyId = data.survey?.connect[0]?.id;
    const subregionId = data.subregion?.connect?.[0]?.id ?? null;

    const missingFields = [];
    if (!surveyId) {
      missingFields.push("survey");
    }

    if (!regionId) {
      missingFields.push("region");
    }

    if (!itemId) {
      missingFields.push("item");
    }

    if (missingFields.length > 0) {
      throw new errors.ApplicationError(
        `${messagePrefix}. The following required fields are missing: ${missingFields.join(", ")}`,
      );
    }

    await checkForDuplicates(surveyId, regionId, itemId, subregionId);
  },
};

async function checkForDuplicates(surveyId, regionId, itemId, subregionId) {
  const filters = {
    region: regionId,
    survey: surveyId,
    item: itemId,
    subregion: subregionId ? subregionId : null,
  };

  const existingNeeds = await strapi
    .documents("api::needs-assessment.need")
    .findFirst({
      populate: ["survey", "region", "item", "subregion"],
      filters,
    });

  if (existingNeeds) {
    throw new errors.ApplicationError(
      `${messagePrefix}. An entry with this survey, region, subregion and item already exists!`,
    );
  }
}
