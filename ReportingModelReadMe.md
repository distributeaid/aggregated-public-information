# ReportingModelReadMe

## Overview
This project involves setting up a Strapi environment to manage and report data efficiently. The environment was set up on Gitpod, and all changes are recorded in Distribute Aid's GitHub repository: [aggregated-public-information, branch FinalReportingModels](https://github.com/distributeaid/aggregated-public-information/tree/FinalReportingModels).

Whenever changes are made in Strapi (both front and back end), GitHub records these commits. Some actions also edit documentation files due to the setup. Since these are not relevant, the focus here is on the main files created.

## Strapi Environment Setup
For setting up the Strapi environment, please refer to the [README.md file in the repository](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/README.md).

## Important Notes
Whenever generating a model in Strapi, it auto-generates the `content-types`, `controller`, `routes`, and `services` folders. To group models (e.g., the reporting models), you need to combine each model's `content-types`, `controllers`, `routes`, and `services` folders to one.

## Reporting Models

### Shipment Model
- **Content-Type File:** [Shipment Content Type](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/content-types/shipment.json)
- **Controller:** [Shipment Controller](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/controllers/shipment.ts)

### Movement Model
- **Content-Type File:** [Movement Content Type](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/content-types/movement.json)
- **Controller:** [Movement Controller](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/controllers/movement.ts)

### Cargo Model
- **Content-Type File:** [Cargo Content Type](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/content-types/cargo.json)
- **Controller:** [Cargo Controller](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/controllers/cargo.ts)

## Group Model

### Group Model
- **Content-Type File:** [Group Content Type](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/group/content-types/group.json)
- **Controller:** [Group Controller](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/group/controllers/group.ts)

## Folder Structure
- **src/api/reporting**: Contains the reporting models (`shipment`, `movement`, `cargo`).
- **src/api/group**: Contains the group model.
- **src/functions/content-types**: Contains functions relevant to different models.
- **src/functions**: Modified `index.ts` file to enable function access.
- **src/api/geo**: Modified `country` controller for intermodel access.
- **src/api/product**: Modified `category` controller for intermodel access.