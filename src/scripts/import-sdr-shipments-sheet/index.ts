import "dotenv/config";
import csvToJson from "csvtojson";

import { addCountries } from "./add-countries";
import { addShipments } from "./add-shipments";
import { loadShipments } from "./load-shipments";

/* How to run this script:
     1. Setup your scripts `.env` file (copy / modify `.env.example`)
     2. Export the SDR Shipments sheet to a .csv and save it as
        `src/scripts/import-sdr-shipments-sheet/shipments.csv`.
     3. Delete the first 1 lines (headers).
     4. Run the script from the project root directory:
        `yarn script:import-sdr-shipments-sheet`
*/

function configureEnvironment() {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  process.env.VERBOSE = args.includes("-v") ? "true" : "";

  // If the environmental variables aren't set, remind the user where to set them.
  if (!process.env.STRAPI_URL || !process.env.STRAPI_API_KEY) {
    console.error(
      "Please set STRAPI_URL and STRAPI_API_KEY in the .env file in the scripts directory.",
    );
    process.exit(1);
  }
}

(async () => {
  configureEnvironment();
  const shipmentData = await loadShipments();
  const countries = await addCountries(shipmentData);
  await addShipments(shipmentData, countries);
})();