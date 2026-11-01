# Test Documentation — Dockerizing the Backend Repo for the Strapi CMS

**Purpose:** Record the verification tests performed on the Dockerized Strapi backend to confirm core content-management flows work as expected, and to define the tests still outstanding.

**Status legend:** Passed = verified working in the Dockerized environment. Pending = not yet executed.

> Test IDs (TC-01 … TC-12) were added during restructuring for traceability; the underlying test content is unchanged from the original log.

## Completed Tests

The following four test scenarios were executed against the Dockerized Strapi backend. Each scenario groups related test cases that form a single user journey — steps that must be verified together to confirm an end-to-end flow are combined into one scenario, while distinct, independently-verifiable operations are kept as separate test cases within that scenario.

### Scenario 1: Existing collection schema changes — All Passed

Verifies that direct edits to a collection's `schema.json` are applied correctly within the Dockerized environment.

| ID    | Test Case                                  | Steps                                                                                                              | Expected Result                                                                        | Status |
| ----- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------ |
| TC-01 | Add a field to an existing collection      | Edit `schema.json` for an existing collection to add a new field; restart/rebuild as required by the Docker setup. | New field appears in the collection schema and is available in the Strapi admin panel. | Passed |
| TC-02 | Remove a field from an existing collection | Edit `schema.json` for an existing collection to remove a field; restart/rebuild as required.                      | Field is removed from the collection schema and no longer appears in the admin panel.  | Passed |

### Scenario 2: New collection lifecycle — All Passed

Verifies the end-to-end lifecycle of a newly created collection, from creation through API access. These steps are grouped because they form one continuous user journey.

| ID    | Test Case                             | Steps                                                              | Expected Result                                           | Status |
| ----- | ------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- | ------ |
| TC-03 | Create a new collection               | Create a collection in the Strapi admin panel and save.            | Collection is created and visible in the admin panel.     | Passed |
| TC-04 | Add entries to the new collection     | Add one or more entries to the new collection via the admin panel. | Entries are saved and listed under the collection.        | Passed |
| TC-05 | Verify the API for the new collection | Query the collection's REST API endpoint for the added entries.    | API returns the expected entries with correct data shape. | Passed |

### Scenario 3: Collection renamed to follow a two-level naming structure (CoreConcept.SpecificAspect) — All Passed

Verifies renaming a collection to the two-level naming structure CoreConcept.SpecificAspect so it sits under an already existing CoreConcept. The full sequence is one cohesive test because each step depends on the previous one.

| ID    | Test Case                                           | Steps                                                                                                                                                                                                                                                                                                                                                                            | Expected Result                                                                                                                                                                          | Status |
| ----- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| TC-06 | Rename a collection into CoreConcept.SpecificAspect | 1) Create a collection in the Strapi admin panel.<br>2) Using the command line in Docker Desktop, follow the repo documentation to rename the collection and place it under an already existing CoreConcept.<br>3) Delete the initial collection via file removal in VS Code.<br>4) Add an entry to the newly renamed collection.<br>5) Test the API for the renamed collection. | Renamed collection appears under the existing CoreConcept, the original collection is removed, the new entry is saved, and the API returns the expected data for the renamed collection. | Passed |

### Scenario 4: Component creation and API validation — All Passed

Verifies the end-to-end flow of creating a reusable component, attaching it to a collection, populating it, and confirming the API response. Grouped because the steps form a single integration journey.

| ID    | Test Case                                            | Steps                                                           | Expected Result                                        | Status |
| ----- | ---------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| TC-07 | Create a component                                   | Create a new component in the Strapi admin panel.               | Component is created and available for reuse.          | Passed |
| TC-08 | Add the component to a collection                    | Attach the new component to a collection's schema.              | Component field is available in the collection schema. | Passed |
| TC-09 | Add entries using the new component                  | Add entries to the collection that include the new component.   | Entries with the component data are saved.             | Passed |
| TC-10 | Verify the API for the collection with the component | Query the REST API for the collection containing the component. | API returns the component data nested correctly.       | Passed |

## Tests Left to Complete

The following rename operations were not yet executed. They are kept as separate test cases because changing the CoreConcept (prefix) versus the SpecificAspect (suffix) of the two-level naming structure can affect different generated files, routes, and API behaviour, and should be verified independently.

| ID    | Test Case                                                                | Steps                                                                                                                                                          | Expected Result                                                                                                                              | Status  |
| ----- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| TC-11 | Rename by modifying the CoreConcept in the two-level naming structure    | Rename an existing two-level named collection by changing its CoreConcept (prefix) portion; rebuild/restart as required and verify the admin panel and API.    | Collection moves under the new CoreConcept; admin panel, routes, and API reflect the change with no orphaned references.                     | Pending |
| TC-12 | Rename by modifying the SpecificAspect in the two-level naming structure | Rename an existing two-level named collection by changing its SpecificAspect (suffix) portion; rebuild/restart as required and verify the admin panel and API. | Collection's SpecificAspect updates under the same CoreConcept; admin panel, routes, and API reflect the change with no orphaned references. | Pending |

## Recommended Additional Coverage

Generated by AI. Not part of the originally documented scope, but suggested to strengthen coverage of the Dockerized backend. These are recommendations only and can be prioritized after TC-11 and TC-12 are complete.

- **Container restart persistence:** Confirm schema and content changes survive a Docker container restart/rebuild (volumes and persistence).
- **Database rebuild from schema:** Verify that a `schema.json` change correctly triggers a database rebuild and does not leave stale tables or orphaned columns.
- **Concurrent edits / file-removal safety:** Verify that removing a collection via file deletion in VS Code does not break referencing components or relations.
- **Error and rollback behaviour:** Capture the observed error and rollback path when a rename or schema edit is malformed.
