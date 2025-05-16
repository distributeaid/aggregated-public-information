import csvToJson from "csvtojson";
import fs from "fs";

const shipmentDataHeaders = [
  "number",
  "sendingCountry",
  "receivingCountry",
  "exporter",
  "importer",
  "type",
  "project",
  "daRoles.needsAssessment",
  "daRoles.sourcingInKindDonations",
  "daRoles.sourcingProcurement",
  "daRoles.sourcingCommunityCollection",
  "daRoles.aidMatching",
  "daRoles.firstMileTransportation",
  "daRoles.firstMileStorageCommunity",
  "daRoles.firstMileStorageCommercial",
  "daRoles.mainLegTransportation",
  "daRoles.customsTransit",
  "daRoles.customsExport",
  "daRoles.customsImport",
  "daRoles.lastMileTransportation",
  "daRoles.lastMileStorageCommunity",
  "daRoles.lastMileStorageCommercial",
  "daRoles.other",
  "carbonOffsetPaid",
  "co2TonsGenerated",
  "carbonOffsetCost",
];

function shipmentDataPath() {
  if (process.env.SHIPMENTS_EXPORT_PATH) {
    console.log(
      "Loading shipment data from: ",
      process.env.SHIPMENTS_EXPORT_PATH,
    );

    if (!fs.existsSync(process.env.SHIPMENTS_EXPORT_PATH)) {
      console.error(
        "Shipment data file not found, please export the file to the correct location.",
      );
      process.exit(1);
    }
  } else {
    console.log("No products file specified. Loading demo data instead.");
  }
  return process.env.SHIPMENTS_EXPORT_PATH || process.env.SHIPMENTS_DEMO_PATH;
}

export async function loadShipments() {
  return csvToJson({
    noheader: true,
    headers: shipmentDataHeaders,
  }).fromFile(shipmentDataPath());
}
