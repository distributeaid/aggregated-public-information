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
    id: survey.id,
    year: survey.year,
    quarter: survey.quarter
  }));

  // Log the consolidated surveys to the terminal
  console.log(consolidatedSurveys);

  return consolidatedSurveys;
}

/*  Parse Surveys
 * ------------------------------------------------------- */

/*  Get Surveys
 * ------------------------------------------------------- */

/*  Upload Surveys
 * ------------------------------------------------------- */