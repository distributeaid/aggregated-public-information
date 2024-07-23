# ReportingModelReadMe

## Table of Contents
- [Overview](#overview)
- [Strapi Environment Setup](#strapi-environment-setup)
- [Grouping Models](#grouping-models)
- [Reporting Models](#reporting-models)
- [Group Model](#group-model)
- [Functions](#functions)
- [Bulk Entry](#bulk-entry)
- [Data Sources](#data-sources)
- [Troubleshooting](#troubleshooting)
- [Costs Involved](#costs-involved)
- [Passwords and Credentials](#passwords-and-credentials)
- [Contact Information](#contact-information)

## Overview
This project involves setting up a Strapi environment to manage and report data efficiently. The environment was set up on Gitpod, and all changes are recorded in Distribute Aid's GitHub repository: [aggregated-public-information, branch FinalReportingModels](https://github.com/distributeaid/aggregated-public-information/tree/FinalReportingModels).

Whenever changes are made in Strapi (both front and back end), GitHub records these commits. Some actions also edit documentation files due to the setup. Since these are not relevant, the focus here is on the main files created.

## Strapi Environment Setup
For installing and setting up the Strapi environment, please refer to the [README.md file in the repository](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/README.md).

## Grouping Models
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
Custom functions have been developed to enhance the functionality of the data models by processing inputs according to specific logic.

#### Group Model Function
The group model function processes textual data to create normalized versions of names to ensure consistency across database entries. It strips non-alphanumeric characters and standardizes spacing and capitalization. The specific link to this function's implementation can be found here: [Group Function](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/functions/content-types/group/group.ts)

#### Cargo Model Function
The cargo model function calculates the `itemCount` based on the `packageCount` and `packageUnit`, applying a predefined mapping of volume to units. The details of this function are available here: [Cargo Function](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/functions/content-types/reporting/cargo.ts)

### Index File for Function Mapping
The `index.ts` file in the `src/functions/content-types` folder is important in directing data to the appropriate function based on the content type. This setup allows for a scalable and maintainable codebase as additional models and functions are introduced. The mapping ensures that each data entry is processed through the right function, providing a layer of data validation and preprocessing before persistence.

The structure and logic used in the index file are designed to handle various content types dynamically, accommodating both singular and plural forms of model names. For a closer look at how content types are mapped to their handlers, check the index file here: [Index File](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/src/functions/content-types/index.ts)

## Bulk Entry

### Overview
Using the API is the most efficient way of bulk entering data into Strapi. However, since the API can only post one entry at a time, I wrote a Python script to facilitate bulk entry for the item (product model). This script is uniquely designed for each model according to their required fields, data types, and the alignment of model entity names and data column names. While the code should not be directly used for another model, the concept can be adapted.

### Python Script Explanation
The provided Python script, [bulkEntryItem.py](https://github.com/distributeaid/aggregated-public-information/blob/FinalReportingModels/bulkEntryItem.py), reads data from a CSV file and posts it to the API endpoint. It handles data parsing, type conversions, and validation to ensure that the entries conform to the model's requirements.

### Key Functions and Logic
1. **csv_to_json_entries**: Reads the CSV file and converts it into JSON entries.
    ```python
    def csv_to_json_entries(csv_file_name):
        entries = []
        script_dir = os.path.dirname(os.path.abspath(__file__))
        csv_file_path = os.path.join(script_dir, csv_file_name)
        ...
        return entries
    ```
2. **post_entries_to_api**: Posts the JSON entries to the specified API endpoint.
    ```python
    def post_entries_to_api(entries, api_url, api_key):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        ...
    ```
3. **Data Parsing Functions**: These helper functions (`parse_number`, `parse_integer`, `parse_string`, `parse_enum`, `parse_date`) handle the conversion of CSV data into appropriate types for the API.
    ```python
    def parse_number(value, default=0):
        try:
            return float(value.replace(',', '').replace('$', '')) if value else default
        except (ValueError, TypeError):
            return default
    ```
4. **Category Mapping**: Maps category names from the CSV to their corresponding IDs in the API.
    ```python
    category_mapping = {
        "baby": 13,
        "cleaning": 18,
        "clothing": 12,
        ...
    }
    def get_category_number(category_name):
        return category_mapping.get(category_name.lower())
    ```
5. **Validation**: Ensures that all required fields are present before posting data to the API.
    ```python
    def has_required_fields(entry, required_fields):
        return all(field in entry and entry[field] for field in required_fields)
    ```

### Important Considerations
- **Model-Specific Design**: The script is designed specifically for the item model. It must be adapted for use with other models due to differences in required fields and data types.
- **Category Mapping**: Ensure that the category mapping is up-to-date and includes all relevant categories.
- **Error Handling**: The script includes basic error handling to skip entries with missing or invalid categories and to report failed API requests.

## Data Sources
All the data and model structure used the Distribute Aid's reporting data.

## Troubleshooting
Whenever writing a function, remember to change the controller and index.ts file for the functions to work.
The bulk entry data need to be fitting the data structure of the model for it to work.

## Costs Involved
There is no additional cost needed for this project since it is using the existing platforms.

## Passwords and Credentials
No passwords and credentials are needed. API tokens can be generated in the Strapi settings.

## Contact Information
For any questions or concerns regarding the initial Strapi reporting model development, please contact:
- Name: Ivy
- Email: qianlou.ivy@gmail.com
- GitHub: https://github.com/ItIsIvyLou
