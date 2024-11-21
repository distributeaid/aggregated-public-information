import { processSurvey } from "./survey";

describe("processSurvey", () => {
  it("creates yearQuarter field", () => {
    const survey = { year: "2024", quarter: "Q1", needs: {} };
    const expected = {
      year: "2024",
      quarter: "Q1",
      yearQuearter: "2024 - Q1",
      needs: {},
    };
    const actual = processSurvey(survey);
    expect(actual).toEqual(expected);
  });
});
