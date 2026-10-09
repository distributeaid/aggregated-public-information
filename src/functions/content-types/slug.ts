import slugify from "@sindresorhus/slugify";
import type { Core } from "@strapi/strapi";

const slugSourceFields: Record<string, string> = {
  "api::geo.country": "code",
  "api::geo.region": "name",
  "api::geo.subregion": "name",
  "api::response.overview": "name",
};

/** Generates missing slugs for content types that use native UID fields. */
export const registerSlugMiddleware = (strapi: Core.Strapi): void => {
  strapi.documents.use(async (context, next) => {
    const sourceField = slugSourceFields[context.uid];

    if (
      !sourceField ||
      (context.action !== "create" && context.action !== "update")
    ) {
      return next();
    }

    const data = context.params.data;
    const sourceValue = data[sourceField];
    const currentSlug = "slug" in data ? data.slug : undefined;

    if (!currentSlug && typeof sourceValue === "string") {
      Object.assign(data, { slug: slugify(sourceValue) });
    }

    return next();
  });
};
