import { Core } from "@strapi/strapi";

export async function createPublicApiPermissions(strapi: Core.Strapi) {
  const newPermissions = {
    financial: {
      "currency-conversion": ["find", "findOne", "create", "update", "delete"],
    },
    geo: {
      country: ["find", "findOne", "create", "update", "delete"],
      region: ["find", "findOne", "create", "update", "delete"],
      subregion: ["find", "findOne", "create", "update", "delete"],
    },
    group: {
      group: ["find", "findOne", "create", "update", "delete"],
    },
    "needs-assessment": {
      need: ["find", "findOne", "create", "update", "delete"],
      survey: ["find", "findOne", "create", "update", "delete"],
    },
    product: {
      category: ["find", "findOne", "create", "update", "delete"],
      item: ["find", "findOne", "create", "update", "delete"],
    },
    reporting: {
      cargo: ["find", "findOne", "create", "update", "delete"],
      movement: ["find", "findOne", "create", "update", "delete"],
      shipment: ["find", "findOne", "create", "update", "delete"],
    },
    team: {
      member: ["find", "findOne", "create", "update", "delete"],
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
