# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

# 🚀 Getting started with Gitpod
Gitpod provides a fully automated development environment for your Strapi project, and the development environment is set up with just a single click. Follow these steps to get started:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/distributeaid/aggregated-public-information)

1. Click the ``Open in Gitpod`` button above. Note: you'll need to have an account on [Gitpod](https://gitpod.io/login/) before proceeding with the next steps (this requires a GitHub account)..
2. Click the `Continue` button.
3. Relax, a development environment is being set up for you in the first terminal. There's currently a bug that will stop the setup from being completed, but we'll fix that in the next steps.
4. Create a new file called `.env` to store the environment variables.
5. Copy and paste the content from the `.env.example` file into the `.env` file you just created.
6. Open a new terminal and paste this code inside `openssl rand -base64 16`. This generates a secret key that will be used inside the env file.

**Note:** Do not copy or use the generated keys that have `plus` or `forward slash` in them. Only copy the ones with `numbers`, `alphabets` and `equals`.

7. Copy the generated key and locate the lines in `.env` file that have `key{number}==`. Remove the dummy keys `key{number}==` and replace them with the generated key. The `{number}` is from 1 to 8.
8. Each of the `key{number}==` placeholder has to be replaced with a generated key so you have to run `Step 6` until all the dummy keys have been removed.
9. After running these steps, you can then start the build to build the admin panel by running `yarn build`.
10. Run `yarn develop`. This starts the development server at [http://localhost:1337/admin](http://localhost:1337/admin)



## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
