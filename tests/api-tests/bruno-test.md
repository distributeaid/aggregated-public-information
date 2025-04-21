### API Testing with Bruno

This project includes API tests written using [Bruno](https://www.usebruno.com/), an open-source API client and CLI tool designed for testing and managing API collections with a developer-friendly and git-friendly workflow.
The Bruno test collection is located inside tests. Each module is separated in the folder with its related tests.

#### To run the Bruno tests via CLI:

1. Install Bruno CLI (if not already):
   Bruno has its own UI Application, we use the app to create tests. But we do not necessarily need the application. We can run the test from CLI as well.
   ```bash
   npm install -g @usebruno/cli
   ```
2. To run the test, we need to be at the root of a collection.
   If you are running it locally then it can be run simply as:
   ```bash
   cd tests/api-tests/Needs-Assessment && bru run --env Global
   ```
   But if you have different port or you're running the app from Gitpod, update the base_url. Here's example for gitpod:
   ```bash
   cd tests/api-tests/Needs-Assessment && bru run --env Global --env-var base_url=https://1337-distributea-aggregatedp-u2f3iqzwzeh.ws-eu118.gitpod.io
   ```
   Or update the base_url in Global.bru which is inside environments folder
3. If you want to run just a specific folder's test:
   ```bash
    cd tests/api-tests/Needs-Assessment/01-RegionAPI && bru run --env Global
   ```
