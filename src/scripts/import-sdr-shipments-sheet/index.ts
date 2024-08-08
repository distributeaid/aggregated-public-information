import "dotenv/config";
import csvToJson from "csvtojson";

import { addCountries } from "./add-countries"

/* How to run this script:
     1. Setup your scripts `.env` file (copy / modify `.env.example`)
     2. Export the SDR Shipments sheet to a .csv and save it as
        `src/scripts/import-sdr-shipments-sheet/shipments.csv`.
     3. Delete the first 1 lines (headers).
     4. Run the script from the project root directory:
        `yarn script:import-sdr-shipments-sheet`
*/

const shipments = await csvToJson({
  noheader: true,
  headers: [
    "number",
    "sendingCountry",
    "receivingCountry",
    "carrierId",
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
    "carbonOffsetPaid",
    "co2TonsGenerated",
    "carbonOffsetCost"
  ],
}).fromFile("src/scripts/import-sdr-shipments-sheet/shipments.csv");

await addCountries(shipments);
// await addShipments(shipments);

