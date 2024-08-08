import { Core, createStrapi } from "@strapi/strapi";
import fs from "fs";

let instance: Core.Strapi;

export const setupStrapi = async () => {
  if (!instance) {
    await createStrapi({ distDir: "dist" }).load();
    instance = strapi;

    instance.server.mount();
    instance.server.listen();
  }
  return instance;
};

export const cleanupStrapi = async () => {
  const dbSettings = strapi.config.get<
    { connection?: { filename?: string } } | undefined
  >("database.connection");

  // close server to release the db-file
  strapi.server.httpServer.close();

  // close the connection to the database before deletion
  await strapi.db.connection.destroy();

  // delete test database after all tests have completed
  if (dbSettings?.connection?.filename) {
    const tmpDbFile = dbSettings.connection.filename;
    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
};
