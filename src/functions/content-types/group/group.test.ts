import { processGroup } from "./group";

describe("processGroup", () => {
    const input1 = "670 WORDS ";
    const input2 = "ɐ  wORD"
    const input3 = "   ɏes"

    const output1 = "670 Words";
    const output2 = "Word"
    const output3 = "Ɏes"

    it("strips names correctly", () => {
        const testData = { 
            shortName: input1,
            groupName: input2,
            groupConvertFrom: input3
        };

        const expectedOutput = {
            shortName: input1,
            groupName: input2,
            groupConvertFrom: input3,
            shortNameStripped: output1,
            groupNameStripped: output2,
            groupConvertFromStripped: output3
        }

        const testDataProcessed = processGroup(testData);
        expect(testDataProcessed).toEqual(expectedOutput);
    })
});