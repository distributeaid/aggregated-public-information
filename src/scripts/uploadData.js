import 'dotenv/config'
import fetch from 'node-fetch'
import { readFileSync } from 'fs'

const strapiURL = `${process.env.STRAPI_URL}/api/categories`;
const apiKey = process.env.STRAPI_API_KEY;

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
const uniqueCategories = Array.from(new Set(categories))

async function sendDataToStrapi(uniqueCategories) {
    for (let categoryName of uniqueCategories) {
        try {
            // Check if category exists
            let response = await fetch(`${strapiURL}?name=${encodeURIComponent(categoryName)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${apiKey}`
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const existingCategory = await response.json();

            // If no categories are found with the given name, proceed to create it
            if (existingCategory.length ===0) {
                // create the category if it does not exist
                response = await fetch(`${strapiURL}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        name: categoryName,
                    }),
                });

                if (!response.ok) {
                    throw new Error (`HTTP error! status: ${response.status}`);
                }

                console.log(`Category "${categoryName}" successfully created.`);
            } else {
                console.log(`Category "${categoryName}" already exists, skipping creation.`);
            }
        } catch (error) {
            console.log(`Failed to process category "${categoryName}" : ${error.message}`);
        }
    }
}

sendDataToStrapi(uniqueCategories);

// Extracting surveys and grouping them by year, and quarter
// ------------------------------------------------------------
const groupedSurveys = data.reduce((acc, need) => {
    const key = `${need.survey.year}-${need.survey.quarter}`;
    if (!acc[key]) {
        acc[key] = need.survey;
    }
    return acc;
}, {}); 

// Extract unique surveys
const uniqueSurveys = Object.values(groupedSurveys).map(survey => ({
    year: survey.year,
    quarter: survey.quarter
}));
