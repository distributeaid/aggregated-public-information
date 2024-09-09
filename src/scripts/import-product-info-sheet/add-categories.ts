import { toTitleCase } from "../helpers";
import { STRAPI_ENV } from "../strapi-env";
import { getCategories } from "./get-existing-data";

/* Categories
 * ========================================================================= */

/* Add Categories
 * ----------------------------------------------------- */
export default async function addCategories(products) {
  console.log("Adding categories from Product Info sheet...");

  const categories = await parseCategories(products);
  const existingCategories = await getCategories();
  const newCategories = diffCategories(
    categories,
    new Set(Object.keys(existingCategories)),
  );
  await uploadCategories(newCategories);

  console.log("Adding categories completed!");
}

/* Parse Categories
 * ----------------------------------------------------- */
function parseCategories(products): Set<string> {
  console.log("    - parsing categories");

  const categories = products.reduce((cats: Set<string>, product, line) => {
    if (product.category.name === "") {
      console.log(`    - skipping empty category on line ${line}`);
      if (process.env.VERBOSE) {
        console.log(`      ${JSON.stringify(product)}`);
      }
    } else {
      const category = toTitleCase(product.category.name);
      cats.add(category);
    }

    return cats;
  }, new Set<string>());

  return categories;
}

/* Diff Categories
 * ----------------------------------------------------- */
function diffCategories(
  categories: Set<string>,
  existingCategories: Set<string>,
) {
  const newCategories = [...categories].filter((category) => {
    if (existingCategories.has(category)) {
      console.log(`    - skipping "${category}" because it already exists`);
      return false;
    } else {
      return true;
    }
  });

  return newCategories;
}

/* Upload New Categories
 * ----------------------------------------------------- */
async function uploadCategories(categories) {
  console.log(`    - uploading new categories`);

  const responses = await Promise.all(
    categories.map(async (category) => {
      return fetch(`${STRAPI_ENV.URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_ENV.KEY}`,
        },
        body: JSON.stringify({ data: { name: category } }),
      });
    }),
  );

  type Results = {
    success: string[];
    error: string[];
  };

  const results = await responses.reduce(
    async (resultsPromise: Results, response: Response): Promise<Results> => {
      const results = await resultsPromise;
      if (response.ok) {
        const responseJson = await response.json();
        results.success.push(`    - created "${responseJson.data.name}"`);
      } else {
        // TODO: track which category gave the error
        //       the error responses don't include request info such as category name
        //       so this will likely require mapping requests to responses above
        //       annoying...
        results.error.push(`    - HTTP error! Status: ${response.status}`);
      }
      return results;
    },
    Promise.resolve({ success: [], error: [] }),
  );

  results.success.forEach((message) => {
    console.log(message);
  });

  results.error.forEach((message) => {
    console.error(message);
  });

  if (results.error.length > 0) {
    throw new Error(`uploadCategories had response errors`);
  }
}
