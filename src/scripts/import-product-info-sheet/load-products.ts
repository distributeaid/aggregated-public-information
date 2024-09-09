import csvToJson from "csvtojson";
import fs from "fs";

const productsHeaders = [
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
];

function productsPath() {
    // if the products file path is empty, remind the user to add the products file.
    if (process.env.PRODUCTS_EXPORT_PATH) {
        console.log("Loading products from: ", process.env.PRODUCTS_EXPORT_PATH);
        // Check if the file exists
        if (!fs.existsSync(process.env.PRODUCTS_EXPORT_PATH)) {
        console.error("Error: Products file not found. Please export the products file to the correct location.");
        process.exit(1);
        }
    }
  else {
    console.log("No products file specified. Loading demo data instead.");
  }
  return process.env.PRODUCTS_EXPORT_PATH || process.env.PRODUCTS_DEMO_PATH;
}

export default async function loadProducts() {
    return csvToJson({
      noheader: true,
      headers: productsHeaders,
    }).fromFile(productsPath());
}