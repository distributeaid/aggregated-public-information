import { STRAPI_ENV } from "../strapi-env";
import { UploadWorkflowStatus } from "../statusCodes";
import {
  Survey,
  NeedAssessment,
  SurveyUploadWorkflow,
  SurveyUploadWorkflowResults,
} from "./types.d";

/*  Add Surveys from Needs Assessment Data
 * ------------------------------------------------------- */
export async function addSurveys(data: NeedAssessment[]): Promise<Survey[]> {
  console.log(
    "Adding NeedsAssessment.Survey from the Needs Assessment data ...",
  );

  const uniqueSurveys = consolidateSurveys(data);

  const results = await Promise.allSettled<SurveyUploadWorkflow>(
    uniqueSurveys.map((survey) => {
      return new Promise<SurveyUploadWorkflow>((resolve, _reject) => {
        resolve({
          data: {
            year: survey.slice(0, 4),
            quarter: survey.slice(5, 7),
            reference: survey.slice(8),
          },
          orig: survey,
          status: UploadWorkflowStatus.PROCESSING,
          logs: [],
        });
      })
        .then(parseSurvey)
        .then(getSurvey)
        .then(uploadSurvey);
    }),
  );

  // { "SUCCESS": [], "ALREADY_EXITS": [], ...}
  const resultsMap: SurveyUploadWorkflowResults = Object.keys(
    UploadWorkflowStatus,
  ).reduce((resultsMap, key) => {
    resultsMap[key] = [];
    return resultsMap;
  }, {} as SurveyUploadWorkflowResults);

  results
    .map((result) => {
      if (isFulfilled(result)) {
        return result.value;
      } else {
        return result.reason;
      }
    })
    .reduce((resultsMap, workflowResult) => {
      if (workflowResult.status) {
        resultsMap[workflowResult.status].push(workflowResult);
      } else {
        resultsMap[UploadWorkflowStatus.OTHER].push(workflowResult);
      }
      return resultsMap;
    }, resultsMap);

  console.log("Add NeedsAssessment.Survey results:");
  Object.keys(resultsMap).forEach((key) => {
    console.log(`     ${key}: ${resultsMap[key].length}`);

    // NOTE: uncomment & set the status key to debug different types of results
    // if (key !== UploadWorkflowStatus.SUCCESS && key !== UploadWorkflowStatus.ALREADY_EXISTS) {
    //   resultsMap[key].forEach((result) => {
    //     console.log(result)
    //     console.log("\n")
    //   })
    // }
  });

  console.log("Adding items completed!");

  const validSurveys: Survey[] = [
    ...resultsMap[UploadWorkflowStatus.SUCCESS],
    ...resultsMap[UploadWorkflowStatus.ALREADY_EXISTS],
  ].reduce((surveys: Survey[], workflow: SurveyUploadWorkflow) => {
    return [...surveys, workflow.data];
  }, [] as Survey[]);

  return validSurveys;
}

const isFulfilled = <T>(
  value: PromiseSettledResult<T>,
): value is PromiseFulfilledResult<T> => {
  return value.status === "fulfilled";
};

const _isRejected = <T>(
  value: PromiseSettledResult<T>,
): value is PromiseRejectedResult => {
  return value.status === "rejected";
};

/*  Consolidate Surveys
 * ------------------------------------------------------- */
function consolidateSurveys(data: NeedAssessment[]): string[] {
  const uniqueSurveys = new Set<string>();

  data.forEach((item) => {
    const surveyString = `${item.survey.year}-${item.survey.quarter}-${item.survey.id}`;
    uniqueSurveys.add(surveyString);
  });
  return Array.from(uniqueSurveys);
}

/*  Parse Surveys
 * ------------------------------------------------------- */
function parseSurvey({
  data,
  orig,
  status,
  logs,
}: SurveyUploadWorkflow): SurveyUploadWorkflow {
  logs = [...logs, `Log: parsing survey "${orig}"`];

  if (orig == null || typeof orig !== "string") {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.ORIGINAL_DATA_INVALID,
      logs: [
        ...logs,
        `Error: Invalid survey input: "${orig}". Expected a non-null value.`,
      ],
    };
  }

  const newData = {
    ...data,
    survey: orig,
  };

  return {
    data: newData,
    orig,
    status,
    logs,
  };
}

/*  Get Surveys
 * ------------------------------------------------------- */
async function getSurvey({
  data,
  orig,
  status,
  logs,
}: SurveyUploadWorkflow): Promise<SurveyUploadWorkflow> {
  logs = [
    ...logs,
    `Log: Checking if NeedsAssessment.Survey "${orig}" already exists.`,
  ];

  //Fetch the data from Strapi
  const response = await fetch(`${STRAPI_ENV.URL}/surveys?`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
  });

  const body = await response.json();
  const matchingSurvey = body.data.find(
    (survey) =>
      survey.year === data.year &&
      survey.quarter === data.quarter &&
      survey.reference === data.reference,
  );

  if (!response.ok) {
    console.log("Non-ok response");
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.DUPLICATE_CHECK_ERROR,
      logs: [
        ...logs,
        `Error: Failed to get NeedsAssessment.Survey. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  if (matchingSurvey) {
    throw {
      data: body.data,
      orig,
      status: UploadWorkflowStatus.ALREADY_EXISTS,
      logs: [
        ...logs,
        "Log: Found existing NeedsAssessment.Survey. Skipping...",
      ],
    };
  }

  return {
    data,
    orig,
    status,
    logs: [
      ...logs,
      "Success: Confirmed NeedsAssessment.Survey does not exist.",
    ],
  };
}

/*  Upload Surveys
 * ------------------------------------------------------- */
async function uploadSurvey({
  data,
  orig,
  /* status, */ logs,
}: SurveyUploadWorkflow): Promise<SurveyUploadWorkflow> {
  logs = [...logs, `Log: Creating NeedsAssessment.Survey "${orig}".`];

  const formattedData = {
    data: {
      year: data.year,
      quarter: data.quarter,
      reference: data.reference,
    },
  };

  const response = await fetch(`${STRAPI_ENV.URL}/surveys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_ENV.KEY}`,
    },
    body: JSON.stringify(formattedData),
  });

  const body = await response.json();

  if (!response.ok) {
    throw {
      data,
      orig,
      status: UploadWorkflowStatus.UPLOAD_ERROR,
      logs: [
        ...logs,
        `Error: Failed to create NeedsAssessment.Survey. HttpStatus: ${response.status} - ${response.statusText}`,
        JSON.stringify(body),
      ],
    };
  }

  return {
    data: {
      ...body.data,
      id: body.data.id,
    },
    orig,
    status: UploadWorkflowStatus.SUCCESS,
    logs: [...logs, "Success: Created NeedsAssessment.Survey."],
  };
}
