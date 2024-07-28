export default ({ env }) => ({
  connection: {
    client: "sqlite",
    connection: {
      filename: env("TEST_DATABASE_FILENAME", ".tmp/test.db"),
    },
    useNullAsDefault: true,
    debug: false,
  },
});
