import type { Core } from "@strapi/strapi";

const INVITE_SUBJECT = "You're invited to Distribute Aid";

const toUrl = (value: unknown): URL | null => {
  if (typeof value !== "string" || value.trim().length === 0) return null;

  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const getUsersPermissionsRedirectUrl = async (
  strapi: Core.Strapi,
): Promise<URL | null> => {
  const advancedSettings = (await strapi
    .store({ type: "plugin", name: "users-permissions", key: "advanced" })
    .get()) as {
    email_confirmation_redirection?: unknown;
  } | null;

  return toUrl(advancedSettings?.email_confirmation_redirection);
};

const buildInviteUrl = (baseUrl: URL, registrationToken: string): URL => {
  const inviteUrl = new URL(baseUrl.toString());
  inviteUrl.searchParams.set("registrationToken", registrationToken);
  return inviteUrl;
};

export const subscribeAdminInviteEmail = (strapi: Core.Strapi) => {
  strapi.db.lifecycles.subscribe({
    models: ["admin::user"],
    async afterCreate(event) {
      const user = event.result as {
        email?: string;
        firstname?: string | null;
        registrationToken?: string | null;
      };

      if (!user?.email || !user.registrationToken) return;

      const usersPermissionsRedirectUrl =
        await getUsersPermissionsRedirectUrl(strapi);

      if (!usersPermissionsRedirectUrl) {
        strapi.log.warn(
          "Skipping admin invite email: users-permissions email confirmation redirection URL is not configured.",
        );
        return;
      }

      const inviteUrl = buildInviteUrl(
        usersPermissionsRedirectUrl,
        user.registrationToken,
      );

      const displayName = user.firstname?.trim() || "there";
      const text = `Hi ${displayName},\n\nYou've been invited to join Distribute Aid. Complete your account setup here:\n${inviteUrl.toString()}\n\nIf you were not expecting this invitation, you can ignore this email.`;

      await strapi
        .plugin("email")
        .service("email")
        .send({
          to: user.email,
          subject: INVITE_SUBJECT,
          text,
        })
        .catch((error: unknown) => {
          strapi.log.error(
            `Failed to send admin invite email to ${user.email}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        });
    },
  });
};
