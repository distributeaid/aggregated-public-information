# README

This project uses [Strapi](https://strapi.io) as a CMS backend. For most information about contributing to DA (e.g. our dev process and asking for help), please refer first to the [general contributing guide](https://github.com/distributeaid/docs/blob/193d6eaaedb5b9e453f97ae15619d07e6b1e7ba1/how-to-DA/contributing.md). This guide contains other information specific to contributing to this repo.

## Dev Environment Setup

### Clone this repository

```bash
git clone git@github.com:distributeaid/aggregated-public-information.git
cd aggregated-public-information
```

### Install nvm

- [Node.js 18.17 or later](https://nodejs.org/en)
- [Node Version Manager](https://github.com/SpaceyaTech/mentorlst-dashboard/blob/main/README.md) - to update Node.js

### Install yarn

To build dependencies, you should also have yarn installed on your system.
If it is not yet installed, you can run:

```bash
npm install --global corepack
corepack enable
hash -r
```

## Get Up and Running

Once you have a development environment, you can set up your local site!

### Set Up Local Private Keys

```bash
./setup.bash
```

### Install your packages

```bash
yarn install
```

### Start Your Server

In one terminal, run `develop`, this will live rebuild your application as you make changes:

```bash
yarn develop
```

If you want auto-reload disabled, you can just run `build` and then `start`:

```bash
yarn build
yarn start
```

### Run Server Tests

```bash
yarn test
```

> [!NOTE]
> This depends on your application being built! If you don't run `yarn develop` then you must run `yarn build` after each change before running `yarn test`. We have provided `yarn test:without-build` as a convenience in this case.

### View the Site and Set Up an Admin User

If you are running locally, your site should be available in the output after you run `yarn develop` - you will see something like

```
One more thing...
Create your first administrator by going to the administration panel at:
┌─────────────────────────────┐
│ http://localhost:1337/admin │
└─────────────────────────────┘
```

If you run into trouble, please check out:

- [How to reset your password](https://docs.strapi.io/cms/cli#strapi-admin-1)
- To recover the email address you used to sign up, run:

```bash
npx strapi console
await strapi.query('admin::user').findMany()
```

## Contributing

Before creating a pull request, test a final time and check for errors:

```bash
yarn check:all
```

We provide a couple of scripts to automatically fix linting and formatting issues, where possible:

```bash
yarn lint:fix
yarn format:fix
```

## Learn more about Strapi

- Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.
- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

#### API Usage

- [Populate relations](https://docs.strapi.io/cms/api/rest/guides/understanding-populate) – Learn how to populate nested and relational data in Strapi API responses.

## Testing

We use [Bruno](https://www.usebruno.com/) to create and run API tests. See [bruno-test.md](/tests/api-tests/bruno-test.md) for setup and usage instructions.

## Troubleshooting

If you encounter issues during local environment setup, refer to [contributing.md](https://github.com/distributeaid/docs/blob/main/how-to-DA/contributing.md) for troubleshooting guidance. If you need additional support, reach out to the team via [TODO: decide which link to include here - tech-github-slack-channel or another one].
