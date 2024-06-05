import { processProductItem } from "./product/item";

export function processContentType(path, data) {
  /*
   Content-manager paths look like this:
    http://host/admin/content-manager/collection-types/api::product.item/15

   API paths look like this (note the use of the plural version here!)
    http://host/api/items/15 )

   So need to map both options to the appropriate handler
  */
  const contentTypeHandlers = {
    "product.item": processProductItem,
    items: processProductItem,
    "product.category": null,
    categories: null,
    "geo.country": null,
    countries: null,
  };

  const contentType = detectContentType(path);
  strapi.log.info(`DETECTED CONTENT TYPE ${contentType}`);

  const handler = contentTypeHandlers[contentType];
  if (handler) {
    return handler(data);
  }
}

function detectContentType(path) {
  if (path.includes("content-manager/collection-types/api::")) {
    return path.split("api::")[1].split("/")[0];
  }

  if (path.includes("/api/")) {
    return path.split("/api/")[1].split("/")[0];
  }
}
