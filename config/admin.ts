export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  watchIgnoreFiles: [
    /* NOTE: this isn't a very specific path, but various combinations of
     * "./src/scripts/**" didn't work. Might need to make it more specific
     * if there's a reason to ever include script files in our Strapi server
     * build. Or better yet just refactor that functioality out of the
     * "src/scripts" folder and import it.
    */
    '**/scripts/**'
  ]
});
