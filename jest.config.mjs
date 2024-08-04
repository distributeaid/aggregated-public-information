/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testPathIgnorePatterns: ["/node_modules/", ".tmp", ".cache"],
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  testEnvironment: "node",
};
