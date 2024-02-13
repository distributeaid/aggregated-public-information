const defaultPluginsConfig = require("../../plugins.ts")

module.exports = ({ env }) => ({
  ...defaultPluginsConfig,
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('DO_CDN_URL'),
        rootPath: env('DO_CDN_ROOT_PATH'),
        s3Options: {
          accessKeyId: env('DO_SPACES_ACCESS_KEY_ID'),
          secretAccessKey: env('DO_SPACES_ACCESS_SECRET'),
          endpoint: env('DO_SPACES_ENDPOINT'),
          params: {
            Bucket: env('DO_SPACES_BUCKET'),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});