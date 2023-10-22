module.exports = ({ env }) => ({
  slugify: {
    enabled: true,
    config: {
      shouldUpdateSlug: true,
      contentTypes: {
        region: {
          field: 'Slug',
          references: 'Name',
        },
        subregion: {
          field: 'Slug',
          references: 'Name',
        },
        country: {
          field: 'Slug',
          references: 'Code',
        }
      },
    },
  },
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