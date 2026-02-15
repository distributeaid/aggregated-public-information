# 🚀 Aggregated Public Information

This project uses [Strapi](https://strapi.io) as a CMS backend.

## Dev Environment Setup

#### Clone this repository

```sh
git clone git@github.com:distributeaid/aggregated-public-information.git
cd aggregated-public-information
```

#### Install nvm 🔧

[TODO: copy version info from next-website]
To develop or contribute to this project, you will need Node.js. We recommend you install [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) to manage Node.js versions.

#### Install yarn 🧶

To build dependencies, you should also have yarn installed on your system.
If it is not yet installed, you can run:

```sh
npm install --global corepack
corepack enable
hash -r
```

## Get Up and Running 🚀

Once you have a development environment, you can set up your local site!

### Set Up Local Private Keys 🔑

```sh
./setup.bash
```

### Install your packages

```sh
yarn install
```

### Start Your Server 🌐

In one terminal, run `develop`, this will live rebuild your application as you make changes:

```sh
yarn develop
```

If you want auto-reload disabled, you can just run `build` and then `start`:

```sh
yarn build
yarn start
```

### Run Server Tests ✅

```sh
yarn test
```

> [!NOTE]
> This depends on your application being built! If you don't run `yarn develop` then you must run `yarn build` after each change before running `yarn test`. We have provided `yarn test:without-build` as a convenience in this case.

### View the Site and Set Up an Admin User 👤

If you are running locally, your site should be available in the output after you run `yarn develop` - you will see something like

```sh
One more thing...
Create your first administrator 💻 by going to the administration panel at:
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
        ``

## Contributing

Before creating a pull request, test a final time and check for errors:

```sh
yarn check:all
```

We provide a couple of scripts to automatically fix linting and formatting issues, where possible:

```sh
yarn lint:fix
yarn format:fix
```

## Learn more 📚

### Strapi

- Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.
- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

[TODO: Laura Z's notes]

## Testing

We use [Bruno](https://www.usebruno.com/) to create and run API tests. See [bruno-test.md](/tests/api-tests/bruno-test.md) for setup and usage instructions.

## Troubleshooting

[TODO: Laura Z has notes! They'll go in contributing and we'll link here]
