import path from "path";

export default ({ env }) => ({
  connection: {
    filename: path.join(
      __dirname,
      "..",
      "..",
      "..",
      env("TEST_DATABASE_FILENAME", ".tmp/test_data.db")
    ),
  },
  useNullAsDefault: true,
});
