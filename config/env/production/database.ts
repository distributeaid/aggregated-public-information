// from: https://docs.strapi.io/dev-docs/deployment/digitalocean-app-platform
import { parse } from "pg-connection-string";

const { host, port, database, user, password } = parse(
  process.env.DATABASE_URL,
);

export default ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host,
      port,
      database,
      user,
      password,
      ssl: {
        ca: env("DATABASE_CA"),
      },
    },
    debug: false,
  },
});
