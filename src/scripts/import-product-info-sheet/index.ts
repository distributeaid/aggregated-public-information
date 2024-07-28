import 'dotenv/config'



import csvToJson from "csvtojson";

import addCategories from "./add-categories"

/* How to run this script:
     1. Setup your scripts `.env` file (copy / modify `.env.example`)
     2. Export the Product Info sheet to a .csv and put it in the
        `src/scripts/upload-product-info-sheet/` directory.
     3. Delete the 1st line and the 4th line (extra headers).
        Delete the newline between the 2nd & 3rd line (idk why Google Sheets adds this).
     4. Go into the scripts directory: `cd src/scripts/`
     5. Run the script: `npx esrun upload-product-info-sheet/index.ts`
*/

const products = await csvToJson().fromFile("src/scripts/import-product-info-sheet/products.csv")
await addCategories(products)
