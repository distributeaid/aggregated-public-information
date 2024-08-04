export default ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
  },
  autoOpen: !env.bool("NO_OPEN_BROWSER", false),
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT"),
    },
  },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
  },
  watchIgnoreFiles: [
    /* NOTE: this isn't a very specific path, but various combinations of
     * "./src/scripts/**" didn't work. Might need to make it more specific
     * if there's a reason to ever include script files in our Strapi server
     * build. Or better yet just refactor that functioality out of the
     * "src/scripts" folder and import it.
     */
    "**/scripts/**",
  ],
});
