import type { Core } from "@strapi/strapi";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // const allPermissions = await strapi
    //   .query("plugin::users-permissions.permission")
    //   .findMany({
    //     populate: true,
    //     limit: 10,
    //     where: { role: { type: "public" } },
    //   });

    // strapi.log.info(`allPermissions: ${JSON.stringify(allPermissions)}`);

    async function createPublicPermissions() {
      const newPermissions = {
        geo: {
          country: ["find", "findOne", "create", "update", "delete"],
          region: ["find", "findOne", "create", "update", "delete"],
          subregion: ["find", "findOne", "create", "update", "delete"],
        },
        product: {
          category: ["find", "findOne", "create", "update", "delete"],
          item: ["find", "findOne", "create", "update", "delete"],
        },
      };

      // get the public role id
      const publicRole = await strapi
        .query("plugin::users-permissions.role")
        .findOne({
          where: { type: "public" },
        });

      // set the permissions
      const promises = [];
      Object.keys(newPermissions).map((group) => {
        Object.keys(newPermissions[group]).map((endpoint) => {
          const actions = newPermissions[group][endpoint];

          const permissionsToCreate = actions.map((action) => {
            strapi.log.info(
              `creating public role for '${group}.${endpoint}.${action}'`,
            );

            return strapi.query("plugin::users-permissions.permission").create({
              data: {
                action: `api::${group}.${endpoint}.${action}`,
                role: publicRole.id,
              },
            });
          });

          promises.push(permissionsToCreate);
        });
        Promise.all(promises);
      });
    }

    await createPublicPermissions();
  },
};
