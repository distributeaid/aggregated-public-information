import 'dotenv/config'
import csvToJson from "csvtojson";

import addCategories from "./add-categories"

/* How to run this script:
     1. Export the Product Info sheet to a .csv and put it in the
        `src/scripts/upload-product-info-sheet/` directory.
     2. Delete the 1st line and the 4th line (extra headers).
        Delete the newline between the 2nd & 3rd line (idk why Google Sheets adds this).
     3. Run `export STRAPI_URL=$(gp url 1337)` in your terminal.
     4. Set the Strapi port to public in GitPod.
     5. Go into the scripts directory: `cd src/scripts/`
     6. Run the script: `npx esrun upload-product-info-sheet/index.ts`
*/

const strapi = {
  url: `${process.env.STRAPI_URL}/api`,
  key: process.env.STRAPI_API_KEY
}

const products = await csvToJson().fromFile("upload-product-info-sheet/products.csv")
const errors = await addCategories(strapi, products)

console.log("ERRORS")
console.log(errors)
