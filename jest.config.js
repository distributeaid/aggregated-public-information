/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testPathIgnorePatterns: ["/node_modules/", ".tmp", ".cache"],
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  testEnvironment: "node",
};
