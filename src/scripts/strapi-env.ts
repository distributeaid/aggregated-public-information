import "dotenv/config";

export const STRAPI_ENV = {
  URL: `${process.env.STRAPI_URL}/api`,
  KEY: process.env.STRAPI_API_KEY,
};
