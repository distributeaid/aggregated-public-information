import { processGroup } from "./group";

describe("processGroup", () => {
  it("strips shortName correctly", () => {
    const hasShortName = {
      shortName: "670 WORDS ",
    };

    const hasShortNameStripped = {
      shortName: hasShortName.shortName,
      shortNameStripped: "670 Words",
    };

    const stripShortName = processGroup(hasShortName);
    expect(stripShortName).toEqual(hasShortNameStripped);
  });

  it("strips groupName correctly", () => {
    const hasGroupName = {
      groupName: "ɐ  wORD",
    };

    const hasGroupNameStripped = {
      groupName: hasGroupName.groupName,
      groupNameStripped: "Word",
    };

    const stripGroupName = processGroup(hasGroupName);
    expect(stripGroupName).toEqual(hasGroupNameStripped);
  });

  it("strips groupConvertFrom correctly", () => {
    const hasGroupConvertFrom = {
      groupConvertFrom: "   ɏes",
    };

    const hasGroupConvertFromStripped = {
      groupConvertFrom: hasGroupConvertFrom.groupConvertFrom,
      groupConvertFromStripped: "Ɏes",
    };

    const stripGroupConvertFrom = processGroup(hasGroupConvertFrom);
    expect(stripGroupConvertFrom).toEqual(hasGroupConvertFromStripped);
  });
});
