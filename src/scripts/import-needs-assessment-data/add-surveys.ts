import { STRAPI_ENV } from "../strapi-env";
import {
  Survey,
  NeedAssessment,
  SurveyUploadWorkflow,
  UploadWorkflowStatus,
  SurveyUploadWorkflowResults,
} from "./types.d";

/*  Add Surveys from Needs Assessment Data
 * ------------------------------------------------------- */

/*  Consolidate Surveys
 * ------------------------------------------------------- */
export function consolidateSurveys(data: NeedAssessment[]): string[] {
  const uniqueSurveys = new Map();

  data.forEach(item => {
    const surveyId = JSON.stringify(item.survey);
    if (!uniqueSurveys.has(surveyId)) {
      uniqueSurveys.set(surveyId, item.survey);
    }
  });

  const consolidatedSurveys = Array.from(uniqueSurveys.values()).map(survey => ({
    // id: survey.id,
    year: survey.year,
    quarter: survey.quarter
  }));

  // Log the consolidated surveys to the terminal
  console.log(consolidatedSurveys);

  return consolidatedSurveys;
}

/*  Parse Surveys
 * ------------------------------------------------------- */
function parseSurvey ({
  data,
  orig, 
  status,
  logs,
}:SurveyUploadWorkflow):SurveyUploadWorkflow {
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
export async function getSurvey({
  data,
  orig = `${data.year}-${data.quarter}`,
  status,
  logs,
}: SurveyUploadWorkflow): Promise<SurveyUploadWorkflow> {
  logs = [...logs, `Log: Checking if NeedsAssessment.Survey "${orig}" already exists.`];

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
      survey.quarter === data.quarter
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

  console.log("Number of matching surveys:", body.data.length);

  if (matchingSurvey) {
    throw {
      data: body.data,
      orig,
      status: UploadWorkflowStatus.ALREADY_EXISTS,
      logs: [...logs, "Log: Found existing NeedsAssessment.Survey. Skipping..."],
    };
  }

  return {
    data,
    orig,
    status,
    logs: [...logs, "Success: Confirmed NeedsAssessment.Survey does not exist."],
  };

}

/*  Upload Surveys
 * ------------------------------------------------------- */