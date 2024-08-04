import "dotenv/config";
import csvToJson from "csvtojson";

import addCategories from "./add-categories";
import addItems from "./add-items";

/* How to run this script:
     1. Setup your scripts `.env` file (copy / modify `.env.example`)
     2. Export the Product Info sheet to a .csv and put it in the
        `src/scripts/upload-product-info-sheet/` directory.
     3. Delete the first 3 lines (headers).
     4. Run the script from the project root directory:
        `yarn script:import-product-info-sheet`
*/

const products = await csvToJson({
  noheader: true,
  headers: [
    "category.name",
    "name",
    "age_gender",
    "size_style",

    "value.0.packagePriceUnit",
    "value.0.packagePrice",
    "value.0.countPerPackage",
    "value.0.pricePerItemUSD",
    "value.0.source",
    "value.0.logDate",
    "value.0.notes",

    "secondHand.priceAdjustment",

    "weight.0.packageWeight",
    "weight.0.packageWeightUnit",
    "weight.0.countPerPackage",
    "weight.0.itemWeightKg",
    "weight.0.countPerKg",
    "weight.0.source",
    "weight.0.logDate",
    "weight.0.notes",

    "volume.0.packageVolume",
    "volume.0.packageVolumeUnit",
    "volume.0.countPerPackage",
    "volume.0.itemVolumeCBCM",
    "volume.0.countPerCBM",
    "volume.0.source",
    "volume.0.logDate",
    "volume.0.notes",

    "needsMet.items",
    "needsMet.people",
    "needsMet.months",
    "needsMet.monthlyNeedsMetPerItem",
    "needsMet.type",
    "needsMet.notes",

    "packSize",
    "uuid",
  ],
}).fromFile("src/scripts/import-product-info-sheet/products.csv");

await addCategories(products);
await addItems(products);
