import defaultPluginsConfig from "../../plugins";

export default ({ env }) => ({
  ...defaultPluginsConfig,
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: { folder: env("CLOUDINARY_FOLDER"), metadata: "location=unset" },
        uploadStream: { folder: env("CLOUDINARY_FOLDER"), metadata: "location=unset" },
        delete: {},
      },
    },
  },
});
