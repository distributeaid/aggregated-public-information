export function processSurvey(data: { year: string; quarter: string }) {
  return {
    ...data,
    yearQuarter: `${data.year} - ${data.quarter}`,
  };
}
