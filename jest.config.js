/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  collectCoverage: true,
  collectCoverageFrom: ["*.ts", "!index.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "json-summary", "lcov"],
};
