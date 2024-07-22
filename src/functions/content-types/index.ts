import { processProductItem } from "./product/item";
import { processGroup } from "./group/group";
import { processCargo } from "./reporting/cargo";


export function processContentType(path, data) {
  /*
   Content-manager paths look like this:
    http://host/admin/content-manager/collection-types/api::product.item/15
  */
  const contentTypeHandlers = {
    "product.item": processProductItem,
    "group.group": processGroup, 
    "geo.country": (data) => data,
    "reporting.shipment": (data) => data,
    "reporting.cargo": processCargo,
    "reporting.movement": (data) => data,
    "product.category": (data) => data,
  };

  const contentType = detectContentType(path);

  const handler = contentTypeHandlers[contentType];
  if (handler) {
    console.log(`Processing content type: ${contentType}`);
    return handler(data);
  } else {
    return data;
  }
}

function detectContentType(path: string): string {
  if (path.includes("content-manager/collection-types/api::")) {
    return path.split("api::")[1].split("/")[0];
  }

  if (path.includes("/api/")) {
    return path.split("/api/")[1].split("/")[0];
  }

  console.log('Unable to detect content type from path:', path);
  return '';
}