export default ({ env }) => ({
  email: {
    config: {
      provider: "strapi-provider-email-resend",
      providerOptions: {
        apiKey: env("RESEND_API_KEY"), // Required
      },
      settings: {
        defaultFrom: env("RESEND_DEFAULT_EMAIL"),
        defaultReplyTo: env("RESEND_USER_EMAIL"),
      },
    },
  },
  slugify: {
    enabled: true,
    config: {
      shouldUpdateSlug: true,
      contentTypes: {
        region: {
          field: "slug",
          references: "name",
        },
        subregion: {
          field: "slug",
          references: "name",
        },
        country: {
          field: "slug",
          references: "code",
        },
      },
    },
  },
});
