import 'dotenv/config'
import fetch from 'node-fetch'
import { readFileSync } from 'fs'

// const strapiURL = 'https://1337-distributea-aggregatedp-hvms4i4hj5d.ws-us114.gitpod.io/needs';
// const apiKey = process.env.STRAPI_API_KEY;  -----Need to get an API_Key from Strapi----

const jsonData = readFileSync("./needs-data.json", 'utf8');
const data = JSON.parse(jsonData);

// Extracting places
const places = data.map((need) => {
    return need.place
})

// Create regions
// ------------------------------------
const regions = places.map((place) => {
    return place.region
})

const uniqueRegions = Array.from(new Set(regions))





// Create subregions
// ------------------------------------
const subregions = places.map((place) => {
    return place.subregion
})

const uniqueSubregions = Array.from(new Set(subregions))



// Extracting products along with their categories
// -------------------------------------
const productsWithCategories = data.map((need) => {
    return {
        product: need.product,
        category: need.product.category
    };
});

// Extracting categories from the products
const categories = productsWithCategories.map(product => product.category)
console.log(categories);
