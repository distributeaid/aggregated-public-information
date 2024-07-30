import Strapi, { LoadedStrapi } from "@strapi/strapi";
import type { Database } from "@strapi/database";
import * as path from "path";
import * as fs from "fs";

let instance: LoadedStrapi;

export const setupStrapi = async () => {
  if (!instance) {
    await Strapi({ distDir: path.resolve("./dist") }).load();
    instance = strapi;

    instance.server.mount();
  }
  return instance;
};

export const cleanupStrapi = async () => {
  const dbSettings = strapi.config.get<Database>("database.connection");

  //close server to release the db-file
  strapi.server.httpServer.close();

  // close the connection to the database before deletion
  await strapi.db.connection.destroy();

  //delete test database after all tests have completed
  if (
    dbSettings &&
    dbSettings.connection &&
    "filename" in dbSettings.connection &&
    dbSettings.connection.filename
  ) {
    const tmpDbFile = dbSettings.connection.filename as string;
    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
};
