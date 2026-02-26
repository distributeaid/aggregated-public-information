import type { Core } from "@strapi/strapi";
import { createPublicApiPermissions } from "./createPublicApiPermissions";
import { subscribeAdminInviteEmail } from "./functions/content-types/group/adminInviteEmail";

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
    subscribeAdminInviteEmail(strapi);
    await createPublicApiPermissions(strapi);
  },
};
