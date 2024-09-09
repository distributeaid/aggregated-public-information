import "dotenv/config";

import addCategories from "./add-categories";
import addItems from "./add-items";
import loadProducts from "./load-products";

/* How to run this script:
     1. Setup your scripts `.env` file (copy / modify `.env.example`)
        This is not the same as the .env file you set up to build strapi - there is a separate .env file for scripts.
        It's located in the scripts directory.
        `cp src/scripts/.env.example src/scripts/.env`
        Remeber to generate and add a Strapi API key to the .env file.
     2. Export the Product Info sheet to a .csv and put it in the
        `src/scripts/import-product-info-sheet/` directory.
        Save it with the name products.csv
     3. Delete the first 4 lines (headers).
     4. Run the script from the project root directory:
        `yarn script:import-product-info-sheet`
     5. To run in verbose mode, add -v
        To just load the demo data, set the PRODUCTS_EXPORT_PATH to an empty string in the .env file.

    // TODO: If the item already exists but with different data, that's an error (unlike if it already exists with identical data).
      Implement a deep comparison function to check for this.
    // TODO: Replace NAN with 0 in the product data? Or reject?
    // TODO: Vlear out the existing data with an existing command and a confirmation prompt.
    // Removing the whome temp data is annoying bc you need to make a new account and configure a new api key.
*/

function configureEnvironment() {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  process.env.VERBOSE = args.includes("-v") ? "true" : "";

  // If the environmental variables aren't set, remind the user where to set them.
  if (!process.env.STRAPI_URL || !process.env.STRAPI_API_KEY) {
    console.error("Please set STRAPI_URL and STRAPI_API_KEY in the .env file in the scripts directory.");
    process.exit(1);
  }
}


(async () => {
  configureEnvironment();
  const productData = await loadProducts();
  await addCategories(productData);
  await addItems(productData);
})();