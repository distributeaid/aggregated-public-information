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
- **Content-Type File:** [Shipment Content Type](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/content-types/schema.json)
- **Controller:** [Shipment Controller](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/controllers/shipment.ts)

### Movement Model
- **Content-Type File:** [Movement Content Type](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/content-types/schema.json)
- **Controller:** [Movement Controller](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/controllers/movement.ts)

### Cargo Model
- **Content-Type File:** [Cargo Content Type](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/content-types/schema.json)
- **Controller:** [Cargo Controller](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/reporting/controllers/cargo.ts)

## Group Model

### Group Model
- **Content-Type File:** [Group Content Type](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/group/content-types/schema.json)
- **Controller:** [Group Controller](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/api/group/controllers/group.ts)

## Functions

### Overview
This section details the functions implemented in the `src/functions/content-types` folder for data processing and manipulation, facilitating both Content Manager and API interactions with the Strapi models.

### Data Entry Methods
There are two primary ways to enter data into the Strapi models: through the Content Manager and via API. Modifications have been made to the original auto-generated controllers to accommodate both methods, ensuring data entry and updating processes.

### Controllers
Controllers for the following models have been modified to process data using custom functions:
- **Shipment** (Reporting model)
- **Movement** (Reporting model)
- **Cargo** (Reporting model)
- **Country** (Geo model)
- **Category** (Product model)
- **Group**

The modified controllers incorporate custom functions to preprocess data before saving, such as stripping out unnecessary characters from text fields or calculating fields based on other data inputs. The specific changes in these controllers allow them to handle data more efficiently and with greater accuracy.

### Function Implementation
Custom functions have been developed to enhance the functionality of the data models by processing inputs according to specific business logic.

#### Group Model Function
The group model function processes textual data to create normalized versions of names to ensure consistency across database entries. It strips non-alphanumeric characters and standardizes spacing and capitalization. The specific link to this function's implementation can be found here: [Group Function](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/functions/content-types/group/group.ts)

#### Cargo Model Function
The cargo model function calculates the `itemCount` based on the `packageCount` and `packageUnit`, applying a predefined mapping of volume to units. The details of this function are available here: [Cargo Function](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/functions/content-types/reporting/cargo.ts)

### Index File for Function Mapping
The `index.ts` file in the `src/functions/content-types` folder is important in directing data to the appropriate function based on the content type. This setup allows for a scalable and maintainable codebase as additional models and functions are introduced. The mapping ensures that each data entry is processed through the right function, providing a layer of data validation and preprocessing before persistence.

The structure and logic used in the index file are designed to handle various content types dynamically, accommodating both singular and plural forms of model names. For a closer look at how content types are mapped to their handlers, check the index file here: [Index File](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/functions/content-types/index.ts)

## Contact Information

For any questions or concerns regarding the initial strapi reporting model development, please contact:

- Name: Ivy
- Email: qianlou.ivy@gmail.com
- GitHub: https://github.com/ItIsIvyLou

